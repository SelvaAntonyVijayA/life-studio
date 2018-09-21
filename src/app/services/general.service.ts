import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, last } from 'rxjs/operators';

import { HttpErrorHandlerService, HandleError } from '../services/http-error-handler.service';
import { Utils } from '../helpers/utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  })
};

const HttpUploadOptions = {
  headers: new HttpHeaders({ "Content-Type": "multipart/form-data" })
};

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('GeneralService')
  }

  private handleError: HandleError;

  getExcelData(appId: string, fields: any[]): Observable<any> {

    return this.http.post<any>("/export/excel/" + appId, { "form_data": fields }, httpOptions)
      .pipe(
        catchError(this.handleError('getExcelData', fields))
      );
  };

  fileUpload(url: string, formData: any): Observable<any> {

    /* return this.http.post<any>(url, formData, HttpUploadOptions)
       .pipe(
         catchError(this.handleError('fileUpload', url))
       );*/

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: false
    });

    return this.http.request(req).pipe(
      last(),
      catchError(this.handleError(formData))
    );

    /* return this.http.post(url, formData)
       .toPromise()
       .catch(this.handleError(url));
   };*/
  };

  getAppProfile(appId: string): Observable<any> {
    return this.http.get<any>("/general/profile/" + appId)
      .pipe(
        catchError(this.handleError('getAppProfile', { "Status": "Error" }))
      );
  };
}
