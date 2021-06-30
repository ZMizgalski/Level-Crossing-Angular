import { Point } from './../interfaces/areaModel';
import { ElementRef, HostListener, Output, ViewChild } from '@angular/core';
import { Directive } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Directive({
  selector: '[appMousePosition]',
})
export class MousePositionDirecive {
  @Output() onPointTransfer: EventEmitter<Point> = new EventEmitter();
  @HostListener('mousemove', ['$event']) onMouseMove(event: {
    clientX: any;
    clientY: any;
  }) {
    const point: Point = { x: event.clientX, y: event.clientY };
    this.onPointTransfer.emit(point);
  }
}
