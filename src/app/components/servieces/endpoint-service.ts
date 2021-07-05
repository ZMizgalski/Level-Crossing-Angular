import { CamerasModel } from '../interfaces/camerasModel';
import { ChangeMotorModel } from './../interfaces/changeMotorDirection';
import { deleteAreaModel } from './../interfaces/deleleAreaModel';
import { AreaModel } from './../interfaces/areaModel';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CameraModel } from '../interfaces/cameraModel';

@Injectable({
   providedIn: 'root',
})
export class EndpointService {
   public endpointUrl?: string;
   constructor(private http: HttpClient) {
      this.endpointUrl = 'http://localhost:8080/api/server/';
   }

   public getCameraById(id: string): Observable<CameraModel> {
      return this.http.get<CameraModel>(this.endpointUrl + 'getCameraById/' + id);
   }

   public getAllCameras(): Observable<CamerasModel[]> {
      return this.http.get<CamerasModel[]>(this.endpointUrl + 'getAllCameras');
   }

   public getFileByDate(date: string): Observable<HttpResponse<Blob>> {
      return this.http.get<Blob>(this.endpointUrl + 'getFileByDate/' + date, {
         observe: 'response',
         responseType: 'blob' as 'json',
      });
   }

   public getFilesByDay(day: string): Observable<any> {
      return this.http.get(this.endpointUrl + 'getFilesByDay/' + day);
   }

   public getAllAreasById(id: string): Observable<any> {
      return this.http.get(this.endpointUrl + 'getAllAreasById/' + id);
   }

   public getCameraCoverById(id: string): Observable<HttpResponse<Blob>> {
      return this.http.get<Blob>(this.endpointUrl + 'stream-cover/' + id, {
         observe: 'response',
         responseType: 'blob' as 'json',
      });
   }

   public getCameraLiveVideoById(id: string): Observable<HttpResponse<Blob>> {
      return this.http.get<Blob>(this.endpointUrl + 'server-stream/' + id, {
         observe: 'response',
         responseType: 'blob' as 'json',
      });
   }

   public setNewArea(area: AreaModel): Observable<any> {
      return this.http.post(this.endpointUrl + 'setArea', area);
   }

   public deleteArea(area: deleteAreaModel): Observable<any> {
      return this.http.delete(this.endpointUrl + 'deleteArea', {
         body: area,
      });
   }

   public updateArea(area: AreaModel): Observable<any> {
      return this.http.put(this.endpointUrl + 'updateArea', area);
   }

   public motorControl(motor: ChangeMotorModel): Observable<any> {
      return this.http.post(this.endpointUrl + 'motorControl', motor);
   }
}
