import { LogsModel } from './../../interfaces/logsModel';
import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-logs-dynamic-dialog',
  templateUrl: './logs-dynamic-dialog.component.html',
  styleUrls: ['./logs-dynamic-dialog.component.scss'],
})
export class LogsDynamicDialogComponent {
  @ViewChild('t') t: Table | undefined;
  logs!: LogsModel[];
  loading: boolean = true;

  constructor(private config: DynamicDialogConfig) {
    this.logs = config.data;
    this.loading = false;
  }

  public applyFilterForTable($event: any, val: string): void {
    this.t!.filterGlobal(($event.target as HTMLInputElement).value, val);
  }

  public download(): void {}

  public play(): void {}
}
