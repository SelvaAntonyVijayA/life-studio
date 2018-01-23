import { Injectable } from '@angular/core';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Utils } from '../helpers/utils';

@Injectable()
export class CommonService {
  constructor(private mScrollbarService: MalihuScrollbarService,
    public utils: Utils) {
  }

  private appDatas: Object = {};

  setCms(option: string, value: any) {
    this.appDatas[option] = value;
  };

  destroyScroll(elem?: string[]) {
    if (this.appDatas.hasOwnProperty("scrollList") && this.appDatas["scrollList"].length > 0) {
      var scrollList = !this.utils.isNullOrEmpty(elem) && elem.length > 0 ? elem.map(x => x) : this.appDatas["scrollList"].map(x => x);

      for (let i = 0; i < scrollList.length; i++) {
        this.mScrollbarService.destroy(scrollList[i]);
      }

      if (scrollList.length > 0) {
        this.removeDestroyedScroll(scrollList);
      }
    }
  };

  removeDestroyedScroll(elemList: string[]) {
    for (let i = 0; i < elemList.length; i++) {
      var scrollIndex = this.appDatas["scrollList"].indexOf(elemList[i]);

      if (scrollIndex !== -1) {
        this.appDatas["scrollList"].splice(scrollIndex, 1);
      }
    }
  };
}
