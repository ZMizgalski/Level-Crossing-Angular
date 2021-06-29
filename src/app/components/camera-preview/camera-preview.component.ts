import { LogsDynamicDialogComponent } from './logs-dynamic-dialog/logs-dynamic-dialog.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
})
export class CameraPreviewComponent implements OnInit, OnDestroy {
  date!: Date;
  htmlRef!: DynamicDialogRef;

  constructor(
    private route: ActivatedRoute,
    public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    console.log(this.gedIdFromRoute());
  }

  ngOnDestroy() {
    if (this.htmlRef) {
      this.htmlRef.close();
    }
  }

  public show(): void {
    this.htmlRef = this.dialogService.open(LogsDynamicDialogComponent, {
      header: 'Logs Table',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
    });
  }
  private gedIdFromRoute(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }
}
