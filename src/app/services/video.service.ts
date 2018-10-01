import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Utils } from '../helpers/utils';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  videoList(orgId: string) {
    var url = "/video/keys/" + orgId;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getVideotokenId(orgId: string) {
    var url = "/video/create";

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  deleteVideo(id: any, videoId: any) {
    let url = '/video/delete/' + id + "/" + videoId;

    return this.http
      .post(url, JSON.stringify({ "form_data": {} }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
