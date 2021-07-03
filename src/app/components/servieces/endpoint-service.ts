import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EndpointService {
  private endpointUrl?: string;
  constructor(private http: HttpClient) {
    this.endpointUrl = 'http://localhost:8080/api/server/';
  }

  public getFileByDate(date: string): Observable<HttpResponse<Blob>> {
    return this.http.get<Blob>(this.endpointUrl + 'getFileByDate/' + date, {
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
