import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptionsArgs, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';



import { Utils } from '../helpers/utils';

@Injectable()
export class ImageService {
  private headers = new Headers({
    'Content-Type': 'application/json',
    'charset': 'UTF-8'
  });

  constructor(private http: Http, public utils: Utils) { }

  imageList(orgId: string, folder?: string, page?: string) {
    if (page == "squareicon" && folder != "home" && this.utils.isNullOrEmpty(folder)) {
      folder = "icons"
    }

    if (folder == "home") {
      folder = "";
    }

    var url = this.utils.isNullOrEmpty(folder) ? "/image/list/" + orgId : "/image/list/" + orgId + "/" + folder;

    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  saveFolder(obj: any) {
    return this.http
      .post("/image/folder/save", JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };


  crop(obj: any) {
    return this.http
      .post("/image/crop", JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  };

  deleteImage(obj: any) {
    return this.http
      .post('/image/remove', JSON.stringify({ "form_data": obj }), { headers: this.headers })
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  };

  folderList(orgId: string) {
    var url = '/image/folder/list/' + orgId;

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
