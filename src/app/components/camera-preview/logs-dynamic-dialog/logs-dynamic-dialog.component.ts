import { LogsModel } from './../../interfaces/logsModel';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-logs-dynamic-dialog',
  templateUrl: './logs-dynamic-dialog.component.html',
  styleUrls: ['./logs-dynamic-dialog.component.scss'],
})
export class LogsDynamicDialogComponent implements OnInit {
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
