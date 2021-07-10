import { LogsModel } from './../../interfaces/logsModel';
import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export interface ResponseLogsModel {
   id: string;
   date: string;
   download: boolean;
}

@Component({
   selector: 'app-logs-dynamic-dialog',
   templateUrl: './logs-dynamic-dialog.component.html',
   styleUrls: ['./logs-dynamic-dialog.component.scss'],
})
export class LogsDynamicDialogComponent {
   @ViewChild('t') t: Table | undefined;
   logs!: LogsModel[];
   loading: boolean = true;

   constructor(private config: DynamicDialogConfig, public ref: DynamicDialogRef) {
      this.logs = config.data;
      this.loading = false;
   }

   public applyFilterForTable($event: any, val: string): void {
      this.t!.filterGlobal(($event.target as HTMLInputElement).value, val);
   }

   public download(id: string, date: string): void {
      const responseLogsModel = { id: id, date: date, download: true };
      this.ref.close(responseLogsModel);
   }

   public play(id: string, date: string): void {
      const responseLogsModel = { id: id, date: date, download: false };
      this.ref.close(responseLogsModel);
   }

   public formatDate(date: string): string {
      const splittedDate = date.split('_');
      return splittedDate[1].replace('-', ':').replace('-', ':');
   }
}
