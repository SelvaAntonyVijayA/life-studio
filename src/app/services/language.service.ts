import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';

@Injectable()
export class LanguageService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getList() {
    return this.http
      .get('/language/list')
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveLanguage(obj: any) {
    var url = '/language/save';

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updateLanguage(id: string, obj: any) {
    var url = "/language/update/" + id;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };


  assignLanguageToApp(appId: string, obj: any) {
    var url = "/cms/apps/update/" + appId;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteLanguage(id: string) {
    var url = '/language/remove/' + id;

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
