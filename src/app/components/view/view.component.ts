import { EndpointService } from './../servieces/endpoint-service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CamerasWithSrc } from '../interfaces/camerasWithSrc';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  @ViewChild('searchBar') public searchBox!: ElementRef;
  public contentLoaded: boolean = false;
  constructor(private endpointService: EndpointService) {}
  private camerasWithoutSrc: any[] = [];
  public camerasWithSrc: CamerasWithSrc[] = [];
  public camerasData: CamerasWithSrc[] = [];

  public onKey(boxValue: string): void {
    if (boxValue === '') {
      this.camerasData = this.camerasWithSrc;
      return;
    }
    this.camerasData = this.camerasWithSrc.filter((item: CamerasWithSrc) => {
      const data = item.data || '';
      console.log(data.toLowerCase().includes(boxValue.toLowerCase()));
      return data.toLowerCase().includes(boxValue.toLowerCase());
    });
  }

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
      this.camerasData = this.camerasWithSrc;
      this.contentLoaded = true;
    });
  }
}
