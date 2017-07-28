import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class HeaderService {

  constructor(private http: Http) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  domainUrl: [any] = ["/domain/get/", "/user/get", "/user/session"];

  getDomainMenus(name: string) {

    let domainMenus = this.http.post(this.domainUrl[0], JSON.stringify({ "domainName": name }), { headers: this.headers }).toPromise().then(response => response.json()).catch(this.handleError);
    let userOrgs = this.http.get(this.domainUrl[1]).toPromise().then(response => response.json()).catch(this.handleError);
    let rAccess = this.http.get(this.domainUrl[2]).toPromise().then(response => response.json()).catch(this.handleError);

    /*return this.http
      .post(this.domainUrl, JSON.stringify({ "domainName": name }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);*/

    return Observable.forkJoin([domainMenus, userOrgs, rAccess]);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
