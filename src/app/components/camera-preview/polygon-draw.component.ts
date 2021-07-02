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

@Component({
  selector: 'polygon-draw',
  template: `
    <div #polygonContainer class="polygon-container" (mousedown)="selectPoint($event)">
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
      .polygon-container {
        &__canvas {
          cursor: crosshair;
        }
      }
    `,
  ],
})
export class PolygonDraw implements AfterViewInit, OnDestroy {
  @Input() public videoTemplate?: HTMLVideoElement;
  @Input() public height?: string;
  @Input() public width?: string;
  @Output() public response = new EventEmitter();
  @ViewChild('polygon') private polygon!: ElementRef;
  @ViewChild('polygonContainer') private polygonContainer!: ElementRef;
  private pointsList: any = [];
  private canvas: any;
  private ctx: any;
  private intervalId: number = 0;
  private areaSelected: boolean = false;
  private areaEmitted: boolean = false;

  constructor(private rd2: Renderer2) {}

  ngOnDestroy(): void {
    this.clearCanvas(this.intervalId);
  }

  ngAfterViewInit(): void {
    this.prepareCanvas(false);
  }

  private prepareCanvas(with_draw: boolean): void {
    this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
    this.intervalId = this.setIntervalAndReturnId();
    this.videoTemplate?.addEventListener('ended', () => {
      this.clearCanvas(this.intervalId);
    });
    with_draw ? this.draw(false) : '';
  }

  private setIntervalAndReturnId(): number {
    const id = window.setInterval(() => {
      this.ctx = this.canvas.getContext('2d');
      this.ctx.drawImage(this.videoTemplate, 0, 0, this.canvas.width, this.canvas.height);
      this.areaSelected ? this.draw(true) : this.draw(false);
      console.log('1');
    }, 20);
    return id;
  }

  private clearCanvas(intervalId: number): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.pointsList = [];
    this.areaEmitted = false;
    this.areaSelected = false;
    window.clearInterval(intervalId);
  }

  private extractScaleFromParentElement(): { scaleX: Number; scaleY: Number } {
    const polygonContainer = this.polygonContainer.nativeElement.getBoundingClientRect();
    return {
      scaleX: Number((polygonContainer.width / this.canvas.width).toFixed(2)),
      scaleY: Number((polygonContainer.height / this.canvas.height).toFixed(2)),
    };
  }

  private point(x: number, y: number) {
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'white';
    this.ctx.fillRect(x - 2, y - 2, 4, 4);
    this.ctx.moveTo(x, y);
  }

  private fillSelectedPolygon(): void {
    this.areaSelected = true;
    this.ctx.lineTo(this.pointsList[0]['x'], this.pointsList[0]['y']);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'blue';
    if (!this.areaEmitted) {
      this.response.emit(this.pointsList);
      this.areaEmitted = true;
    }
  }

  private drawLinesToSelectedPoints(end: boolean): void {
    for (let i = 0; i < this.pointsList.length; i++) {
      if (i == 0) {
        this.ctx.moveTo(this.pointsList[i]['x'], this.pointsList[i]['y']);
        end || this.point(this.pointsList[i]['x'], this.pointsList[i]['y']);
      } else {
        this.ctx.lineTo(this.pointsList[i]['x'], this.pointsList[i]['y']);
        end || this.point(this.pointsList[i]['x'], this.pointsList[i]['y']);
      }
    }
  }

  private draw(end: boolean): void {
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'white';
    this.ctx.lineCap = 'square';
    this.ctx.beginPath();
    this.drawLinesToSelectedPoints(end);
    end ? this.fillSelectedPolygon() : '';
    this.ctx.stroke();
  }

  public selectPoint($event: any): boolean {
    if (this.areaEmitted) {
      this.response.emit('Area already created');
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
      this.response.emit('You need to select at least 3 points!');
      return false;
    }
    this.draw(true);
    $event.preventDefault();
    return false;
  }
}
