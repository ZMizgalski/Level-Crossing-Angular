import { AreaModel } from './../interfaces/areaModel';
import { AreasDynamicDialogComponent } from './areas-dynamic-dialog/areas-dynamic-dialog.component';
import { LogsDynamicDialogComponent } from './logs-dynamic-dialog/logs-dynamic-dialog.component';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    public dialogService: DialogService
  ) {}

  areas: AreaModel[] = [
    {
      id: '75ca669a-c26c-4dc2-987e-029351a7338d',
      area: {
        areaName: 'elo1',
        pointsList: [
          { x: 2331230, y: 265430 },
          { x: 233330, y: 263633 },
        ],
      },
    },
    {
      id: '75ca669a-c26c-4dc2-987e-029351a7338a',
      area: {
        areaName: 'elo2',
        pointsList: [
          { x: 2332130, y: 26530 },
          { x: 233230, y: 26363 },
        ],
      },
    },
    {
      id: '75ca669a-c26c-4dc2-987e-029351a7338m',
      area: {
        areaName: 'elo3',
        pointsList: [
          { x: 23311130, y: 2611530 },
          { x: 233130, y: 263613 },
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

  public getVideoPoint($event: any): void {
    const bnds = $event.bnds;
    const scaleX = (640 / bnds.width).toFixed(2);
    const scaleY = (480 / bnds.height).toFixed(2);
    const x = Number((($event.x - bnds.left) * Number(scaleX)).toFixed(3));
    const y = Number((($event.y - bnds.top) * Number(scaleY)).toFixed(3));
    const finalX = x <= 0 ? 0 : x;
    const finalY = y <= 0 ? 0 : y;
    console.log(finalX, finalY);
  }

  public polygonResponse($event: any): void {
    console.log($event);
  }
}
