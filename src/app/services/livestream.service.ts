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
export class LivestreamService {
  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('LiveStreamService')
  }

  private handleError: HandleError;

  getLiveStream(orgId?: string, appId?: string, locId?: string, formData?: Object): Observable<any> {
    var liveStreamUrl = "/livestream/list/";

    if (!this.utils.isNullOrEmpty(orgId)) {
      liveStreamUrl = liveStreamUrl + orgId;
    }

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(appId)) {
      liveStreamUrl = "/" + liveStreamUrl + appId;
    }

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(appId) && !this.utils.isNullOrEmpty(locId)) {
      liveStreamUrl = "/" + liveStreamUrl + locId;
    }

    var formDataToPost = {};

    if (!this.utils.isEmptyObject(formData)) {
      formDataToPost["form_data"] = formData;
    }


    return this.http.post<any>(liveStreamUrl, formDataToPost, httpOptions)
      .pipe(
        catchError(this.handleError('getLiveStream', formDataToPost))
      );
  };

  saveStream(obj: any): Observable<any> {
    
    return this.http.post<any>("/livestream/save", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveStream', obj))
      );
  };

  updateStream(id: string, obj: any): Observable<any> {

    return this.http.post<any>("/livestream/update/" + id, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveStream', obj))
      );
  };

  deleteStream(id: string): Observable<any> {
    return this.http.get<any>("/livestream/remove/" + id)
      .pipe(
        catchError(this.handleError('deleteStream', { "Status": "Error" }))
      );
  };

  getMappedStreams(userId: string): Observable<any> {

    return this.http.get<any>("/livestream/mappedstreamlist/" + userId)
      .pipe(
        catchError(this.handleError('deleteStream', { "Status": "Error" }))
      );
  };

  liveStreamMapping(streamObj: Object): Observable<any> {

    return this.http.post<any>("/livestream/livestreammapping", { "form_data": streamObj }, httpOptions)
      .pipe(
        catchError(this.handleError('liveStreamMapping', streamObj))
      );
  };

  streamUserRightMapping(orgId: string, userId: string, roleId: string): Observable<any> {

    return this.http.get<any>("/livestream/user/rightsmapping/" + orgId + "/" + userId + "/" + roleId)
      .pipe(
        catchError(this.handleError('deleteStream', { "Status": "Error" }))
      );
  };
}
