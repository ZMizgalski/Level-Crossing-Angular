import { AreaModel } from './../../interfaces/areaModel';
import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-areas-dynamic-dialog',
  templateUrl: './areas-dynamic-dialog.component.html',
  styleUrls: ['./areas-dynamic-dialog.component.scss'],
})
export class AreasDynamicDialogComponent {
  logs!: AreaModel[];
  loading: boolean = true;

  constructor(private config: DynamicDialogConfig) {
    this.logs = config.data;
    this.loading = false;
  }
}
