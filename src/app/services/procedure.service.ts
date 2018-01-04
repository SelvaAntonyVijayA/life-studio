import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class ProcedureService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  utils: any;

  constructor(private http: Http) {
    this.utils = Utils;
  };

  procedureList(orgId: string, procedureId?: string) {
    var procedureUrl = '/procedure/list/' + orgId;
    procedureUrl = !this.utils.isNullOrEmpty(procedureId) ? procedureUrl + "/" + procedureId : procedureUrl;
    procedureUrl = procedureUrl + "?dtype=procedure";

    return this.http
      .get(procedureUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  procedureCategoryList(orgId: string) {
    var procCategoryUrl = "/procedurecategory/list/" + orgId + "?dtype=procedure";

    return this.http
      .get(procCategoryUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  procedureCategoriesList(orgId: string) {
    let procedures = this.procedureList(orgId);
    let procedureCategories = this.procedureCategoryList(orgId);


    return Observable.forkJoin([procedures, procedureCategories]);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
