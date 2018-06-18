import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';

@Injectable()
export class CategoryService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http,
    public utils: Utils) {
  }

  saveCategory(catObj: Object) {
    return this.http
      .post("/catilist/save", JSON.stringify({ "form_data": catObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  categoryList(orgId: string, catId?: string) {
    var catUrl = "/catilist/list/" + orgId;
    catUrl = !this.utils.isNullOrEmpty(catId) ? catUrl + "/" + catId : catUrl;

    return this.http
      .get(catUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeCategory(catId: string) {
    return this.http
      .get("/catilist/delete/" + catId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
