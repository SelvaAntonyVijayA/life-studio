import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { TileService } from '../../services/tile.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import * as moment from 'moment-timezone';

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
    private tileService: TileService,
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
  tileList: any[] = [];
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

  selectedCategory: string = "-1";
  tileCategories: any[] = [];
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

  doSort(isVal: boolean) {
    this.tileSort["isAsc"] = isVal;
  };

  changeTileView(viewName: string) {
    this.tileSort["listType"] = viewName;
  };

  groups: any[] = [];
  pageSearchText: string = "";

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
  };

  resetAppData() {
    //this.menuGroups = [];
    this.smart = [];
    this.notifications = [];
    //this.menuGroupSearch = "";
    this.tileList = [];
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

  assignTileNoitfyIcons() {
    for (let i = 0; i < this.tileList.length; i++) {
      //let smart = this.getSmartObj(this.tileList[i]["_id"], "tile");
      //let notificationSquares = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];
      //this.tileList[i]["isSmart"] = this.checkSmartEngine(smart, true);
      // this.tileList[i]["isNotification"] = this.checkNotification(this.tileList[i]["_id"], smart["type"], notificationSquares);

      this.tileList[i] = this.tileNotifyIcons(this.tileList[i]);
    }
  };

  /*Tile Notify Icons */
  tileNotifyIcons(currTile: Object) {
    var tileNotifications = "";
    var tileSmart = "";
    var pageApps = "";
    var tileProcedure = "";
    var tileRules = "";

    if (!currTile.hasOwnProperty("isNotification")) {
      if (currTile.hasOwnProperty("notification") && currTile["notification"].hasOwnProperty("apps") && currTile["notification"]["apps"].length > 0) {
        for (let i = 0; i < currTile["notification"]["apps"].length; i++) {
          var app = currTile["notification"]["apps"][i];
          tileNotifications += i === 0 ? app.name : ", " + app.name;
        }

        currTile["isNotification"] = "block";
      } else {
        currTile["isNotification"] = "none";
      }
    }

    if (!currTile.hasOwnProperty("isSmart")) {
      if (currTile.hasOwnProperty("smart") && currTile["smart"].hasOwnProperty("apps") && currTile["smart"]["apps"].length > 0) {
        for (let i = 0; i < currTile["smart"]["apps"].length; i++) {
          var smartApp = currTile["smart"]["apps"][i];
          tileSmart += i == 0 ? smartApp.name : ", " + smartApp.name;
        }

        currTile["isSmart"] = "block";
      } else {
        currTile["isSmart"] = "none";
      }
    }

    if (!currTile.hasOwnProperty("tileApps")) {
      if (currTile.hasOwnProperty("Apps") && currTile["Apps"].length > 0) {
        for (let i = 0; i < currTile["Apps"].length; i++) {
          var app = currTile["Apps"][i];
          pageApps += i === 0 ? app.appName : ", " + app.appName;
        }
      }
    }

    if (!currTile.hasOwnProperty("isProcedure")) {
      if (currTile.hasOwnProperty("Procedure") && currTile["Procedure"].length > 0) {
        for (let i = 0; i < currTile["Procedure"].length; i++) {
          var procedure = currTile["Procedure"][i];
          tileProcedure += i === 0 ? procedure.name : ", " + procedure.name;
        }

        currTile["isProcedure"] = "block";
      } else {
        currTile["isProcedure"] = "none";
      }
    }

    if (!currTile.hasOwnProperty("isRules")) {
      if (currTile.hasOwnProperty("hsrRuleEngine") && currTile["hsrRuleEngine"].length > 0) {
        for (let i = 0; i < currTile["hsrRuleEngine"].length; i++) {
          var hsr = currTile["hsrRuleEngine"][i];
          tileRules += i === 0 ? hsr.ruleName : ", " + hsr.ruleName;
        }

        currTile["isRules"] = "block";
      } else {
        currTile["isRules"] = "none";
      }
    }

    if (!currTile.hasOwnProperty("isWgt")) {
      currTile["isWgt"] = currTile.hasOwnProperty("isWeight") && currTile["isWeight"] ? "block" : "none";
    }

    if (!currTile.hasOwnProperty("isRole")) {
      currTile["isRole"] = currTile.hasOwnProperty("isRoleBased") && currTile["isRoleBased"] ? "block" : "none";
    }

    if (!currTile.hasOwnProperty("tileNotifications")) {
      currTile["tileNotifications"] = tileNotifications;
    }

    if (!currTile.hasOwnProperty("tileSmart")) {
      currTile["tileSmart"] = tileSmart;
    }

    if (!currTile.hasOwnProperty("tileApps")) {
      currTile["tileApps"] = pageApps;
    }

    if (!currTile.hasOwnProperty("tileProcedure")) {
      currTile["tileProcedure"] = tileProcedure;
    }

    if (!currTile.hasOwnProperty("tileHealthStatusRules")) {
      currTile["tileHealthStatusRules"] = tileRules;
    }

    currTile["type"] = "tile";

    return currTile;
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
    this.tileList = [];
    this.tileCategories = [];
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

  getTilesCategories() {
    this.tileService.getTileCategory(this.oid)
      .then(tileCategory => {
        this.tileCategories = tileCategory;
      });
  };

  getAppPageTiles() {
    this.pageService.appPageTiles(this.oid, this.selectedApp, this.selectedLocation)
      .then(pageTile => {
        this.tileList = pageTile["tiles"];
        this.assignTileNoitfyIcons();
        //this.tilesSmart = pageTile["smart"];
      });
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {
          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.appChange(this.appList[0]["_id"]);

            this.selectedApp = this.appList[0]["_id"];
            this.getLocations(this.selectedApp, true);
          } else {
            this.loaderShared.showSpinner(false);
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
          this.getAppPageTiles();

        }

        this.loaderShared.showSpinner(false);
      });
  };

  appChange(appId?: string) {
    this.loaderShared.showSpinner(true);
    this.selectedApp = appId;
    this.getLocations(appId, true);
    this.notifyReset("merge");
    this.loaderShared.showSpinner(false);
  };

  locationChange(locId: string) {
    this.loaderShared.showSpinner(true);
    this.selectedLocation = locId;
    this.notifyReset("merge");
    this.squaresList();
    this.getAppPageTiles();
    this.loaderShared.showSpinner(false);
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
    this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-groups");
      this.cms["appDatas"]["scrollList"].push("#tiles-list-show");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-groups", "#tiles-list-show"];
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

  /* Dragged tile by uniqueId */
  trackByTileId(index: number, obj: any) {
    return obj["_id"];
  };

  /* Getting unique Id */
  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      console.dir(moment.tz.names())
      let loadTime = Cookie.get('pageLoadTime');
      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.notifyDataReset();
        this.setScrollList();
        this.setOrganizations();
        this.oid = Cookie.get('oid');
        this.getTilesCategories();
        this.getApps();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
