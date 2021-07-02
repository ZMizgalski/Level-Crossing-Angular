import { PolygonDraw } from './components/camera-preview/polygon-draw.component';
import { DialogService } from 'primeng/dynamicdialog';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { ViewComponent } from './components/view/view.component';
import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CameraElementComponent } from './components/camera-element/camera-element.component';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { LogsDynamicDialogComponent } from './components/camera-preview/logs-dynamic-dialog/logs-dynamic-dialog.component';
import { TableModule } from 'primeng/table';
import { AreasDynamicDialogComponent } from './components/camera-preview/areas-dynamic-dialog/areas-dynamic-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    ViewComponent,
    CameraPreviewComponent,
    CameraElementComponent,
    LogsDynamicDialogComponent,
    AreasDynamicDialogComponent,
    PolygonDraw,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    CalendarModule,
    TableModule,
  ],
  providers: [DialogService],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
