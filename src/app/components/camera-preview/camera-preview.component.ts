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
import { DatePipe } from '@angular/common';

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
   private oldAreaToUpdate?: { index: number; oldAreaName: string };
   public areas: AreaModel[] = [];
   public logs: LogsModel[] = [];
   public areasUpdated: boolean = false;
   public logsUpdated: boolean = false;

   constructor(
      private router: Router,
      private route: ActivatedRoute,
      public dialogService: DialogService,
      private endpointService: EndpointService,
      private messageService: MessageService,
      private datePipe: DatePipe
   ) {}

   // areas: AreaModel[] = [
   //    {
   //       id: '66efa687-14e2-4bba-b35c-6221ff0a028d',
   //       area: {
   //          areaName: 'elo1',
   //          pointsList: [
   //             { x: 136, y: 142.359375 },
   //             { x: 237, y: 293.359375 },
   //             { x: 542, y: 287.359375 },
   //             { x: 514, y: 94.359375 },
   //             { x: 327, y: 73.359375 },
   //          ],
   //       },
   //    },
   //    {
   //       id: '66efa687-14e2-4bba-b35c-6221ff0a028d',
   //       area: {
   //          areaName: 'elo2',
   //          pointsList: [
   //             { x: 80, y: 116.359375 },
   //             { x: 18, y: 364.359375 },
   //             { x: 85, y: 394.359375 },
   //             { x: 197, y: 326.359375 },
   //             { x: 71, y: 190.359375 },
   //          ],
   //       },
   //    },
   //    {
   //       id: '66efa687-14e2-4bba-b35c-6221ff0a028d',
   //       area: {
   //          areaName: 'elo3',
   //          pointsList: [
   //             { x: 258, y: 81.359375 },
   //             { x: 324, y: 79.359375 },
   //             { x: 456, y: 83.359375 },
   //             { x: 557, y: 112.359375 },
   //             { x: 504, y: 133.359375 },
   //             { x: 350, y: 109.359375 },
   //          ],
   //       },
   //    },
   // ];

   // logs: LogsModel[] = [
   //    { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_18-54-12' },
   //    { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_18-57-12' },
   //    { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_19-01-20' },
   //    { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_19-04-20' },
   //    { id: '0fbd7a0c-7894-4419-a996-54f78c17b550', time: '2021-07-06_19-06-59' },
   // ];

   private gedIdFromRoute(): string | null {
      return this.route.snapshot.paramMap.get('id');
   }

   private getAllAreas(id: string): void {
      this.endpointService.getAllAreasById(id).subscribe(
         (value: AreaModel[]) => {
            this.areas = value;
            this.areasUpdated = true;
         },
         error => {
            this.router.navigate(['/view']);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
         }
      );
   }

   private getAllFiles(id: string): void {
      this.endpointService.getAllFilesByDayAndId(id, this.datePipe.transform(new Date(), 'yyyy-MM-dd_HH-mm-ss') || '').subscribe(
         (value: LogsModel[]) => {
            this.logs = value;
            this.logsUpdated = true;
         },
         error => {
            this.router.navigate(['/view']);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
         }
      );
   }

   ngOnInit(): void {
      this.id = this.gedIdFromRoute() || '';
      this.endpointService.getCameraById(this.id).subscribe(
         () => {
            this.getAllAreas(this.id || '');
            this.getAllFiles(this.id || '');
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
      this.getAllFiles(this.id || '');
      this.logsDialog = this.dialogService.open(LogsDynamicDialogComponent, {
         data: this.logs,
         header: 'Logs Table',
         width: '70%',
         contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
         baseZIndex: 10000,
      });

      this.logsDialog.onClose.subscribe((value: ResponseLogsModel) => {
         if (value != undefined) {
            this.logsUpdated = false;
            value.download ? this.downloadFile(value.id, value.date) : this.playOldRecord(value.id, value.date);
         }
      });
   }

   private downloadFile(id: string, date: string): void {
      this.endpointService.downloadFileByDate(id, date).subscribe(
         response => {
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
      this.getAllFiles(this.id || '');
   }

   public playLiveVideo(): void {
      this.src = { data: undefined, srcChange: true };
   }

   private playOldRecord(id: string, date: string): void {
      this.endpointService.getFileByDateAndId(id, date).subscribe(
         response => {
            this.src = { data: new Blob([response.body as BlobPart], { type: 'video/mp4' }), srcChange: false };
            this.getAllFiles(this.id || '');
         },
         error => {
            this.src?.srcChange == false
               ? (this.src = { data: undefined, srcChange: false })
               : (this.src = { data: undefined, srcChange: true });
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
            this.getAllFiles(this.id || '');
         }
      );
   }

   public showAreasDialog(): void {
      this.getAllAreas(this.id || '');
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
            this.areasUpdated = false;
            areasDialogResponseData.delete ? this.deleteArea(index, area) : this.prepareDataForUpdate(index, area.area?.areaName);
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

   private prepareDataForUpdate(index: number, areaName: string): void {
      this.showAreaNameDialog = true;
      this.oldAreaToUpdate = { index: index, oldAreaName: areaName };
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
            this.areasUpdated = true;
            this.messageService.add({ severity: 'success', summary: 'Server Response', detail: response });
            this.getAllAreas(this.id || '');
         },
         error => {
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error });
            this.getAllAreas(this.id || '');
         }
      );
   }

   private updateOrAddNewArea(body: NewAreaData | undefined): void {
      if (body != undefined) {
         const area = { id: this.id, area: { areaName: body.areaName, pointsList: body.pointsList } };
         this.oldAreaToUpdate != undefined
            ? this.updateAreaAfterResponse(this.oldAreaToUpdate.index, area, body, this.oldAreaToUpdate.oldAreaName)
            : this.addNewAreaAfterResponse(area, body);
      }
      this.enableDrawing = false;
   }

   private addNewAreaAfterResponse(area: AreaModel, responseBody: NewAreaData) {
      this.endpointService.setNewArea(area).subscribe(
         response => {
            this.messageService.add({ severity: 'success', summary: 'Server Response', detail: response });
            this.areasUpdated = true;
            this.getAllAreas(this.id || '');
         },
         error => {
            this.deleteAreaAfterErrorResponse(responseBody);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
            this.getAllAreas(this.id || '');
         }
      );
   }

   private updateAreaAfterResponse(index: number, area: AreaModel, responseBody: NewAreaData, areaName: string) {
      console.log(area, responseBody);
      const updateArea = { id: area.id, oldAreaName: areaName, area: responseBody };
      this.endpointService.updateArea(updateArea).subscribe(
         response => {
            this.areas.splice(index, 1);
            this.areasUpdated = true;
            this.oldAreaToUpdate = undefined;
            this.messageService.add({ severity: 'success', summary: 'Server Response', detail: response });
            this.getAllAreas(this.id || '');
         },
         error => {
            this.deleteAreaAfterErrorResponse(responseBody);
            this.messageService.add({ severity: 'error', summary: 'Server Response', detail: error.error.text });
            this.oldAreaToUpdate = undefined;
            this.getAllAreas(this.id || '');
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
