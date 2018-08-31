import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
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

  roleMembers(obj: Object): Observable<any> {
    return this.http.post<any>("/app/member/rolemembers/", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('roleMembers', obj))
      );
  };

  saveMember(data: Object) {
    return this.http.post<any>("/cms/member/save", { "form_data": data }, httpOptions)
      .pipe(
        catchError(this.handleError('saveMember', data))
      );
  };

  updateMember(id: string, data: Object) {

    return this.http.post<any>("/app/member/update/" + id, { "form_data": data }, httpOptions)
      .pipe(
        catchError(this.handleError('updateMember', data))
      );
  };

  appMemberRemove(memberId: string, appId?: string) {
    let removeUrl: string = "/app/member/remove/" + memberId;

    if (!this.utils.isNullOrEmpty(appId)) {
      removeUrl = removeUrl + "/" + appId;
    }

    return this.http.get<any>(removeUrl)
      .pipe(
        catchError(this.handleError('appMemberRemove', { "Status": "Error" }))
      );
  }
}
