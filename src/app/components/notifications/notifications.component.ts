import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [PageService]
})
export class NotificationsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private pageService: PageService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils) { }

  organizations: any[] = [];
  tilesToUpdate: any[] = [];
  isMerge: Object = {};
  draggedTiles: any[] = [];
  droppedTile: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  private orgChangeDetect: any;
  oid: string = "";
  groupType: string = "list";
  appList: any[] = [];
  selectedApp: string = "";
  locationList: any[] = [];
  selectedLocation: string = "";
  initialTileLoad: boolean = false;
  //events: any[] = [];
  //tilists: any[] = [];
  //catilists: any[] = [];
  smart: any[] = [];
  notifications: any[] = [];
  //liveStreams: any[] = [];
  menus: any[] = [];
  groupFilter: Object = {
    "groupSearch": "",
    "groupType": "-1",
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"]
      }
    },
  };
  groups: any[] = [];
  pageSearchText: string = "";

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
  };

  getTileContent(tileObj: any) {
    if (!this.utils.isEmptyObject(tileObj) && tileObj.hasOwnProperty("isSpinner")) {
      this.loaderShared.showSpinner(false);
    }

    this.initialTileLoad = true;
  };

  notifyDataReset() {
    this.notifyReset();
    this.organizations = [];
    this.oid = "";
    this.groupType = "list";
    this.appList = [];
    this.selectedApp = "";
    this.locationList = [];
    this.selectedLocation = "";
    //this.events = [];
    //this.tilists = [];
    //this.catilists = [];
    this.smart = [];
    this.notifications = [];
    // this.liveStreams = [];
    this.menus = [];
    this.groups = [];
    this.pageSearchText = "";

    this.groupFilter = {
      "groupSearch": "",
      "groupType": "-1",
      "sort": {
        "selected": "date_desc", "isAsc": false, "fieldNames": {
          "date": ["dateUpdated", "dateCreated"],
          "name": ["name"]
        }
      },
    };
  };

  notifyReset(mergeReset?: string) {
    this.isMerge = {};
    this.tilesToUpdate = [];
    this.draggedTiles = [];
    this.droppedTile = {};

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  /* Getting and trimming the group nme */
  getGroupName(grpName: string) {
    return !this.utils.isNullOrEmpty(grpName) ? this.utils.htmlEncode(grpName) : "";
  };

  /*Splitting the filtered text */
  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {
          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];

            if (!this.utils.isNullOrEmpty(this.selectedApp)) {
              this.getLocations(this.selectedApp);
            }
          }
        });
    }
  };

  getLocations(appId: string, isSpinner?: boolean) {
    if (this.locationList.length > 0) {
      this.locationList = [];
      this.selectedLocation = "";
    }

    this.pageService.getLocations(appId)
      .then(locs => {
        if (this.utils.isArray(locs) && locs.length > 0) {
          this.locationList = locs;
          this.selectedLocation = this.locationList[0]["_id"];
        }

        if (!this.utils.isNullOrEmpty(this.selectedLocation)) {
          this.squaresList();
        }
      });
  };

  appChange(appId: string) {
    this.loaderShared.showSpinner(true);
    this.selectedApp = appId;
    this.getLocations(appId, true);
    this.notifyReset("merge");
  };

  locationChange(locId: string) {
    this.loaderShared.showSpinner(true);
    this.selectedLocation = locId;
    this.notifyReset("merge");
    this.squaresList();
  };

  squaresList() {
    this.pageService.pageSquaresList(this.oid, this.selectedApp, this.selectedLocation)
      .then(squares => {

        let groupData = {
          "event": squares["event"],
          "tilist": squares["tilist"],
          "catilist": squares["catilist"],
          "livestream": squares["livestream"]
        }

        this.smart = squares["smart"];
        this.notifications = squares["notifications"];
        this.menus = squares["menu"];
        this.groups = [];

        this.pageSmartNotificationAssign();
        this.groupSmartNotificationAssign(groupData);
      });
  };

  pageSmartNotificationAssign(menuObj?: Object) {
    let currMenuDatas = !this.utils.isEmptyObject(menuObj) ? [menuObj] : this.menus;

    for (let i = 0; i < this.menus.length; i++) {
      let menu = this.menus[i];
      let smart = this.getSmartObj(menu["_id"], "menu");
      let notificationSquares = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];
      menu["isSmart"] = this.checkSmartEngine(smart);
      menu["isNotification"] = this.checkNotification(menu["_id"], smart["type"], notificationSquares);
      menu["isRole"] = menu && menu.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty(menu["isRoleBased"]) ? this.utils.convertToBoolean(menu["isRoleBased"]) : false;
    }

    if (!this.utils.isEmptyObject(menuObj)) {
      var menuIdx = this.menus.map(mnu => { return mnu['_id']; }).indexOf(menuObj["_id"]);

      if (menuIdx !== -1) {
        this.menus[menuIdx] = menuObj;
      }
    }
  };

  groupSmartNotificationAssign(grpData: Object, isUpdate?: boolean) {
    let types = ["event", "tilist", "catilist", "livestream"];
    let groupResult = [];

    if (!this.utils.isEmptyObject(grpData)) {
      for (let ky in grpData) {
        let groupDatas = grpData[ky];

        for (let i = 0; i < groupDatas.length; i++) {
          let groupObj = groupDatas[i];
          groupObj["type"] = ky;

          if (types.indexOf(groupObj["type"]) > -1) {
            let smart = this.getSmartObj(groupObj["_id"], groupObj["type"]);

            let notificationSquares = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];
            groupObj["isSmart"] = this.checkSmartEngine(smart);
            groupObj["isNotification"] = this.checkNotification(groupObj["_id"], smart["type"], notificationSquares);
            groupObj["isRole"] = groupObj && groupObj.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty(groupObj["isRoleBased"]) ? this.utils.convertToBoolean(groupObj["isRoleBased"]) : false;
            groupResult.push(groupObj);
          }
        }
      }

      if (groupResult && groupResult.length > 0) {
        if (isUpdate) {
          for (let i = 0; i < groupResult.length; i++) {
            let grpObj = groupResult[i];

            if (types.indexOf(grpObj["type"]) > -1) {
              var grpIdx = this.groups.map(evt => { return evt['_id']; }).indexOf(grpObj["_id"]);

              if (grpIdx !== -1) {
                this.groups[grpIdx] = grpObj
              }
            }
          }
        } else {
          this.groups = groupResult;
        }
      }
    }
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

  getSmartObj(id: string, type: string) {
    var smart = { "engineId": id, "type": type };

    return smart;
  };

  /* Filter Changing */
  filterChange(val: any, fieldName: string) {
    if (fieldName === "groupType") {
      this.groupFilter["groupType"] = val;
    }

    if (fieldName === "sort") {
      var sortOpt = val.split("_");
      this.groupFilter[fieldName]["selected"] = val;
      this.groupFilter[fieldName]["isAsc"] = sortOpt[1] === "asc" ? true : false;
    }
  };


  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#main-container-groups", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-groups");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-groups"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#main-container-groups"]);
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
        this.notifyDataReset();
        this.setScrollList();
        this.setOrganizations();
        this.oid = Cookie.get('oid');
        this.getApps();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
