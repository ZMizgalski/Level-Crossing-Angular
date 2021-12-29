import { BehaviorSubject, Observable } from 'rxjs';
import { LoaderService } from './../servieces/loader/loader-service';
import { EndpointService } from './../servieces/endpoint-service';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CamerasWithSrc } from '../interfaces/camerasWithSrc';

@Component({
   selector: 'app-view',
   templateUrl: './view.component.html',
   styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit, OnDestroy {
   @ViewChild('searchBar') public searchBox!: ElementRef;
   public _contentLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
   private camerasWithoutSrc: any[] = [];
   public camerasWithSrc: CamerasWithSrc[] = [];
   public camerasData: CamerasWithSrc[] = [];
   private intervalId = 0;

   constructor(private endpointService: EndpointService, private loaderService: LoaderService) {}

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

   ngOnDestroy(): void {
      this.loaderService.forceHide = false;
      this._contentLoaded$ = new BehaviorSubject<boolean>(false);
      window.clearInterval(this.intervalId);
   }

   private awaitToCoverChange(): void {
      this._contentLoaded$.subscribe(value => {
         if (value == false) {
            this.getStreamCover();
         }
      });
   }

   private getStreamCover(): void {
      this.endpointService.getAllCameras().subscribe(
         value => {
            if (value.length !== 0) {
               this.camerasWithoutSrc = value;
               this.camerasWithSrc = this.camerasWithoutSrc.map(value => {
                  value.id = value.id;
                  value.data = value.data;
                  value.src = this.endpointService.endpointUrl + 'stream-cover/' + value.id;
                  return value;
               });
               this.camerasData = this.camerasWithSrc;
               console.log(this.camerasData);
               this._contentLoaded$ = new BehaviorSubject<boolean>(true);
            } else {
               this._contentLoaded$ = new BehaviorSubject<boolean>(false);
            }
         },
         () => {
            console.log('3');
            this._contentLoaded$ = new BehaviorSubject<boolean>(false);
         }
      );
   }

   ngOnInit(): void {
      this.loaderService.forceHide = true;
      this.intervalId = window.setInterval(() => {
         this.awaitToCoverChange();
      }, 200);
   }
}
