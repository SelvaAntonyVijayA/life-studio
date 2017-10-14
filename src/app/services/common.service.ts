import { Injectable } from '@angular/core';

@Injectable()
export class CommonService {
  private appDatas: Object = {};

  setCms(option: string, value: any) {
    this.appDatas[option] = value;
  };
}
