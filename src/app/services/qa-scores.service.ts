import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';

@Injectable()
export class QaScoresService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  saveQaWeight(wgtObj: Object) {
    return this.http
      .post("/qaweights/saveweight/", JSON.stringify({ "form_data": wgtObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getQaScores(orgId: string, wgtId?: string) {
    let wgtUrl: string = "/qaweights/getweight/" + orgId;

    if (!this.utils.isNullOrEmpty(wgtId)) {
      wgtUrl = wgtUrl + "/" + wgtId;
    }

    return this.http
      .get(wgtUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeQaWeight(removeObj: Object, wgtId?: string) {
    let removeWgtUrl: string = "/qaweights/removeweight/";

    if (!this.utils.isNullOrEmpty(wgtId)) {
      removeWgtUrl = removeWgtUrl + wgtId;
    }

    let objToRemove: Object = !this.utils.isEmptyObject(removeObj) ? { "form_data": removeObj } : {};

    return this.http
      .post(removeWgtUrl, JSON.stringify(objToRemove), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getAppTileSquares(orgId: string) {
    return this.http
      .get("/qaweights/getapptilessquares/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
