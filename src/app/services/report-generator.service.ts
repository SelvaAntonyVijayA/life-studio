import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';


@Injectable()
export class ReportGeneratorService {

  constructor(private http: Http, public utils: Utils) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getReportRule(orgId: string, ruleId?: string) {
    let ruleUrl: string = "/reportrule/list/" + orgId;

    if (!this.utils.isNullOrEmpty(ruleId)) {
      ruleUrl = ruleUrl + "/" + ruleId;
    }

    return this.http
      .get(ruleUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  getAppTileSquares(orgId: string) {
    return this.http
      .get("/reportrule/getallsquares/" + orgId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
