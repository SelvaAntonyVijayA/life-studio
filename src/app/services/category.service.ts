import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class CategoryService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  utils: any;

  constructor(private http: Http) {
    this.utils = Utils;
  }

  categoryList(orgId: string, catId: string) {
    var catUrl = "/catilist/list/" + orgId;
    catUrl = !this.utils.isNullOrEmpty(catId) ? catUrl + "/" + catId : catUrl;

    return this.http
      .get(catUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
