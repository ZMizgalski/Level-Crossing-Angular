import { Actions } from './polygon-draw.component';
import { EndpointService } from './../servieces/endpoint-service';
import { AreaModel } from './../interfaces/areaModel';
import { AreasDynamicDialogComponent } from './areas-dynamic-dialog/areas-dynamic-dialog.component';
import { LogsDynamicDialogComponent } from './logs-dynamic-dialog/logs-dynamic-dialog.component';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LogsModel } from '../interfaces/logsModel';
import { AreasDialogResponseModel } from '../interfaces/areasDialogResponseModel';

@Component({
   selector: 'app-camera-preview',
   templateUrl: './camera-preview.component.html',
   styleUrls: ['./camera-preview.component.scss'],
})
export class CameraPreviewComponent implements OnInit, OnDestroy {
   @ViewChild('video') public video!: ElementRef;
   public date!: Date;
   public date2!: Date;
   public areaName?: string;
   public areasDialog!: DynamicDialogRef;
   public logsDialog!: DynamicDialogRef;
   public id?: string;
   public policyAccteped: boolean = false;
   public enableDrawing: boolean = false;
   public showAreaNameDialog: boolean = false;

   constructor(private route: ActivatedRoute, public dialogService: DialogService, private endpointService: EndpointService) {}

   areas: AreaModel[] = [
      {
         id: '66efa687-14e2-4bba-b35c-6221ff0a028d',
         area: {
            areaName: 'elo1',
            pointsList: [
               { x: 136, y: 142.359375 },
               { x: 237, y: 293.359375 },
               { x: 542, y: 287.359375 },
               { x: 514, y: 94.359375 },
               { x: 327, y: 73.359375 },
            ],
         },
      },
      {
         id: '66efa687-14e2-4bba-b35c-6221ff0a028d',
         area: {
            areaName: 'elo2',
            pointsList: [
               { x: 80, y: 116.359375 },
               { x: 18, y: 364.359375 },
               { x: 85, y: 394.359375 },
               { x: 197, y: 326.359375 },
               { x: 71, y: 190.359375 },
            ],
         },
      },
      {
         id: '66efa687-14e2-4bba-b35c-6221ff0a028d',
         area: {
            areaName: 'elo3',
            pointsList: [
               { x: 258, y: 81.359375 },
               { x: 324, y: 79.359375 },
               { x: 456, y: 83.359375 },
               { x: 557, y: 112.359375 },
               { x: 504, y: 133.359375 },
               { x: 350, y: 109.359375 },
            ],
         },
      },
   ];

   logs: LogsModel[] = [
      { filename: 'elo.mp4', time: '12_12_12' },
      { filename: 'elo.mp4', time: '12_12_12' },
      { filename: 'elo.mp4', time: '12_12_12' },
      { filename: 'elo.mp4', time: '12_12_12' },
      { filename: 'elo.mp4', time: '12_12_12' },
      { filename: 'elo.mp4', time: '12_12_12' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
      { filename: 'elo.mp4', time: '11_13_14' },
   ];

   private gedIdFromRoute(): string | null {
      return this.route.snapshot.paramMap.get('id');
   }

   ngOnInit(): void {
      this.id = this.gedIdFromRoute() || '';
      this.endpointService.getCameraById(this.id).subscribe(
         value => {
            console.log(value);
         },
         error => {
            console.log(error);
         }
      );
   }

   ngOnDestroy() {
      if (this.areasDialog) {
         this.areasDialog.close();
      }
      if (this.logsDialog) {
         this.logsDialog.close();
      }
   }

   public showLogsDialog(): void {
      this.logsDialog = this.dialogService.open(LogsDynamicDialogComponent, {
         data: this.logs,
         header: 'Logs Table',
         width: '70%',
         contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
         baseZIndex: 10000,
      });

      this.logsDialog.onClose.subscribe(value => {
         if (value != undefined) {
            console.log(value);
         }
      });
   }

   public showAreasDialog(): void {
      this.areasDialog = this.dialogService.open(AreasDynamicDialogComponent, {
         data: this.areas,
         header: 'Areas Table',
         width: '70%',
         contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
         baseZIndex: 10000,
      });

      this.areasDialog.onClose.subscribe((value: AreasDialogResponseModel) => {
         if (value != undefined) {
            if (value.addNew === true) {
               this.showAreaNameDialog = true;
               return;
            }
            this.areas.forEach((area: AreaModel, index: number) => {
               if (area.id === value.result && area.area?.areaName === value.areaName) {
                  value.delete ? this.deleteArea(index, area) : this.updateArea(index, area);
               }
            });
         }
      });
   }

   public newAreaNameAccept(input: HTMLInputElement): void {
      this.areaName = input.value;
      this.showAreaNameDialog = false;
      this.enableDrawing = true;
   }

   public newAreaNameReject(): void {
      this.enableDrawing = false;
      this.showAreaNameDialog = false;
   }

   private updateArea(index: number, area: AreaModel): void {
      this.enableDrawing = true;
      this.endpointService.updateArea(area).subscribe(
         response => {
            console.log(response);
            this.areas.splice(index, 1);
         },
         error => {
            console.log(error);
            this.enableDrawing = false;
         }
      );
   }

   private deleteArea(index: number, area: AreaModel): void {
      const deleteArea = { id: area.id, areaName: area.area?.areaName };
      this.endpointService.deleteArea(deleteArea).subscribe(
         response => {
            console.log(response);
            this.areas.splice(index, 1);
         },
         error => {
            console.log(error);
         }
      );
   }

   public previousCamera(): void {}

   public nextCamera(): void {}

   public polygonResponse($event: any): void {
      $event == Actions.POLICY_ACCEPTED ? (this.policyAccteped = true) : '';
      $event == Actions.AREA_CHANHED ? this.changeValuesOnAreaChange() : '';
   }

   private changeValuesOnAreaChange(): void {
      this.enableDrawing = false;
   }
}
