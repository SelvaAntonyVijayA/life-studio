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
}

@Injectable()
export class LocationService {

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('LocationService')
  }

  /* private headers = new Headers({
     'Content-Type': 'application/json',
     'charset': 'UTF-8'
   });*/

  private handleError: HandleError;

  getLocations(orgId?: string, appId?: string): Observable<any> {
    let locUrl = "/cms/loc/list/";

    if (!this.utils.isNullOrEmpty(orgId)) {
      locUrl = locUrl + orgId;
    }

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(appId)) {
      locUrl = locUrl + "/" + appId;
    }

    /*return this.http
      .get(locUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/

    return this.http.get<any>(locUrl)
      .pipe(
        catchError(this.handleError('getlocation', { "Status": "Error" }))
      );
  };

  getPreferredLocation(locationId: string): Observable<any> {
    /*return this.http
      .get('/app/member/preferredlocation/assigned/' + locationId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/


    return this.http.get<any>('/app/member/preferredlocation/assigned/' + locationId)
      .pipe(
        catchError(this.handleError('getPreferredLocation', { "Status": "Error" }))
      );
  };

  saveLocation(obj: any, orgId?: string, type?: string) {
    var url = '/location/save/';

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(type)) {
      url = '/location/save/' + type + "/" + orgId;
    }

    /*return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/

    return this.http.post<any>(url, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveLocation', obj))
      );
  };

  updateLocation(id: string, obj: any) {
    var url = "/location/update/" + id;

    /* return this.http
       .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
       .toPromise()
       .then(response => response.json())
       .catch(this.handleError);*/

    return this.http.post<any>(url, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('updateLocation', obj))
      );
  };

  deleteLocation(obj: any, id?: string) {
    var url = "/location/remove/";

    if (!this.utils.isNullOrEmpty(id)) {
      url = '/location/remove/' + id;
    }

    /*return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError); */

    return this.http.post<any>(url, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('deleteLocation', obj))
      );
  };

  removeStreamByLoc(obj: any, id?: string) {
    var url = "/livestream/remove/";

    /* return this.http
       .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
       .toPromise()
       .then(response => response.json())
       .catch(this.handleError);*/

    return this.http.post<any>(url, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('removeStreamByLoc', obj))
      );
  };

  /*private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };*/
}
