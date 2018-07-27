import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utils } from '../helpers/utils';

@Injectable()
export class PageSettingsService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };

  get(orgId: string, appId: string, locationId: string) {
    return this.http
      .get("/pagesettings/list/" + orgId + "/" + appId + "/" + locationId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  save(saveObj: Object) {
    return this.http
      .post("/pagesettings/save", JSON.stringify({ "form_data": saveObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  remove(id: string) {
    return this.http
      .get("/pagesettings/remove/" + id)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };
}
