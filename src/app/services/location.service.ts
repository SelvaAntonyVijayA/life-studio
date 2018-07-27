import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import { Utils } from '../helpers/utils';

@Injectable()
export class LocationService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getlocation(appId: string) {
    return this.http
      .get("/cms/apps/list/" + appId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getPreferredLocation(locationId: string) {
    return this.http
      .get('/app/member/preferredlocation/assigned/' + locationId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveLocation(obj: any, orgId?: string, type?: string) {
    var url = '/location/save/';

    if (!this.utils.isNullOrEmpty(orgId) && !this.utils.isNullOrEmpty(type)) {
      url = '/location/save/' + type + "/" + orgId;
    }

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  updateLocation(id: string, obj: any) {
    var url = "/location/update/" + id;

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteLocation(obj: any, id?: string) {
    var url = "/location/remove/";

    if (!this.utils.isNullOrEmpty(id)) {
      url = '/location/remove/' + id;
    }

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeStreamByLoc(obj: any, id?: string) {
    var url = "/livestream/remove/";

    return this.http
      .post(url, JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
