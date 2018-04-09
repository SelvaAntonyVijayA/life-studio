import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';

@Component({
  selector: 'app-smart',
  templateUrl: './smart.component.html',
  styleUrls: ['./smart.component.css'],
  providers: [PageService]
})
export class SmartComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    private pageService: PageService
  ) { }

  oid: string = "";
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  private orgChangeDetect: any;
  tileSort: Object = {
    "listType": "list",
    "tileSearchText": "",
    "selectedOpt": "date", "isAsc": false, "values": {
      "date": ["lastUpdatedOn", "dateCreated"],
      "title": ["title"],
      "category": ["categoryName"],
      "author": ["userName"]
    }
  };
  appList: any[] = [];
  selectedApp: string = "";
  menuGroups: any[] = [];
  smart: any[] = [];
  notifications: any[] = [];
  menuGroupSearch: string = "";

  doSort(isVal: boolean) {
    this.tileSort["isAsc"] = isVal;
  };

  changeTileView(viewName: string) {
    this.tileSort["listType"] = viewName;
  };

  checkMenuGroupArt(menuGroup: Object) {
    let result = false;

    if (!this.utils.isEmptyObject(menuGroup)) {
      if (menuGroup.hasOwnProperty("type") && menuGroup["type"] === "menu") {
        var menuArt = menuGroup.hasOwnProperty("background") && !this.utils.isNullOrEmpty(menuGroup["background"]) ? menuGroup["background"] : 'img/page_bg.jpg';

        if (menuArt !== "img/page_bg.jpg" && menuArt !== "/img/tile_default.jpg" && menuArt !== "/img/tilist_art.jpg") {
          result = true;
        }
      } else if (menuGroup["art"] !== "/img/tile_default.jpg" && menuGroup["art"] !== "/img/tilist_art.jpg" && !this.utils.isNullOrEmpty(menuGroup["art"])) {
        result = true;
      }
    }

    return result;
  };

  /* Getting and trimming the group nme */
  getGroupName(menuGroupName: string) {
    return !this.utils.isNullOrEmpty(menuGroupName) ? this.utils.htmlEncode(menuGroupName) : "";
  };

  smartDataReset() {
    this.smartReset();
    this.oid = "";
    this.appList = [];
    this.selectedApp = "";
    this.menuGroups = [];
    this.smart = [];
    this.notifications = [];
    this.menuGroupSearch = "";
    this.tileSort = {
      "listType": "list",
      "tileSearchText": "",
      "selectedOpt": "date", "isAsc": false, "values": {
        "date": ["lastUpdatedOn", "dateCreated"],
        "title": ["title"],
        "category": ["categoryName"],
        "author": ["userName"]
      }
    };
  };

  smartReset() {

  };

  appChange(appId: string) {
    this.selectedApp = appId;
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#menu-group-list", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#menu-group-list");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#menu-group-list"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#menu-group-list"]);
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {
          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];
            this.menuGroupsList();
          }else{
            this.loaderShared.showSpinner(false);
          }
        });
    }
  };

  menuGroupsList() {
    this.pageService.pageSquaresList(this.oid, this.selectedApp)
      .then(squares => {
        let menuGroupData = {
          "event": squares["event"],
          "tilist": squares["tilist"],
          "catilist": squares["catilist"],
          "livestream": squares["livestream"],
          "menu": squares["menu"]
        }

        this.smart = squares["smart"];
        this.notifications = squares["notifications"];

        this.menuGroupsConstruct(menuGroupData);
      });
  };

  getSmartObj(id: string, type: string) {
    var smart = { "engineId": id, "type": type };

    return smart;
  };

  menuGroupsConstruct(menuGroupData: Object) {
    let types = ["event", "tilist", "catilist", "livestream", "menu"];
    this.menuGroups = [];

    if (!this.utils.isEmptyObject(menuGroupData)) {
      for (let ky in menuGroupData) {
        let groupDatas = menuGroupData[ky];

        for (let i = 0; i < groupDatas.length; i++) {
          let groupObj = groupDatas[i];
          groupObj["type"] = ky;
          groupObj["menuGroupTitle"] = groupObj["type"] !== "menu" ? this.getGroupName(groupObj["name"]) : this.getGroupName(groupObj["title"]);

          if (types.indexOf(groupObj["type"]) > -1) {
            let smart = this.getSmartObj(groupObj["_id"], groupObj["type"]);

            let notificationSquares = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];
            groupObj["isSmart"] = this.checkSmartEngine(smart);
            groupObj["isNotification"] = this.checkNotification(groupObj["_id"], smart["type"], notificationSquares);
            groupObj["isRole"] = groupObj && groupObj.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty(groupObj["isRoleBased"]) ? this.utils.convertToBoolean(groupObj["isRoleBased"]) : false;
            this.menuGroups.push(groupObj);
          }
        }
      }
    }

    this.loaderShared.showSpinner(false);
  };

  checkSmartEngine = function (smrtObj: Object) {
    let objs = this.smart;
    let result = false;

    for (var i = 0; i < objs.length; i++) {
      if (objs[i].engineId == smrtObj["engineId"] && objs[i]["type"] == smrtObj["type"]) {
        result = true;
        break;
      }
    }

    return result;
  };

  checkNotification = function (id: string, type: string, notificationSquares: any[]) {
    let result = false;

    for (var i = 0; i < notificationSquares.length; i++) {
      if (notificationSquares[i]["linkId"] == id && notificationSquares[i]["linkTo"] == type) {
        result = true;
        break;
      }
    }

    return result;
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  /* Dragged tile by uniqueId */
  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };
  

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.smartDataReset();
        this.setScrollList();
        this.oid = Cookie.get('oid');
        this.getApps();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  }
}
