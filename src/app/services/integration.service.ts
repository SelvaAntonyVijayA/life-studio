import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utils } from '../helpers/utils';

@Injectable()
export class IntegrationService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getIntegration(appId: string) {
    return this.http
      .get("/integration/list/" + appId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };
  
  saveIntegration(obj: any, orgId?: string, type?: string) {
    var url = '/integration/save/';

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updateIntegration(id: string, obj: any) {
    var url = "/integration/update/" + id;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteIntegration(id?: string) {
    var url = "/integration/remove/";

    if (!this.utils.isNullOrEmpty(id)) {
      url = '/integration/remove/' + id;
    }

    return this.http
      .post(url, JSON.stringify({ "form_data": {} }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
