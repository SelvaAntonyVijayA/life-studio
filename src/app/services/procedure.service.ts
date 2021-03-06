
import {forkJoin as observableForkJoin,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

import { Utils } from '../helpers/utils';

@Injectable()
export class ProcedureService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http, public utils: Utils) {
  };

  saveProcedure(procObj: Object) {
    return this.http
      .post("/procedure/save", JSON.stringify({ "form_data": procObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  procedureList(orgId: string, procedureId?: string, type?: string) {
    var procedureUrl = '/procedure/list/' + orgId;
    procedureUrl = !this.utils.isNullOrEmpty(procedureId) ? procedureUrl + "/" + procedureId : procedureUrl;
    procedureUrl = procedureUrl + "?dtype=" + type;

    return this.http
      .get(procedureUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  procedureCategoryList(orgId: string, type?: string) {
    var procCategoryUrl = "/procedurecategory/list/" + orgId + "?dtype=" + type;

    return this.http
      .get(procCategoryUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  procedureCategoriesList(orgId: string, type?: string) {
    let procedures = this.procedureList(orgId, "", type);
    let procedureCategories = this.procedureCategoryList(orgId, type);


    return observableForkJoin([procedures, procedureCategories]);
  };

  getProcedureByTiles(procId: string) {
    return this.http
      .get("/procedure/getbytiles/" + procId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeProcedure(procedureId: string) {
    return this.http
      .get("/procedure/remove/" + procedureId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
