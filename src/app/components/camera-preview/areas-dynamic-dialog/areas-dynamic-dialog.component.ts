import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { LogsModel } from '../../interfaces/logsModel';

@Component({
  selector: 'app-areas-dynamic-dialog',
  templateUrl: './areas-dynamic-dialog.component.html',
  styleUrls: ['./areas-dynamic-dialog.component.scss'],
})
export class AreasDynamicDialogComponent implements OnInit {
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
  loading: boolean = true;

  constructor() {}

  ngOnInit() {}

  @ViewChild('t') t: Table | undefined;

  public applyFilterForTable($event: any, val: string): void {
    this.t!.filterGlobal(($event.target as HTMLInputElement).value, val);
  }
}
