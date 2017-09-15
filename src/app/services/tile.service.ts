import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TileService {

  constructor(private http: Http) { }

  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  getTiles(orgId: string) {
    return this.http
      .post("/tile/list/", JSON.stringify({ "organizationId": orgId }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getTileBlocks(blockIds: string[]) {
    return this.http
      .post("/tileblock/tile/", JSON.stringify({ "blockIds": blockIds }), { headers: this.headers })
      .toPromise()
      .then(
        response => response.json()
      )
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
