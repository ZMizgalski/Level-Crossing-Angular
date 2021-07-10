import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AreaModel } from './../../interfaces/areaModel';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EndpointService } from '../../servieces/endpoint-service';

@Component({
   selector: 'app-areas-dynamic-dialog',
   templateUrl: './areas-dynamic-dialog.component.html',
   styleUrls: ['./areas-dynamic-dialog.component.scss'],
})
export class AreasDynamicDialogComponent implements OnInit, OnDestroy {
   areas: AreaModel[] = [];
   loading: boolean = true;

   constructor(private config: DynamicDialogConfig, public ref: DynamicDialogRef) {}
   ngOnDestroy(): void {
      this.areas = [];
   }
   ngOnInit(): void {
      this.areas = this.config.data;
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
