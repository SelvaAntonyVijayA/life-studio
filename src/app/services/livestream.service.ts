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
  /*private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });*/

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

    /*return this.http
      .post(liveStreamUrl, JSON.stringify(formDataToPost), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/
  };

  saveStream(obj: any) {
    return this.http.post<any>("/livestream/save", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveStream', obj))
      );

    /*return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError); */
  };

  updateStream(id: string, obj: any) {
    //var url = "/livestream/update/" + id;


    return this.http.post<any>("/livestream/update/" + id, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveStream', obj))
      );

    /*return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError); */
  };

  deleteStream(id: string) {
    //var url = '/livestream/remove/' + id;


    return this.http.get<any>("/livestream/remove/" + id)
      .pipe(
        catchError(this.handleError('deleteStream', { "Status": "Error" }))
      );

    /*return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/
  };

  getMappedStreams(userId: string) {

    return this.http.get<any>("/livestream/mappedstreamlist/" + userId)
      .pipe(
        catchError(this.handleError('deleteStream', { "Status": "Error" }))
      );

    /* return this.http
       .get("/livestream/mappedstreamlist/" + userId)
       .toPromise()
       .then(response => response.json())
       .catch(this.handleError); */
  };

  liveStreamMapping(streamObj: Object) {

    return this.http.post<any>("/livestream/livestreammapping", { "form_data": streamObj }, httpOptions)
      .pipe(
        catchError(this.handleError('liveStreamMapping', streamObj))
      );

    /*return this.http
      .post("/livestream/livestreammapping", JSON.stringify({ "form_data": streamObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/
  };

  streamUserRightMapping(orgId: string, userId: string, roleId: string) {
    return this.http.get<any>("/livestream/user/rightsmapping/" + orgId + "/" + userId + "/" + roleId)
      .pipe(
        catchError(this.handleError('deleteStream', { "Status": "Error" }))
      );


    /* return this.http
       .get("/livestream/user/rightsmapping/" + orgId + "/" + userId + "/" + roleId)
       .toPromise()
       .then(response => response.json())
       .catch(this.handleError); */
  };

  /* private handleError(error: any): Promise<any> {
     console.log('An error occurred', error);
     return Promise.reject(error.message || error);
   }; */
}
