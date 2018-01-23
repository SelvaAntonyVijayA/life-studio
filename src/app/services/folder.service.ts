import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Utils } from '../helpers/utils';

@Injectable()
export class FolderService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http, public utils: Utils) {
  }

  saveFolder(foldObj: Object) {
    return this.http
      .post("/tilist/save", JSON.stringify({ "form_data": foldObj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  folderList(orgId: string, folderId?: string) {
    var folderUrl = '/tilist/list/' + orgId;
    folderUrl = !this.utils.isNullOrEmpty(folderId) ? folderUrl + "/" + folderId : folderUrl;

    return this.http
      .get(folderUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  folderByTiles(folderId: string) {
    var folderUrl = '/tilist/folderbytiles/' + folderId;

    return this.http
      .get(folderUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };


  removeFolder(folderId: string) {
    return this.http
      .get("/tilist/remove/" + folderId)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error);
    return Promise.reject(error.message || error);
  };
}
