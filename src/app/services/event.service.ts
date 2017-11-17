import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class EventService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  utils: any;

  constructor(private http: Http) {
    this.utils = Utils;
  }

  eventList(orgId: string, eventId?: string) {
    var eventUrl = '/event/list/' + orgId;
    eventUrl = !this.utils.isNullOrEmpty(eventId) ? eventUrl + "/" + eventId : eventUrl;

    return this.http
      .get(eventUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getEventCategories(orgId: string) {
    return this.http
      .get("/eventcategory/list/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
