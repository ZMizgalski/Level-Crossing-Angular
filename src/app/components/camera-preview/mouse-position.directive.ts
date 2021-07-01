import { Point } from './../interfaces/areaModel';
import { ElementRef, HostListener, Output, ViewChild } from '@angular/core';
import { Directive } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Directive({
  selector: '[appMousePosition]',
})
export class MousePositionDirecive {
  @Output() onPointTransfer: EventEmitter<any> = new EventEmitter();

  @HostListener('click', ['$event']) onMouseMove(event: any) {
    this.onPointTransfer.emit({
      bnds: event.target.getBoundingClientRect(),
      x: event.clientX,
      y: event.clientY,
    });
  }
}
