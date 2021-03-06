import { LoaderService } from './components/servieces/loader/loader-service';
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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { HttpInterceptor } from './components/servieces/loader/http-interceptor';
import { LoaderComponent } from './components/servieces/loader/loader-component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';

@NgModule({
   declarations: [
      AppComponent,
      MainNavComponent,
      ViewComponent,
      CameraPreviewComponent,
      LoaderComponent,
      CameraElementComponent,
      LogsDynamicDialogComponent,
      AreasDynamicDialogComponent,
      PolygonDraw,
   ],
   imports: [
      ConfirmDialogModule,
      InputTextModule,
      BrowserModule,
      HttpClientModule,
      ToastModule,
      AppRoutingModule,
      DialogModule,
      BrowserAnimationsModule,
      FormsModule,
      CalendarModule,
      TableModule,
   ],
   providers: [
      MessageService,
      DialogService,
      ConfirmationService,
      LoaderService,
      DatePipe,
      { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptor, multi: true },
   ],
   bootstrap: [AppComponent],
   exports: [],
})
export class AppModule {}
