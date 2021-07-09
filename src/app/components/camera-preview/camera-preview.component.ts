import { Actions, NewAreaData, PolygonResponse } from './polygon-draw.component';
import { EndpointService } from './../servieces/endpoint-service';
import { AreaModel, Point } from './../interfaces/areaModel';
import { AreasDynamicDialogComponent } from './areas-dynamic-dialog/areas-dynamic-dialog.component';
import { LogsDynamicDialogComponent, ResponseLogsModel } from './logs-dynamic-dialog/logs-dynamic-dialog.component';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LogsModel } from '../interfaces/logsModel';
import { AreasDialogResponseModel } from '../interfaces/areasDialogResponseModel';
import { MessageService } from 'primeng/api';

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
   public src?: { data: any; srcChange: boolean };
   public policyAccteped: boolean = false;
   public enableDrawing: boolean = false;
   public showAreaNameDialog: boolean = false;
   private oldAreaToUpdate?: { index: number };

   constructor(
      private router: Router,
      private route: ActivatedRoute,
      public dialogService: DialogService,
      private endpointService: EndpointService,
      private messageService: MessageService
   ) {}

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
      { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_18-54-12' },
      { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_18-57-12' },
      { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_19-01-20' },
      { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_19-04-20' },
      { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_19-06-59' },
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
            this.router.navigate(['/view']);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error });
         }
      );
   }

   ngOnDestroy() {
      this.areasDialog ? this.areasDialog.close() : '';
      this.logsDialog ? this.logsDialog.close() : '';
   }

   public showLogsDialog(): void {
      this.logsDialog = this.dialogService.open(LogsDynamicDialogComponent, {
         data: this.logs,
         header: 'Logs Table',
         width: '70%',
         contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
         baseZIndex: 10000,
      });

      this.logsDialog.onClose.subscribe((value: ResponseLogsModel) => {
         if (value != undefined) {
            value.download ? this.downloadFile(value.id, value.date) : this.playOldRecord(value.id, value.date);
         }
      });
   }

   private downloadFile(id: string, date: string): void {
      this.endpointService.downloadFileByDate(id, date).subscribe(
         response => {
            console.log(response);
            const blob = new Blob([response.body as BlobPart], { type: 'video/mp4' });
            const url = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = date;
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            setTimeout(function () {
               window.URL.revokeObjectURL(url);
               link.remove();
            }, 100);
         },
         error => {
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
         }
      );
   }

   public playLiveVideo(): void {
      this.src = { data: undefined, srcChange: true };
   }

   private playOldRecord(id: string, date: string): void {
      this.endpointService.getFileByDate(id, date).subscribe(
         response => {
            this.src = { data: new Blob([response.body as BlobPart], { type: 'video/mp4' }), srcChange: false };
         },
         error => {
            this.src = { data: undefined, srcChange: true };
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
         }
      );
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
         value != undefined ? this.chooseActionAfterDialogClose(value) : '';
      });
   }

   private chooseActionAfterDialogClose(areasDialogResponseData: AreasDialogResponseModel): void {
      if (areasDialogResponseData.addNew === true) {
         this.showAreaNameDialog = true;
         return;
      }
      this.areas.forEach((area: AreaModel, index: number) => {
         if (area.id === areasDialogResponseData.result && area.area?.areaName === areasDialogResponseData.areaName) {
            areasDialogResponseData.delete ? this.deleteArea(index, area) : this.prepareDataForUpdate(index);
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

   private prepareDataForUpdate(index: number): void {
      this.showAreaNameDialog = true;
      this.oldAreaToUpdate = { index: index };
   }

   public polygonResponse($event: PolygonResponse): void {
      $event.action == Actions.POLICY_ACCEPTED ? (this.policyAccteped = true) : '';
      $event.action == Actions.AREA_CHANHED ? this.updateOrAddNewArea($event.body) : '';
   }

   private deleteArea(index: number, area: AreaModel): void {
      const deleteArea = { id: area.id, areaName: area.area?.areaName };
      this.endpointService.deleteArea(deleteArea).subscribe(
         response => {
            this.areas.splice(index, 1);
            this.messageService.add({ severity: 'success', summary: 'Server Response', detail: response });
         },
         error => {
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error });
         }
      );
   }

   private updateOrAddNewArea(body: NewAreaData | undefined): void {
      if (body != undefined) {
         const area = { id: this.id, area: { areaName: body.areaName, pointsList: body.pointsList } };
         this.oldAreaToUpdate != undefined
            ? this.updateAreaAfterResponse(this.oldAreaToUpdate.index, area, body)
            : this.addNewAreaAfterResponse(area, body);
      }
      this.enableDrawing = false;
   }

   private addNewAreaAfterResponse(area: AreaModel, responseBody: NewAreaData) {
      this.endpointService.setNewArea(area).subscribe(
         response => {
            this.messageService.add({ severity: 'success', summary: 'Server Response', detail: response });
         },
         error => {
            this.deleteAreaAfterErrorResponse(responseBody);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
         }
      );
   }

   private updateAreaAfterResponse(index: number, area: AreaModel, responseBody: NewAreaData) {
      this.endpointService.updateArea(area).subscribe(
         response => {
            this.areas.splice(index, 1);
            this.oldAreaToUpdate = undefined;
            this.messageService.add({ severity: 'success', summary: 'Server Response', detail: response });
         },
         error => {
            this.deleteAreaAfterErrorResponse(responseBody);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error });
            this.oldAreaToUpdate = undefined;
         }
      );
   }

   private deleteAreaAfterErrorResponse(responseBody: NewAreaData): void {
      this.areas.forEach((area: AreaModel, index: number) => {
         if (area.id === this.id && area.area?.areaName === responseBody.areaName) {
            this.areas.splice(index, 1);
         }
      });
   }

   public previousCamera(): void {}

   public nextCamera(): void {}
}
