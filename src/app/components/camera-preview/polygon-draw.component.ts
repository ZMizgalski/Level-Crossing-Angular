import { AreaModel, Point } from './../interfaces/areaModel';
import { LoaderService } from './../servieces/loader/loader-service';
import { ConfirmationService } from 'primeng/api';
import { EndpointService } from './../servieces/endpoint-service';
import { Input, Output, Renderer2, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Component, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

export enum Actions {
   VIDEO_ENDED = 0,
   AREA_SELECTED = 1,
   NOT_ENOUGHT_POINTS = 2,
   VIDEO_NOT_FOUND = 3,
   POLICY_ACCEPTED = 4,
   AREA_CHANHED = 5,
}

@Component({
   selector: 'polygon-draw',
   template: `
      <p-confirmDialog header="Confirmation" icon="pi pi-exclamation-triangle"></p-confirmDialog>
      <div #polygonContainer class="polygon-container" (mousedown)="selectPoint($event)">
         <div class="polygon-container-spinner">
            <i *ngIf="!videoLoaded && policyAccepted" class="pi pi-spin pi-spinner polygon-container-spinner__icon"></i>
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
            [ngStyle]="{ 'pointer-events': drawingEnabled ? 'all' : 'none' }"
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
   @Input() public areas: AreaModel[] = [];
   @Input() public selectedAreaColor?: string;
   @Input() public lineWidth?: string;
   @Input() public selectedAreaBorderColor?: string;
   @Input() public lineColor?: string;
   @Input() public id?: string;
   @Input() public height?: string;
   @Input() public width?: string;
   @Input() public drawingEnabled: boolean = false;
   @Output() public response = new EventEmitter();
   @ViewChild('polygon') private polygon!: ElementRef;
   @ViewChild('polygonContainer') private polygonContainer!: ElementRef;
   public videoLoaded: boolean = false;
   private pointsList: any[] = [];
   private canvas: any;
   private ctx: any;
   private intervalId: number[] = [];
   private areaSelected: boolean = false;
   private areaEmitted: boolean = false;
   private videoTemplate!: HTMLVideoElement;
   public policyAccepted: boolean = false;
   public windowClosed: boolean = false;
   constructor(
      private rd2: Renderer2,
      private endpointService: EndpointService,
      private confirmationService: ConfirmationService,
      private loaderService: LoaderService,
      private cdr: ChangeDetectorRef
   ) {}

   private closeFigureAndFill(points: Point[]): void {
      const selectedAreaColor = this.selectedAreaColor == undefined ? 'rgba(255, 0, 0, 0.5)' : this.selectedAreaColor;
      const selectedAreaBorderColor = this.selectedAreaBorderColor == undefined ? 'blue' : this.selectedAreaBorderColor;
      this.ctx.lineTo(points[0]['x'], points[0]['y']);
      this.ctx.closePath();
      this.ctx.fillStyle = selectedAreaColor;
      this.ctx.fill();
      this.ctx.strokeStyle = selectedAreaBorderColor;
      this.ctx.stroke();
   }

   private drawLines(points: Point[]): void {
      const color = this.lineColor == undefined ? 'white' : this.lineColor;
      const lineWidth = this.lineWidth == undefined ? 3 : Number(this.lineWidth);
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = color;
      this.ctx.lineCap = 'square';
      this.ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
         console.log();
         i == 0 ? this.ctx.moveTo(points[i]['x'], points[i]['y']) : this.ctx.lineTo(points[i]['x'], points[i]['y']);
      }
      this.ctx.stroke();
   }

   private drawEachArea(areas: AreaModel[]): void {
      if (areas !== []) {
         areas.forEach((area: AreaModel) => {
            if (area.area?.pointsList !== undefined) {
               this.drawLines(area.area.pointsList);
               this.closeFigureAndFill(area.area.pointsList);
            }
         });
      }
   }

   private clearCanvas(intervalId: number[]): void {
      this.videoLoaded = false;
      this.windowClosed = true;
      this.ctx != undefined ? this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) : '';
      this.pointsList = [];
      this.areaEmitted = false;
      this.areaSelected = false;
      this.clearAllIntervals(intervalId);
   }

   private clearAllIntervals(intervalList: number[]): void {
      intervalList.forEach(id => {
         window.clearInterval(id);
      });
   }

   ngOnDestroy(): void {
      this.clearCanvas(this.intervalId);
      this.loaderService.forceHide = false;
   }

   ngAfterViewInit(): void {
      this.loaderService.forceHide = true;
      this.acceptCrossPolicy();
      this.cdr.detectChanges();
   }

   public acceptCrossPolicy(): void {
      this.confirmationService.confirm({
         message: 'To access video playback you need to accept Cross-Policy requirements',
         accept: () => {
            this.policyAccepted = true;
            this.createVideoAndWaitForPolicy();
            this.response.emit(Actions.POLICY_ACCEPTED);
         },
         reject: () => {
            this.policyAccepted = false;
            return;
         },
      });
   }

   private createVideoAndWaitForPolicy(): void {
      this.endpointService.getCameraLiveVideoById(this.id || '').subscribe(
         (response: HttpResponse<Blob>) => {
            this.videoTemplate = document.createElement('video');
            this.videoTemplate.src = URL.createObjectURL(response.body);
            this.videoTemplate.autoplay = true;
            this.prepareCanvas();
         },
         () => {
            this.clearAllIntervals(this.intervalId);
            this.policyAccepted = false;
            this.videoLoaded = false;
            return;
         }
      );
   }

   private prepareCanvas(): void {
      this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
      this.intervalId.push(this.setIntervalAndReturnId());
      this.onVideoEnd();
   }

   private onVideoEnd(): void {
      this.videoTemplate?.addEventListener('ended', () => {
         this.clearAllIntervals(this.intervalId);
         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
         this.videoLoaded = false;
         !this.windowClosed ? this.createVideoAndWaitForPolicy() : '';
         this.response.emit(Actions.VIDEO_ENDED);
      });
   }

   private setIntervalAndReturnId(): number {
      this.areaSelected = false;
      this.areaEmitted = false;
      this.pointsList = [];
      const id = window.setInterval(() => {
         this.ctx = this.canvas.getContext('2d');
         this.ctx.drawImage(this.videoTemplate, 0, 0, this.canvas.width, this.canvas.height);
         this.drawingEnabled ? this.drawOneAreaOnSelect(this.pointsList) : this.drawEachArea(this.areas);
         this.checkIfCanvasIsBlank(this.canvas) ? (this.videoLoaded = false) : (this.videoLoaded = true);
         console.log('1');
      }, 200);
      return id;
   }

   private drawOneAreaOnSelect(area: Point[]): void {
      this.areaSelected ? this.closeFigureAndFill(area) : this.drawLines(area);
   }

   private checkIfCanvasIsBlank(canvas: any): boolean {
      return !canvas
         .getContext('2d')
         .getImageData(0, 0, canvas.width, canvas.height)
         .data.some((channel: number) => channel !== 0);
   }

   public selectPoint($event: any): boolean {
      if (!this.drawingEnabled) {
         return false;
      }
      if (!this.videoLoaded) {
         this.response.emit(Actions.VIDEO_NOT_FOUND);
         return false;
      }
      if (this.areaEmitted) {
         this.response.emit(Actions.AREA_SELECTED);
         return false;
      }
      return $event.which === 3 || $event.button === 2 ? this.onRightMouseClick($event) : this.onLeftMouseClick($event);
   }

   private extractScaleFromParentElement(): { scaleX: Number; scaleY: Number } {
      const polygonContainer = this.polygonContainer.nativeElement.getBoundingClientRect();
      return {
         scaleX: Number((polygonContainer.width / this.canvas.width).toFixed(2)),
         scaleY: Number((polygonContainer.height / this.canvas.height).toFixed(2)),
      };
   }

   private onLeftMouseClick($event: any): boolean {
      const videoScales = this.extractScaleFromParentElement();
      const clientCordinates = this.calculateScaleForPoint($event, this.canvas.getBoundingClientRect(), videoScales);
      if (this.checkIfPointIsTheSame(clientCordinates.clientX, clientCordinates.clientY)) {
         return false;
      }
      this.pointsList.push({
         x: clientCordinates.clientX,
         y: clientCordinates.clientY,
      });
      return false;
   }

   private calculateScaleForPoint(
      $event: any,
      rect: any,
      videoScales: { scaleX: Number; scaleY: Number }
   ): { clientX: Number; clientY: Number } {
      return {
         clientX: ($event.clientX - rect.left) / Number(videoScales.scaleX),
         clientY: ($event.clientY - rect.top) / Number(videoScales.scaleY),
      };
   }

   private checkIfPointIsTheSame(clientX: Number, clientY: Number): boolean {
      return (
         this.pointsList.length > 0 &&
         clientX == this.pointsList[this.pointsList.length - 1]['x'] &&
         clientY == this.pointsList[this.pointsList.length - 1]['y']
      );
   }

   private onRightMouseClick($event: any): boolean {
      if (this.pointsList.length <= 2) {
         this.response.emit(Actions.NOT_ENOUGHT_POINTS);
         return false;
      }
      const area = { id: this.id || '', area: { areaName: 'elo222', pointsList: this.pointsList } };
      !this.areaSelected ? this.areas.push(area) : '';
      $event.preventDefault();
      this.drawingEnabled = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
      this.areaSelected = false;
      this.areaEmitted = false;
      this.pointsList = [];
      this.response.emit(Actions.AREA_CHANHED);
      return false;
   }
}
