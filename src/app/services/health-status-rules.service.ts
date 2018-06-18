import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';

@Injectable()
export class HealthStatusRulesService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  saveHsr(hsrData: Object) {
    return this.http
      .post("/hsrengine/save", JSON.stringify({ "form_data": hsrData }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  hsrList(orgId: string, ruleId?: string) {
    let hsrListUrl: string = "/hsrengine/list/" + orgId;

    if (!this.utils.isNullOrEmpty(ruleId)) {
      hsrListUrl = hsrListUrl + "/" + ruleId;
    }

    return this.http
      .get(hsrListUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getTilesAndQuestionnaireSquares(orgId: string) {
    return this.http
      .get("/hsrengine/getall/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  removeHsr(ruleId: string) {
    return this.http
      .get("/hsrengine/remove/" + ruleId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
