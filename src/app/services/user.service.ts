import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { Utils } from '../helpers/utils';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  save(userObj: Object) {
    return this.http
      .post("/user/save", JSON.stringify({ "form_data": userObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  update(id: string, obj: any) {
    return this.http
      .post("/user/update/" + id, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveUserApp(obj: any) {
    return this.http
      .post("/user/appSaveByUser", JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  createdUserChk(obj: any){
    return this.http
    .post("/user/createdcheck", JSON.stringify(obj), { headers: this.headers })
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError); 
  };

  remove(obj){
    return this.http
    .post("/user/remove", JSON.stringify(obj), { headers: this.headers })
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError); 
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
