import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class ThemeService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  utils: any;

  constructor(private http: Http) {
    this.utils = Utils;
  }

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };

  saveTheme(obj: any) {
    return this.http
      .post("/tiletheme/save", JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteTheme(id: string) {
    var url = '/tiletheme/remove/' + id;
    var obj = {};

    return this.http
      .post(id, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getUserSession() {
    var url = '/user/session';

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getThemes(orgId: string, id?: string) {
    var url = '/tiletheme/list/';
    var query = {};

    if (!this.utils.isNullOrEmpty(id)) {
      query["_id"] = id;
    } else {
      query["organizationId"] = orgId;
    }

    return this.http
      .post(url, JSON.stringify({ "form_data": query }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updatePreviewTile(id?: string) {
    var url = '/tiletheme/themetileupdate/55eea121a456cc0b7ed47cef';

    var obj = {
      "template" : id
    };

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };
}