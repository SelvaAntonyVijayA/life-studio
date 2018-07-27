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
export class UserService {

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService, public utils: Utils) {
    this.handleError = httpErrorHandler.createHandleError('UserService')
  }

  private handleError: HandleError;

  save(userObj: Object): Observable<any> {

    return this.http.post<any>("/user/save", { "form_data": userObj }, httpOptions)
      .pipe(
        map(res => {
          return res;
        }),
        catchError(this.handleError('saveUser', userObj))
      );
  };

  update(id: string, obj: any): Observable<any> {

    return this.http.post<any>("/user/update/" + id, { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('updateUser', obj))
      );
  };

  saveUserApp(obj: any): Observable<any> {

    return this.http.post<any>("/user/appSaveByUser", { "form_data": obj }, httpOptions)
      .pipe(
        catchError(this.handleError('saveUserApp', obj))
      );
  };

  createdUserChk(obj: any): Observable<any> {

    return this.http.post<any>("/user/createdcheck", obj, httpOptions)
      .pipe(
        catchError(this.handleError('createdUserChk', obj))
      );
  };

  remove(obj): Observable<any> {

    return this.http.post<any>("/user/remove", obj, httpOptions)
      .pipe(
        catchError(this.handleError('remove', obj))
      );
  };
}
