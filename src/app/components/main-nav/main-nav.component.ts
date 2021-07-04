import { Subject } from 'rxjs';
import { LoaderService } from './../servieces/loader/loader-service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
  constructor(private loaderService: LoaderService) {}
  public isLoading: Subject<boolean> = this.loaderService.isLoading;
}
