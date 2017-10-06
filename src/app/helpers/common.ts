
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

  constructor() {
  }

  // get cms datas
  getCms() {
    return this;
  }
}

