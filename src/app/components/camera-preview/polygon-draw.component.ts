import { ConfirmationService } from 'primeng/api';
import { EndpointService } from './../servieces/endpoint-service';
import {
  Input,
  Output,
  Renderer2,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Component, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

export enum Actions {
  VIDEO_ENDED = 0,
  AREA_SELECTED = 1,
  NOT_ENOUGHT_POINTS = 2,
  VIDEO_NOT_FOUND = 3,
}

@Component({
  selector: 'polygon-draw',
  template: `
    <p-confirmDialog header="Confirmation" icon="pi pi-exclamation-triangle"></p-confirmDialog>
    <div #polygonContainer class="polygon-container" (mousedown)="selectPoint($event)">
      <div *ngIf="!show" class="polygon-container-spinner">
        <i class="pi pi-spin pi-spinner polygon-container-spinner__icon"></i>
        <button
          *ngIf="!policyAccepted"
          class="polygon-container-spinner__button"
          pButton
          label="Accept"
          icon="pi pi-check"
          (click)="acceptCrossPolicy()"
        ></button>
      </div>
      <canvas
        class="polygon-container__canvas"
        #polygon
        style="max-width: 100%;"
        width="{{ width || '640' }}"
        height="{{ height || '480' }}"
        oncontextmenu="return false;"
      >
        Your browser not supports canvas</canvas
      >
    </div>
  `,
  styles: [
    `
      @import '../colors.scss';
      @import '../fonts.scss';

      @media screen and (max-width: 450px) {
        .polygon-container-spinner__icon {
          font-size: $font-size-small !important;
        }
      }

      .polygon-container {
        height: 100%;
        width: 100%;
        display: flex;
        position: relative;
        background: black;
        border-radius: 5px;

        &-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 50%;
          pointer-events: none;
          left: 50%;
          transform: translate(-50%, -50%);
          background: transparent;
          &__icon {
            font-size: $font-size-big;
            transition: 0.2s ease;
            color: $Brighter-Blue;
            padding: 10px;
            background: transparent;
          }

          &__button {
            pointer-events: all;
          }
        }

        &__canvas {
          border-radius: inherit;
          cursor: crosshair;
        }
      }
    `,
  ],
})
export class PolygonDraw implements AfterViewInit, OnDestroy {
  @Input() public selectedAreaColor?: string;
  @Input() public lineWidth?: string;
  @Input() public selectedAreaBorderColor?: string;
  @Input() public lineColor?: string;
  @Input() public id?: string;
  @Input() public height?: string;
  @Input() public width?: string;
  @Output() public response = new EventEmitter();
  @ViewChild('polygon') private polygon!: ElementRef;
  @ViewChild('polygonContainer') private polygonContainer!: ElementRef;
  public show: boolean = true;
  private pointsList: any = [];
  private canvas: any;
  private ctx: any;
  private intervalId: number[] = [];
  private areaSelected: boolean = false;
  private areaEmitted: boolean = false;
  private videoTemplate!: HTMLVideoElement;
  public policyAccepted: boolean = false;

  constructor(
    private rd2: Renderer2,
    private endpointService: EndpointService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnDestroy(): void {
    this.clearCanvas(this.intervalId);
  }

  ngAfterViewInit(): void {
    this.getVideoAndSetupCanvas(false);
  }

  private checkIfCanvasIsBlank(canvas: any): boolean {
    return !canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.some((channel: number) => channel !== 0);
  }

  public acceptCrossPolicy(): void {
    this.confirmationService.confirm({
      message: 'To access video playback you need to accept Cross-Policy requirements',
      accept: () => {
        this.videoTemplate.play();
        this.policyAccepted = true;
      },
    });
  }

  private getVideoAndSetupCanvas(with_draw: boolean): void {
    this.endpointService.getCameraLiveVideoById(this.id || '').subscribe(
      (response: HttpResponse<Blob>) => {
        this.videoTemplate = document.createElement('video');
        this.videoTemplate.src = URL.createObjectURL(response.body);
        this.videoTemplate.autoplay = true;
        const promise = this.videoTemplate.play();
        if (promise !== undefined) {
          promise.catch(() => {
            this.policyAccepted = false;
            this.acceptCrossPolicy();
          });
        }
        this.policyAccepted = true;
        this.prepareCanvas(with_draw);
      },
      error => {
        console.log(error);
        return;
      }
    );
  }

  private clearCanvas(intervalId: number[]): void {
    this.ctx != undefined ? this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) : '';
    this.pointsList = [];
    this.areaEmitted = false;
    this.areaSelected = false;
    intervalId.forEach(id => {
      window.clearInterval(id);
    });
  }

  private setIntervalAndReturnId(): number {
    const id = window.setInterval(() => {
      this.ctx = this.canvas.getContext('2d');
      this.ctx.drawImage(this.videoTemplate, 0, 0, this.canvas.width, this.canvas.height);
      this.areaSelected ? this.draw(true) : this.draw(false);
      this.checkIfCanvasIsBlank(this.canvas) ? (this.show = false) : (this.show = true);
    }, 200);
    return id;
  }

  private prepareCanvas(with_draw: boolean): void {
    this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
    if (this.show) {
      this.intervalId.push(this.setIntervalAndReturnId());
      this.show = false;
    }
    this.videoTemplate?.addEventListener('ended', () => {
      this.getVideoAndSetupCanvas(true);
      this.response.emit(Actions.VIDEO_ENDED);
    });
    with_draw ? this.draw(false) : '';
  }

  private extractScaleFromParentElement(): { scaleX: Number; scaleY: Number } {
    const polygonContainer = this.polygonContainer.nativeElement.getBoundingClientRect();
    return {
      scaleX: Number((polygonContainer.width / this.canvas.width).toFixed(2)),
      scaleY: Number((polygonContainer.height / this.canvas.height).toFixed(2)),
    };
  }

  private draw(end: boolean): void {
    const color = this.lineColor == undefined ? 'white' : this.lineColor;
    const lineWidth = this.lineWidth == undefined ? 3 : Number(this.lineWidth);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.lineCap = 'square';
    this.ctx.beginPath();
    this.drawLinesToSelectedPoints(end);
    end ? this.fillSelectedPolygon() : '';
    this.ctx.stroke();
  }

  private drawRectOnClick(x: number, y: number) {
    const color = this.lineColor == undefined ? 'white' : this.lineColor;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.fillRect(x - 2, y - 2, 4, 4);
    this.ctx.moveTo(x, y);
  }

  private drawLinesToSelectedPoints(end: boolean): void {
    for (let i = 0; i < this.pointsList.length; i++) {
      if (i == 0) {
        this.ctx.moveTo(this.pointsList[i]['x'], this.pointsList[i]['y']);
        end || this.drawRectOnClick(this.pointsList[i]['x'], this.pointsList[i]['y']);
      } else {
        this.ctx.lineTo(this.pointsList[i]['x'], this.pointsList[i]['y']);
        end || this.drawRectOnClick(this.pointsList[i]['x'], this.pointsList[i]['y']);
      }
    }
  }

  private fillSelectedPolygon(): void {
    const selectedAreaColor =
      this.selectedAreaColor == undefined ? 'rgba(255, 0, 0, 0.5)' : this.selectedAreaColor;
    const selectedAreaBorderColor =
      this.selectedAreaBorderColor == undefined ? 'blue' : this.selectedAreaBorderColor;
    this.areaSelected = true;
    this.ctx.lineTo(this.pointsList[0]['x'], this.pointsList[0]['y']);
    this.ctx.closePath();
    this.ctx.fillStyle = selectedAreaColor;
    this.ctx.fill();
    this.ctx.strokeStyle = selectedAreaBorderColor;
    if (!this.areaEmitted) {
      this.response.emit(this.pointsList);
      this.areaEmitted = true;
    }
  }

  public selectPoint($event: any): boolean {
    if (!this.show) {
      this.response.emit(Actions.VIDEO_NOT_FOUND);
      return false;
    }
    if (this.areaEmitted) {
      this.response.emit(Actions.AREA_SELECTED);
      return false;
    }
    return $event.which === 3 || $event.button === 2
      ? this.onRightMouseClick($event)
      : this.onLeftMouseClick($event);
  }

  private onLeftMouseClick($event: any): boolean {
    const videoScales = this.extractScaleFromParentElement();
    let clientX, clientY;
    let rect = this.canvas.getBoundingClientRect();
    clientX = ($event.clientX - rect.left) / Number(videoScales.scaleX);
    clientY = ($event.clientY - rect.top) / Number(videoScales.scaleY);
    if (
      this.pointsList.length > 0 &&
      clientX == this.pointsList[this.pointsList.length - 1]['x'] &&
      clientY == this.pointsList[this.pointsList.length - 1]['y']
    ) {
      return false;
    }
    this.pointsList.push({
      x: clientX,
      y: clientY,
    });
    this.draw(false);
    return false;
  }

  private onRightMouseClick($event: any): boolean {
    if (this.pointsList.length <= 2) {
      this.response.emit(Actions.NOT_ENOUGHT_POINTS);
      return false;
    }
    this.draw(true);
    console.log(this.pointsList);
    $event.preventDefault();
    return false;
  }
}
