
import {forkJoin as observableForkJoin,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';




@Injectable()
export class HeaderService {

  constructor(private http: Http) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  headerUrls: Object = {
    "domain": "/domain/get/",
    "user": "/user/get/",
    "session": "/user/session"
  };

  getDomainMenus(name: string) {
    let domainMenus = this.http.post(this.headerUrls["domain"], JSON.stringify({ "domainName": name }), { headers: this.headers }).toPromise().then(response => response.json()).catch(this.handleError);
    let userOrgs = this.http.get(this.headerUrls["user"]).toPromise().then(response => response.json()).catch(this.handleError);
    let rAccess = this.http.get(this.headerUrls["session"]).toPromise().then(response => response.json()).catch(this.handleError);

    return observableForkJoin([domainMenus, userOrgs, rAccess]);
  };

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
