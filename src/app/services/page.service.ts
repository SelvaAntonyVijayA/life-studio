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

  getPages(orgId: string, appId: string, locId: string, formData?: Object) {
    var pageUrl = "/pages/list/" + orgId + "/" + appId + "/" + locId;
    var dataToPost = !this.utils.isNullOrEmpty(formData) && !this.utils.isEmptyObject(formData) ? {"form_data": formData} : {};

    return this.http
      .post(pageUrl, JSON.stringify(dataToPost), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getPageTiles(tileIds: any[]) {
    return this.http
      .post("/pages/getpagetiles/", JSON.stringify({ "tileIds": tileIds }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  pageSaveUpdate(menuObj: Object, type: string, menuId?: string) {
    var menuUrl = type === "save" ? "/page/save" : "/page/update/" + menuId;

    return this.http
      .post(menuUrl, JSON.stringify({ "form_data": menuObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updatePageLiveStreamImage(streamObj: Object) {
    return this.http
      .post("/page/pagestreamupdate/", JSON.stringify({ "form_data": streamObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updateLiveStreamImage(streamObj: Object) {
    return this.http
      .post("/livestream/update/", JSON.stringify({ "form_data": streamObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  pageUpdate(menuUpdateObj: Object) {
    return this.http
      .post("/page/update/", JSON.stringify({ "form_data": menuUpdateObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeMenu(menuId: string) {
    return this.http
      .get("/page/remove/" + menuId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
