
import { Injectable } from '@angular/core';

/*export class Common {
  public rAcesss: any = {};
  public accessList: any = {};
  public organizations: any[] = [];
};
*/

@Injectable()
export class CMS {
  public rAccess: any = {};
  public accessList: any = {};
  public organizations: any[] = [];
  public pageName: string = "";
  public scrollElemList: string[] = [];

  constructor() {

  }

  // get cms datas
  getCms() {
    return this;
  }

  destroyScroll() {
    if (this.scrollElemList.length > 0) {

    }
  };
}

