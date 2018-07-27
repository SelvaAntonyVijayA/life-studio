import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utils } from '../helpers/utils';

@Injectable()
export class NotificationService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http, public utils: Utils) { }

  notificationSave(eventObj: any) {
    return this.http
      .post("/notification/save", JSON.stringify({ "form_data": eventObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  notificationPush(eventObj: any) {
    return this.http
      .post("/notification/push", JSON.stringify({ "form_data": eventObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
