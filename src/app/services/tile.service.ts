
import {forkJoin as observableForkJoin,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

import { Utils } from '../helpers/utils';

@Injectable()
export class TileService {
  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getTiles(orgId: string, tileId?: string) {
    var tileUrl = "/tile/list/" + orgId;
    tileUrl = !this.utils.isNullOrEmpty(tileId) ? tileUrl + "?tileId=" + tileId : tileUrl;

    return this.http
      .post(tileUrl, JSON.stringify({}), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getTileByIds(tileIds: string[]) {
    return this.http
      .post("/tile/tilebyids/", JSON.stringify({ "tileIds": tileIds }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getTileBlocks(blockIds: string[]) {
    return this.http
      .post("/tileblock/tile/", JSON.stringify({ "blockIds": blockIds }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveTileCategory(tileCatObj: any) {
    return this.http
      .post("/tilecategory/save", JSON.stringify({ "form_data": tileCatObj }), { headers: this.headers })
      .toPromise()
      .then(response => {
        var tileCatRes = response.json();
        tileCatObj["_id"] = tileCatRes["_id"];
        return tileCatObj;
      }).catch(this.handleError);
  };

  tileUpdate(tileId: string, tileDataUpdate: any) {
    return this.http
      .post("/tile/update/" + tileId, JSON.stringify({ "form_data": tileDataUpdate }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getProfileDatas(orgId: string) {
    return this.http
      .get("/tileblock/getprofile/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getTileCategory(orgId: string) {
    return this.http
      .get("/tilecategory/list/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getTilesCategories(orgId: string) {
    let categories = this.getTileCategory(orgId);
    let tiles = this.getTiles(orgId);

    return observableForkJoin([categories, tiles]);
  };

  getLanguages() {
    return this.http
      .get("/language/list")
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getWidgetCategories(orgId: string) {
    return this.http
      .get("/tileblock/category/list/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveTileBlocks(blocks: any[], blk?: Object) {
    var blkData = blocks.length > 0 ? blocks : blk;

    return this.http
      .post("/tileblock/save", JSON.stringify({ "form_data": blkData }), { headers: this.headers })
      .toPromise()
      .then(response => {
        var blockRes = response.json();

        if (blocks.length === 0) {
          blk["_id"] = blockRes["_id"];
        }

        return blocks.length > 0 ? blockRes : blk;
      }).catch(this.handleError);
  };

  saveTile(tile: Object) {
    return this.http
      .post("/tile/save", JSON.stringify({ "form_data": tile }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  tileRemove(tileId: string) {
    return this.http
      .get("/tile/remove/" + tileId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getWidgetRights(orgId: string) {
    return this.http
      .get("/organization/getorgpackage/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  widgetCategorySave(wdgtObj: Object) {
    return this.http
      .post("/tileblock/category/save", JSON.stringify({ "form_data": wdgtObj }), { headers: this.headers })
      .toPromise()
      .then(response => {
        var wdgtCatRes = response.json();
        wdgtObj["_id"] = wdgtCatRes["_id"];
        return wdgtObj;
      }).catch(this.handleError);
  };

  getTileBlockByType(organizationId, type) {
    return this.http
      .get("/tile/blockbytype/" + organizationId + "/" + type)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
