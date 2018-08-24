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
export class RolesService {

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('RolesService')
  }

  private handleError: HandleError;

  saveRole(obj: Object): Observable<any> {
    
    return this.http.post<any>("/approles/save", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveRole', obj))
      );
  };

  getRoles(): Observable<any> {
    
    return this.http.get<any>("/role/list")
      .pipe(
        catchError(this.handleError('getRoles', { "Status": "Error" }))
      );
  };

  updateRole(roleId: string, obj: Object): Observable<any> {

    return this.http.post<any>("/approles/update/" + roleId, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveRole', obj))
      );
  };

  removeRole(roleId: string): Observable<any> {

    return this.http.get<any>("/approles/remove/" + roleId)
      .pipe(
        catchError(this.handleError('removeRole', { "Status": "Error" }))
      );
  };
}
