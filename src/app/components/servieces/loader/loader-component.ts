import { LoaderService } from './loader-service';
import { Component } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'loader',
  template: ` <div class="loader-container" *ngIf="isLoading | async">
    <i class="pi pi-spin pi-spinner loader-container__icon"></i>
  </div>`,
  styles: [
    `
      @import '../../colors.scss';
      @import '../../fonts.scss';

      @media screen and (max-width: 300px) {
        .loader-container__icon {
          font-size: $font-size-small !important;
        }
      }

      .loader-container {
        width: 100vw;
        pointer-events: none;
        z-index: 999;
        background: black;
        display: flex !important;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: fixed;
        min-height: 100vh;
        opacity: 0.5;
        &__icon {
          transition: 0.2s ease;
          font-size: $font-size-big;
          color: $Brighter-Blue;
          background: transparent;
        }
      }
    `,
  ],
})
export class LoaderComponent {
  public isLoading: Subject<boolean>;

  constructor(public loaderService: LoaderService) {
    this.isLoading = this.loaderService.isLoading;
  }
}
