import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class LivestreamService {
  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getLiveStream(orgId?: string, appId?: string, locId?: string, formData?: Object) {
    var liveStreamUrl = "/livestream/list/";

    if (!this.utils.isNullOrEmpty(orgId)) {
      liveStreamUrl = liveStreamUrl + orgId;
    }

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(appId)) {
      liveStreamUrl = "/" + liveStreamUrl + appId;
    }

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(appId) && !this.utils.isNullOrEmpty(locId)) {
      liveStreamUrl = "/" + liveStreamUrl + locId;
    }

    var formDataToPost = {};

    if (!this.utils.isEmptyObject(formData)) {
      formDataToPost["form_data"] = formData;
    }

    return this.http
      .post(liveStreamUrl, JSON.stringify(formDataToPost), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveStream(obj: any) {
    var url = '/livestream/save';

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updateStream(id: string, obj: any) {
    var url = "/livestream/update/" + id;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteStream(id: string) {
    var url = '/livestream/remove/' + id;

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
