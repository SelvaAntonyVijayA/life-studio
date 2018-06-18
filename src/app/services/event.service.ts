
import {forkJoin as observableForkJoin,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';



import { Utils } from '../helpers/utils';

@Injectable()
export class EventService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http, public utils: Utils) {
    
  }

  eventSave(eventObj: any) {
    return this.http
      .post("/event/save", JSON.stringify({ "form_data": eventObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

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

  saveEventCategory(eventCatObj: Object) {
    return this.http
      .post("/eventcategory/save", JSON.stringify({ "form_data": eventCatObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getEventByTiles(eventId: string) {
    return this.http
      .get("/event/get/" + eventId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  eventCategoriesList(orgId: string) {
    let categories = this.getEventCategories(orgId);
    let events = this.eventList(orgId);

    return observableForkJoin([categories, events]);
  };

  tileActivateDeactivate(eventId: string, tileId: string, position: any, activateType: string) {
    var url = "/event/tile/" + activateType + "/" + eventId + "/" + tileId + "/" + position;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeEvent(eventId: string) {
    return this.http
      .get("/event/remove/" + eventId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
