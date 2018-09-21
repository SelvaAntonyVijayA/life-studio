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

@Injectable({
  providedIn: 'root'
})
export class TrendReportService {
  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('TrendReportService')
  }

  private handleError: HandleError;

  getTrendReportMember(appId: string, locationId?: string, obj?: any) {
    let url: string = "/trendreport/member/get/" + appId;
    let formData: object = {};

    if (!this.utils.isNullOrEmpty(locationId)) {
      url = url + "/" + locationId
    }

    if (!this.utils.isNullOrEmpty(obj)) {
      formData["form_data"] = obj;
    }

    return this.http.post<any>(url, formData, httpOptions)
      .pipe(
        catchError(this.handleError('getTrendReportMember', appId))
      );
  };
}
