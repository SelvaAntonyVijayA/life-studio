import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utils } from '../helpers/utils';

@Injectable()
export class EnginesService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getEngines() {
    return this.http
      .get("/engine/list/")
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveEngine(obj: any) {
    var url = '/engine/save/';

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
