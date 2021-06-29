import { LogsModel } from './../../interfaces/logsModel';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logs-dynamic-dialog',
  templateUrl: './logs-dynamic-dialog.component.html',
  styleUrls: ['./logs-dynamic-dialog.component.scss'],
})
export class LogsDynamicDialogComponent implements OnInit {
  logs!: LogsModel[];
  loading: boolean = true;

  constructor() {}

  ngOnInit() {}
}
