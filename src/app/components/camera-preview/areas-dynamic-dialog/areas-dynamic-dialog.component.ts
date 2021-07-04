import { AreaModel } from './../../interfaces/areaModel';
import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
   selector: 'app-areas-dynamic-dialog',
   templateUrl: './areas-dynamic-dialog.component.html',
   styleUrls: ['./areas-dynamic-dialog.component.scss'],
})
export class AreasDynamicDialogComponent {
   areas!: AreaModel[];
   loading: boolean = true;

   constructor(private config: DynamicDialogConfig) {
      this.areas = config.data;
      this.loading = false;
   }

   public editArea(id: string): void {}

   public deleteArea(id: string): void {}
}
