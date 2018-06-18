import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';

@Injectable()
export class SmartService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  saveSmart(smartData: Object) {
    return this.http
      .post("/smartengine/save", JSON.stringify({ "form_data": smartData }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  smartList(orgId: string, appId: string, smartObj: Object) {
    return this.http
      .post("/smartengine/list/" + orgId + "/" + appId, JSON.stringify({ "form_data": smartObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeSmart(removeObj: Object) {
    return this.http
      .post("/smartengine/remove", JSON.stringify({ "form_data": removeObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
