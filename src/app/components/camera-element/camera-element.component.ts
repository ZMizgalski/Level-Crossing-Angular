import { EndpointService } from './../servieces/endpoint-service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CamerasWithSrc } from '../interfaces/camerasWithSrc';
import { HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-camera-element',
  templateUrl: './camera-element.component.html',
  styleUrls: ['./camera-element.component.scss'],
})
export class CameraElementComponent implements OnInit {
  @Input() data!: CamerasWithSrc;
  public imgLoaded: boolean = false;
  public imgSrc: any;

  constructor(
    private router: Router,
    private endpointService: EndpointService,
    private santizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.loadImg(this.data.id || '');
  }

  public route(id: string): void {
    this.router.navigateByUrl('/camera-preview/' + id);
  }

  public loadImg(id: string): void {
    this.endpointService.getCameraCoverById(id).subscribe(
      (response: HttpResponse<Blob>) => {
        this.imgSrc = this.santizer.bypassSecurityTrustUrl(URL.createObjectURL(response.body));
        this.imgLoaded = true;
      },
      () => {
        setTimeout(() => {
          this.loadImg(id);
        }, 3000);

        this.imgLoaded = false;
      }
    );
  }
}
