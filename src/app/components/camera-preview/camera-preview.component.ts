import { AreaModel } from './../interfaces/areaModel';
import { AreasDynamicDialogComponent } from './areas-dynamic-dialog/areas-dynamic-dialog.component';
import { LogsDynamicDialogComponent } from './logs-dynamic-dialog/logs-dynamic-dialog.component';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LogsModel } from '../interfaces/logsModel';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
})
export class CameraPreviewComponent implements OnInit, OnDestroy {
  @ViewChild('video') video!: ElementRef;
  date!: Date;
  date2!: Date;
  htmlRef!: DynamicDialogRef;

  constructor(private route: ActivatedRoute, public dialogService: DialogService) {}

  areas: AreaModel[] = [
    {
      id: '75ca669a-c26c-4dc2-987e-029351a7338d',
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
      id: '75ca669a-c26c-4dc2-987e-029351a7338a',
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
      id: '75ca669a-c26c-4dc2-987e-029351a7338m',
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

  ngOnInit(): void {
    console.log(this.gedIdFromRoute());
  }

  ngOnDestroy() {
    if (this.htmlRef) {
      this.htmlRef.close();
    }
  }

  public showLogsDialog(): void {
    this.htmlRef = this.dialogService.open(LogsDynamicDialogComponent, {
      data: this.logs,
      header: 'Logs Table',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
    });
  }

  public showAreasDialog(): void {
    this.htmlRef = this.dialogService.open(AreasDynamicDialogComponent, {
      data: this.areas,
      header: 'Areas Table',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
    });
  }

  private gedIdFromRoute(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  public previousCamera(): void {}

  public nextCamera(): void {}

  public polygonResponse($event: any): void {
    console.log($event);
  }
}
