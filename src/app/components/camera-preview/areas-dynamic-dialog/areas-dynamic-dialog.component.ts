import { AreaModel } from './../../interfaces/areaModel';
import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
   selector: 'app-areas-dynamic-dialog',
   templateUrl: './areas-dynamic-dialog.component.html',
   styleUrls: ['./areas-dynamic-dialog.component.scss'],
})
export class AreasDynamicDialogComponent {
   areas!: AreaModel[];
   loading: boolean = true;

   constructor(private config: DynamicDialogConfig, public ref: DynamicDialogRef) {
      this.areas = config.data;
      this.loading = false;
   }

   public addArea(): void {
      const response = { result: '', areaName: '', delete: false, addNew: true };
      this.ref.close(response);
   }

   public editArea(id: string, areaName: string): void {
      const response = { result: id, areaName: areaName, delete: false, addNew: false };
      this.ref.close(response);
   }

   public deleteArea(id: string, areaName: string): void {
      const response = { result: id, areaName: areaName, delete: true, addNew: false };
      this.ref.close(response);
   }
}
