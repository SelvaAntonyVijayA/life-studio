import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class PageService {
  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getApps(orgId: string) {
    return this.http
      .get("/cms/apps/list/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getLocations(appId: string) {
    return this.http
      .get("/location/list/" + appId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getPages(orgId: string, appId: string, locId: string) {
    var pageUrl = "/pages/list/" + orgId + "/" + appId + "/" + locId;

    return this.http
      .get(pageUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
