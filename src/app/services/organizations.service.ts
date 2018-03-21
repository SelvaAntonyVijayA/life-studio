import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OrganizationsService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http, public utils: Utils) { }

  organizationList() {
    var url = '/organization/list';

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveOrganization(obj: any, type: string) {
    var url = '/organization/save/';

    if (!this.utils.isNullOrEmpty(type)) {
      url = '/organization/save/' + type
    }

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updateOrganization(id: string, obj: any) {
    var url = "/organization/update/" + id;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteOrganization(id: string) {
    var url = '/organization/remove/' + id;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  packageUpdate(id: string, obj: any) {
    var url = "/organization/packageupdate/" + id;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  packageList(id: string) {
    var url = '/organization/getorgpackage/' + id;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  organizationTypeList() {
    var url = '/organizationtype/list';

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getPackages() {
    var url = '/package/list';

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveOrganzationType(obj: any) {
    return this.http
      .post("/organizationtype/save", JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteOrganzationType(id: string) {
    var url = '/organizationtype/remove/' + id;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };


  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
