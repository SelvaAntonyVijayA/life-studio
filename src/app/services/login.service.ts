import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
//import { Login } from '../models/login';

@Injectable()
export class LoginService {
  constructor(private http: Http) {

  };

  userUrl: string = "/user/login/";

  public login(username: string, password: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'charset': 'UTF-8'
    });

    var lgObj: Object = {};
    lgObj["form_data"] = { "email": username, "password": password };

    return this.http
      .post(this.userUrl, JSON.stringify(lgObj), { headers: headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  public handleError(error: any) {

  }
}
