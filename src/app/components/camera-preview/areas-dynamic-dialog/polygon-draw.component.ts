import {
  Input,
  Output,
  Renderer2,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'polygon-draw',
  template: `
    <div
      #polygonContainer
      class="polygon-container"
      (load)="clearCanvas()"
      (mousedown)="selectPoint($event)"
    >
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
export class PolygonDraw implements AfterViewInit {
  @Input() public videoTemplate?: HTMLVideoElement;
  @Input() public height?: string;
  @Input() public width?: string;
  @Input() public src?: string;
  @Output() public response = new EventEmitter();
  @ViewChild('polygon') private polygon!: ElementRef;
  @ViewChild('polygonContainer') private polygonContainer!: ElementRef;
  public perimeter: any = [];
  public complete = false;
  private canvas: any;
  private ctx: any;
  private intervalId: number = 0;
  private areaSelected: boolean = false;
  private areaEmitted: boolean = false;

  constructor(private rd2: Renderer2) {}

  ngAfterViewInit(): void {
    this.prepareCanvas(false);
  }

  private setInterval(): void {
    this.intervalId = window.setInterval(() => {
      this.ctx = this.canvas.getContext('2d');
      this.ctx.drawImage(
        this.videoTemplate,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.areaSelected ? this.draw(true) : this.draw(false);
    }, 20);
  }

  private prepareCanvas(with_draw: boolean): void {
    this.canvas = this.rd2.selectRootElement(this.polygon.nativeElement);
    if (this.videoTemplate != undefined) {
      this.videoTemplate.onload = () => {
        this.setInterval();
      };
    }
    this.setInterval();
    this.videoTemplate?.addEventListener('ended', () => {
      this.clearCanvas();
    });
    if (with_draw) {
      this.draw(false);
    }
  }

  public clearCanvas(): void {
    this.areaEmitted = false;
    this.areaEmitted = false;
    this.ctx = undefined;
    window.clearInterval(this.intervalId);
    this.perimeter = [];
    this.complete = false;
    this.prepareCanvas(false);
  }

  public selectPoint($event: any): boolean {
    if (this.complete) {
      this.response.emit('Area already created');
      return false;
    }
    const polygonContainer =
      this.polygonContainer.nativeElement.getBoundingClientRect();

    const scaleX = Number(
      (polygonContainer.width / this.canvas.width).toFixed(2)
    );
    const scaleY = Number(
      (polygonContainer.height / this.canvas.height).toFixed(2)
    );

    let rect, clientX, clientY;
    if ($event.ctrlKey || $event.which === 3 || $event.button === 2) {
      if (this.perimeter.length <= 2) {
        this.response.emit('You need to select at least 3 points!');
        return false;
      }
      clientX = this.perimeter[0]['x'] / scaleX;
      clientY = this.perimeter[0]['y'] / scaleY;
      if (this.check_intersect(clientX, clientY)) {
        this.response.emit('line intersecrion');
        return false;
      }
      this.draw(true);
      $event.preventDefault();
      return false;
    } else {
      rect = this.canvas.getBoundingClientRect();
      clientX = ($event.clientX - rect.left) / scaleX;
      clientY = ($event.clientY - rect.top) / scaleY;
      if (
        this.perimeter.length > 0 &&
        clientX == this.perimeter[this.perimeter.length - 1]['x'] &&
        clientY == this.perimeter[this.perimeter.length - 1]['y']
      ) {
        return false;
      }
      if (this.check_intersect(clientX, clientY)) {
        this.response.emit('line intersection');
        return false;
      }
      this.perimeter.push({
        x: clientX,
        y: clientY,
      });
      this.draw(false);
      return false;
    }
  }

  private point(x: number, y: number) {
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'white';
    this.ctx.fillRect(x - 2, y - 2, 4, 4);
    this.ctx.moveTo(x, y);
  }

  undo() {
    this.ctx = undefined;
    this.perimeter.pop();
    this.complete = false;
    this.prepareCanvas(false);
  }

  private draw(end: boolean): void {
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'white';
    this.ctx.lineCap = 'square';
    this.ctx.beginPath();

    for (let i = 0; i < this.perimeter.length; i++) {
      if (i == 0) {
        this.ctx.moveTo(this.perimeter[i]['x'], this.perimeter[i]['y']);
        end || this.point(this.perimeter[i]['x'], this.perimeter[i]['y']);
      } else {
        this.ctx.lineTo(this.perimeter[i]['x'], this.perimeter[i]['y']);
        end || this.point(this.perimeter[i]['x'], this.perimeter[i]['y']);
      }
    }
    if (end) {
      this.areaSelected = true;
      this.ctx.lineTo(this.perimeter[0]['x'], this.perimeter[0]['y']);
      this.ctx.closePath();
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'blue';
      this.complete = true;
      if (!this.areaEmitted) {
        this.response.emit(this.perimeter);
        this.areaEmitted = true;
      }
    }
    this.ctx.stroke();
  }

  private check_intersect(x: any, y: any) {
    if (this.perimeter.length < 4) {
      return false;
    }
    let p0: any = [];
    let p1: any = [];
    let p2: any = [];
    let p3: any = [];

    p2['x'] = this.perimeter[this.perimeter.length - 1]['x'];
    p2['y'] = this.perimeter[this.perimeter.length - 1]['y'];
    p3['x'] = x;
    p3['y'] = y;

    for (let i = 0; i < this.perimeter.length - 1; i++) {
      p0['x'] = this.perimeter[i]['x'];
      p0['y'] = this.perimeter[i]['y'];
      p1['x'] = this.perimeter[i + 1]['x'];
      p1['y'] = this.perimeter[i + 1]['y'];
      if (p1['x'] == p2['x'] && p1['y'] == p2['y']) {
        continue;
      }
      if (p0['x'] == p3['x'] && p0['y'] == p3['y']) {
        continue;
      }
    }
    return false;
  }
}
