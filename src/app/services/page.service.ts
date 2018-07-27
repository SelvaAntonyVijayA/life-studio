import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

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
    var dataToPost = !this.utils.isNullOrEmpty(formData) && !this.utils.isEmptyObject(formData) ? { "form_data": formData } : {};

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

  pageUpdate(pageId: string, menuUpdateObj: Object) {
    var pageUrl = "/page/update/";
    pageUrl = !this.utils.isNullOrEmpty(pageId) ? pageUrl + pageId : pageUrl;

    return this.http
      .post(pageUrl, JSON.stringify({ "form_data": menuUpdateObj }), { headers: this.headers })
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

  imageUpload(url, form_data: any) {
    return this.http
      .post(url, form_data)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeMenuBackgroundImage(objToDelete: Object) {
    return this.http
      .post("/image/backgroundpatternremove/", JSON.stringify({ "form_data": objToDelete }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  menuImageList(imgObj: Object) {
    return this.http
      .post("/image/listbackground/", JSON.stringify({ "form_data": imgObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  defaultThemeList(appId: string, locationId?: string) {
    return this.http
      .get("/pages/theme/list/" + appId + "/" + locationId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  defaultThemeSaveUpdate(themeObj: Object, isSave: boolean) {
    let themeUrl = isSave ? "/pages/theme/save/" : "/pages/theme/update/" + themeObj["_id"];

    return this.http
      .post(themeUrl, JSON.stringify({ "form_data": themeObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  pageSquaresList(orgId: string, appId: string, locationId?: string) {
    let pgSquareUrl = "/pages/squares/" + orgId + "/" + appId;

    if (!this.utils.isNullOrEmpty(locationId)) {
      pgSquareUrl = pgSquareUrl + "/" + locationId;
    }

    return this.http
      .get(pgSquareUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  appPageTiles(orgId: string, appId: string, locationId?: string) {
    let pgTileUrl = "/pages/tile/" + orgId + "/" + appId;

    if (!this.utils.isNullOrEmpty(locationId)) {
      pgTileUrl = pgTileUrl + "/" + locationId;
    }

    return this.http
      .get(pgTileUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  tileSquares(orgId: string, appId: string, locationId?: string) {
    let tileSquareUrl = "/pages/questionnaires/" + orgId + "/" + appId;

    if (!this.utils.isNullOrEmpty(locationId)) {
      tileSquareUrl = tileSquareUrl + "/" + locationId;
    }

    return this.http
      .get(tileSquareUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  appProfileData(appId: string) {
    return this.http
      .get("/app/profiledata/" + appId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
