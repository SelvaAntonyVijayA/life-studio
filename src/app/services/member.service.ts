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
export class MemberService {

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('MemberService')
  }

  private handleError: HandleError;

  getProfileFields(appId: string): Observable<any> {

    return this.http.get<any>("/app/member/profile/" + appId)
      .pipe(
        catchError(this.handleError('getProfileFields', { "Status": "Error" }))
      );
  };

  getMemberData(orgId: string, appId: string, locationId?: string): Observable<any> {
    let memberUrl: string = "/app/member/get/" + orgId + "/" + appId;

    if (!this.utils.isNullOrEmpty(locationId)) {
      memberUrl = memberUrl + "/" + locationId;
    }

    return this.http.get<any>(memberUrl)
      .pipe(
        catchError(this.handleError('getMemberData', { "Status": "Error" }))
      );
  };

}
