import { AreaModel } from './../../interfaces/areaModel';
import { Component, ViewChild } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-areas-dynamic-dialog',
  templateUrl: './areas-dynamic-dialog.component.html',
  styleUrls: ['./areas-dynamic-dialog.component.scss'],
})
export class AreasDynamicDialogComponent {
  @ViewChild('t') t: Table | undefined;
  logs!: AreaModel[];
  loading: boolean = true;

  constructor(private config: DynamicDialogConfig) {
    this.logs = config.data;
    this.loading = false;
  }

  public applyFilterForTable($event: any, val: string): void {
    this.t!.filterGlobal(($event.target as HTMLInputElement).value, val);
  }
}
