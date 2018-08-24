import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpErrorHandlerService, HandleError } from '../services/http-error-handler.service';
import { Utils } from '../helpers/utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  })
};

@Injectable()
export class AppsService {

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('AppsService')
  }

  private handleError: HandleError;

  getApps(orgId: string): Observable<any> {

    return this.http.get<any>("/cms/apps/list/" + orgId)
      .pipe(
        catchError(this.handleError('getApps', { "Status": "Error" }))
      );
  };

  saveApp(obj: any, type?: string): Observable<any> {
    let url: string = '/cms/apps/save/';

    if (!this.utils.isNullOrEmpty(type)) {
      url = url + type;
    }

    return this.http.post<any>(url, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveApp', obj))
      );
  };

  updateApp(id: string, obj: any): Observable<any> {
    let url: string = "/cms/apps/update/" + id;

    return this.http.post<any>(url, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('updateApp', obj))
      );
  };

  deleteApp(id: string): Observable<any> {
    let url: string = '/cms/apps/remove/' + id;

    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError('deleteApp', { "Status": "Error" }))
      );
  };

  squareAssign(assignData: any[]): Observable<any> {

    return this.http.post<any>("/app/square/assign", { "form_data": assignData }, httpOptions)
      .pipe(
        catchError(this.handleError('squareAssign', assignData))
      );
  };
}
