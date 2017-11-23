import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TileService {
  constructor(private http: Http) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getTiles(orgId: string) {
    return this.http
      .post("/tile/list/" + orgId, JSON.stringify({}), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getTileBlocks(blockIds: string[]) {
    return this.http
      .post("/tileblock/tile/", JSON.stringify({ "blockIds": blockIds }), { headers: this.headers })
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
    
    return Observable.forkJoin([categories, tiles]);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
