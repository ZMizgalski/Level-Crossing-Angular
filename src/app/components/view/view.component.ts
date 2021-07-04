import { EndpointService } from './../servieces/endpoint-service';
import { Component, OnInit } from '@angular/core';
import { CamerasModelWithSrc } from '../interfaces/CamerasModelWithSrc';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  public contentLoaded: boolean = false;
  constructor(private endpointService: EndpointService) {}
  private camerasWithoutSrc: any[] = [];
  public camerasWithSrc: CamerasModelWithSrc[] = [];

  ngOnInit(): void {
    this.endpointService.getAllCameras().subscribe(value => {
      this.camerasWithoutSrc = value;
      if (value === []) {
        this.contentLoaded = false;
        return;
      }
      this.camerasWithSrc = this.camerasWithoutSrc.map(value => {
        value.id = value.id;
        value.data = value.data;
        value.src = this.endpointService.endpointUrl + 'stream-cover/' + value.id;
        return value;
      });
      this.contentLoaded = true;
    });
  }
}
