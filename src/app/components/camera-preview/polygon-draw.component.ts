import { Router } from '@angular/router';
import { AreaModel, Point } from './../interfaces/areaModel';
import { LoaderService } from './../servieces/loader/loader-service';
import { EndpointService } from './../servieces/endpoint-service';
import { Input, Output, Renderer2, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Component, OnDestroy } from '@angular/core';

export enum Actions {
   VIDEO_ENDED = 0,
   AREA_SELECTED = 1,
   NOT_ENOUGHT_POINTS = 2,
   VIDEO_NOT_FOUND = 3,
   POLICY_ACCEPTED = 4,
   AREA_CHANHED = 5,
}

export interface PolygonResponse {
   action: Actions;
   body?: NewAreaData;
}

export interface NewAreaData {
   areaName: string;
   pointsList: Point[];
}

@Component({
   selector: 'polygon-draw',
   template: `
      <p-confirmDialog key="acceptPolicy" header="Confirmation" icon="pi pi-exclamation-triangle"></p-confirmDialog>
      <div #polygonContainer class="polygon-container" (mousedown)="selectPoint($event)">
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
   @Input() public defaultAreaName?: string;
   @Input() public src?: { data: any; srcChange: boolean } = { data: undefined, srcChange: false };
   @Input() public drawingEnabled: boolean = false;
   @Output() public response = new EventEmitter();
   @ViewChild('polygon') private polygon!: ElementRef;
   @ViewChild('polygonContainer') private polygonContainer!: ElementRef;
   private pointsList: Point[] = [];
   private canvas: any;
   private ctx: any;
   private intervalIds: number[] = [];
   private areaSelected: boolean = false;
   private areaEmitted: boolean = false;
   private imageTemplate!: HTMLImageElement;
   constructor(
      private rd2: Renderer2,
      private endpointService: EndpointService,
      private loaderService: LoaderService,
      private cdr: ChangeDetectorRef,
      private router: Router
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

   private clearCanvas(): void {
      this.ctx != undefined ? this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) : '';
      this.pointsList = [];
      this.areaEmitted = false;
      this.areaSelected = false;
      this.clearAllIntervals(this.intervalIds);
      this.router.navigate(['/view']);
   }

   private clearAllIntervals(intervalList: number[]): void {
      intervalList.forEach(id => {
         window.clearInterval(id);
      });
   }

   ngOnDestroy(): void {
      this.clearCanvas();
      this.loaderService.forceHide = false;
   }

   ngAfterViewInit(): void {
      this.loaderService.forceHide = true;
      this.getVideoSrc();
      this.response.emit({ action: Actions.POLICY_ACCEPTED });
      this.cdr.detectChanges();
   }

   private getVideoSrc(): void {
      this.imageTemplate = document.createElement('img');
      this.imageTemplate.src = this.endpointService.endpointUrl + 'server-stream/' + this.id || '';
      this.prepareCanvas();
   }

   private prepareCanvas(): void {
      this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
      const id = window.setInterval(() => {
         this.ctx = this.canvas.getContext('2d');
         try {
            this.ctx.drawImage(this.imageTemplate, 0, 0, this.canvas.width, this.canvas.height);
         } catch (error) {
            this.clearCanvas();
         }
         this.drawingEnabled ? this.drawOneAreaOnSelect(this.pointsList) : this.drawEachArea(this.areas);
      }, 5);
      this.intervalIds.push(id);
   }

   private drawOneAreaOnSelect(area: Point[]): void {
      this.areaSelected ? this.closeFigureAndFill(area) : this.drawLines(area);
   }

   public selectPoint($event: any): boolean {
      if (!this.drawingEnabled) {
         return false;
      }
      if (this.areaEmitted) {
         this.response.emit({ action: Actions.AREA_SELECTED });
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
         this.response.emit({ action: Actions.NOT_ENOUGHT_POINTS });
         return false;
      }
      const area = { id: this.id || '', area: { areaName: this.defaultAreaName || 'Default Name', pointsList: this.pointsList } };
      !this.areaSelected ? this.areas.push(area) : '';
      $event.preventDefault();
      this.prepareCanvasForNewSelection();
      return false;
   }

   private prepareCanvasForNewSelection(): void {
      this.drawingEnabled = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
      this.response.emit({ action: Actions.AREA_CHANHED, body: { areaName: this.defaultAreaName, pointsList: this.pointsList } });
      this.areaSelected = false;
      this.areaEmitted = false;
      this.pointsList = [];
   }
}
