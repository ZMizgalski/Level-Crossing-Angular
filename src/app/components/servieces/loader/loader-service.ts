import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isLoading = new Subject<boolean>();
  public forceHide: boolean = false;

  public show(): void {
    !this.forceHide ? this.isLoading.next(true) : '';
  }

  public hide(): void {
    this.forceHide ? this.isLoading.next(false) : '';
  }
}
