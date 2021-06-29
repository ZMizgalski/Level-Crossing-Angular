import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-camera-element',
  templateUrl: './camera-element.component.html',
  styleUrls: ['./camera-element.component.scss'],
})
export class CameraElementComponent {
  @Input() data: any;

  constructor(private router: Router) {}

  public route(id: string): void {
    this.router.navigateByUrl('/camera-preview/' + id);
  }
}
