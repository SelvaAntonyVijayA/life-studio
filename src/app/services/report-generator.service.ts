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
export class ReportGeneratorService {

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('ReportGeneratorService')
  }

  private handleError: HandleError;

  saveReportRule(reportObj: Object) {

    return this.http.post<any>("/reportrule/save", { "form_data": reportObj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveReportRule', reportObj))
      );
  };

  getReportRule(orgId: string, ruleId?: string) {
    let ruleUrl: string = "/reportrule/list/" + orgId;

    if (!this.utils.isNullOrEmpty(ruleId)) {
      ruleUrl = ruleUrl + "/" + ruleId;
    }

    return this.http.get<any>(ruleUrl)
      .pipe(
        catchError(this.handleError('getReportRule', { "Status": "Error" }))
      );
  };

  getAppTileSquares(orgId: string) {
    return this.http.get<any>("/reportrule/getallsquares/" + orgId)
      .pipe(
        catchError(this.handleError('getAppTileSquares', { "Status": "Error" }))
      );
  };

  removeReportRule(ruleId: string) {

    return this.http.get<any>("/reportrule/delete/" + ruleId)
      .pipe(
        catchError(this.handleError('removeReportRule', { "Status": "Error" }))
      );
  };

  getAverageReport(obj: any) {

    return this.http.post<any>("/reportrule/avarageReport/", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('getAverageReport', obj))
      );
  };

  getReport(obj: any) {

    return this.http.post<any>("/reportrule/getreport/", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('getReport', obj))
      );
  };
}
