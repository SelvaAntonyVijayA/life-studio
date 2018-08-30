import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { TileService } from '../../services/tile.service';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs';

import * as moment from 'moment-timezone';
import * as _ from 'underscore';
import { MomentData } from '../../helpers/momentdata';

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
    private notifyService: NotificationService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    public momentData: MomentData
  ) { }

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
  notificationSquares: any[] = [];
  notification: any = {};
  //liveStreams: any[] = [];
  menus: any[] = [];
  timeZones: any[] = [];
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
  draggedGroups: Object = {
    "event": {},
    "tilist": {},
    "catilist": {},
    "livestream": {},
    "menu": {}
  };
  isImageLibrary: string = "none";
  imglibData: object = {};
  isRecurrencePopup: boolean = false;
  recurrenceData: object = {};

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
    this.smart = [];
    this.groups = [];
    this.notifications = [];
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

  onDrag($event: any, type: any) {
    let data = $event.dragData;
  }

  onDrop($event: any) {
    let data = $event.dragData;
    let draggedObj = this.setDragged(data, data["type"]);

    if (this.notification.hasOwnProperty("dragged")) {
      this.notification["dragged"].unshift(draggedObj);
    } else {
      this.notification["dragged"] = [draggedObj];
    }
  }

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
    let splittedVal = val.split("_");

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
        this.squaresList();
        //this.tilesSmart = pageTile["smart"];
      });
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {
          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
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

        this.menus = [];
        this.groups = [];
        this.smart = [];
        this.notifications = [];

        this.smart = squares["smart"];
        this.notifications = squares["notifications"];
        this.menus = squares["menu"];
        this.pageGroupNotificationAssign();
        this.groupSmartNotificationAssign(groupData);

        this.loadNotifications()
      });
  };

  pageGroupNotificationAssign(menuObj?: Object) {
    let currMenuDatas = !this.utils.isEmptyObject(menuObj) ? [menuObj] : this.menus;

    for (let i = 0; i < this.menus.length; i++) {
      let menu = this.menus[i];
      let smart = this.getSmartObj(menu["_id"], "menu");
      let squares = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];

      menu["type"] = "menu";
      menu["isSmart"] = this.checkSmartEngine(smart);
      menu["isNotification"] = this.checkNotification(menu["_id"], smart["type"], squares);
      menu["isRole"] = menu && menu.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty(menu["isRoleBased"]) ? this.utils.convertToBoolean(menu["isRoleBased"]) : false;
    }

    if (!this.utils.isEmptyObject(menuObj)) {
      let menuIdx = this.menus.map(mnu => { return mnu['_id']; }).indexOf(menuObj["_id"]);

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
              let grpIdx = this.groups.map(evt => { return evt['_id']; }).indexOf(grpObj["_id"]);

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

    for (let i = 0; i < objs.length; i++) {
      if (objs[i].engineId == smrtObj["engineId"] && objs[i]["type"] == smrtObj["type"]) {
        result = true;
        break;
      }
    }

    return result;
  };

  checkNotification = function (id: string, type: string, squares: any[]) {
    let result = false;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i]["linkId"] == id && squares[i]["linkTo"] == type) {
        result = true;
        break;
      }
    }

    return result;
  };

  getSmartObj(id: string, type: string) {
    let smart = { "engineId": id, "type": type };

    return smart;
  };

  /* Filter Changing */
  filterChange(val: any, fieldName: string) {
    if (fieldName === "groupType") {
      this.groupFilter["groupType"] = val;
    }

    if (fieldName === "sort") {
      let sortOpt = val.split("_");
      this.groupFilter[fieldName]["selected"] = val;
      this.groupFilter[fieldName]["isAsc"] = sortOpt[1] === "asc" ? true : false;
    }
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#main-container-groups", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#main_notify_drag_container", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-groups");
      this.cms["appDatas"]["scrollList"].push("#tiles-list-show");
      this.cms["appDatas"]["scrollList"].push("#main_notify_drag_container");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-groups", "#main_notify_drag_container", "#tiles-list-show"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#main-container-groups", "#main_notify_drag_container", "#tiles-list-show"]);
  };

  /* disabled option(trigger type) When Tile is triggered */
  checkTriggerDisabled(drg: any, index: any) {
    if (drg["linkTo"] == "event" || drg["linkTo"] == "catilist" || drg["linkTo"] == "tilist") {
      return false;
    }

    return true;
  };

  /* push manual button event */
  push(drg: any, index: any) {
    let draggedObj = !this.utils.isEmptyObject(drg) && drg.hasOwnProperty("obj") ? drg["obj"] : {};

    var updateData = {};
    updateData["_id"] = this.notification["_id"];
    updateData["index"] = "index_" + index;
    updateData["linkTo"] = draggedObj.linkTo;
    updateData["linkId"] = draggedObj.linkId;

    var data = {};
    data["type"] = draggedObj.linkTo;
    data["value"] = draggedObj.linkId;
    data["groupId"] = !this.utils.isEmptyObject(drg) && typeof drg.group._id == 'undefined' ? "" : drg.group._id;
    data["locationId"] = this.selectedLocation;

    var notify = {};
    notify["messages"] = data;
    notify["notificationText"] = !this.utils.isEmptyObject(drg) ? drg.notificationText : "";
    notify["appId"] = this.selectedApp;

    var obj = {};
    obj["notify"] = notify;
    obj["data"] = updateData;

    let post = {};
    post["form_data"] = JSON.stringify(obj);

    this.pushNotification(post, updateData, index);
  };

  /* push manul notification */
  pushNotification(data: object, square: object, index: any) {
    debugger;

    this.notifyService.notificationPush(data)
      .then(res => {

        if (res.data) {
          var tiles = res.data.notificationTiles;

          for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].linkId == square["linkId"] && tiles[i].linkTo == square["linkTo"]) {

              var dateTime = tiles[i] && typeof tiles[i].pusheddatetime != 'undefined' ? tiles[i].pusheddatetime : "";

              let currDrg = this.notification["dragged"][index];

              currDrg["setPushedDate"] = this.utils.toLocalDateTime(dateTime);
            }
          }
        }

        this.utils.iAlert("success", "", "Notification has been pushed");
      });
  }

  /* Replicate Dragged */
  replicateDragged(drg: any) {
    let replicatedDragged = !this.utils.isEmptyObject(drg) && drg.hasOwnProperty("obj") ? drg["obj"] : {};
    let replicatedObj = this.setDragged(replicatedDragged, drg["linkTo"], {}, true);

    this.notification["dragged"].unshift(replicatedObj);
  };

  /* Delete dragged object */
  deleteDragged(drgObj: Object, idx: number) {
    //let totalIdx = this.notification["dragged"].length - 1;
    // let currIdx = totalIdx - idx;

    this.notification["dragged"].splice(idx, 1);
  };

  draggedActivateDeactivate(e: any, drgObj: Object) {
    e.preventDefault();

    drgObj["activate"] = !drgObj["activate"];
  };

  onRecurrenceClose(imglib: object) {
    this.isRecurrencePopup = false;
    let currDrg = this.notification["dragged"][imglib["data"]["index"]];
    //currDrg["imageUrl"] = imglib["url"];
  };

  onRecurrenceResult(imglib: object) {
    this.isRecurrencePopup = true;
    let currDrg = this.notification["dragged"][imglib["data"]["index"]];
    //currDrg["imageUrl"] = imglib["url"];
  };

  onImageLibraryClose(imglib: object) {
    this.isImageLibrary = 'none';
    let currDrg = this.notification["dragged"][imglib["data"]["index"]];
    currDrg["imageUrl"] = imglib["url"];
  };

  onImageLibraryResult(imglib: object) {
    this.isImageLibrary = 'none';
    let currDrg = this.notification["dragged"][imglib["data"]["index"]];
    currDrg["imageUrl"] = imglib["url"];
  };

  setTriggeType(triggerType: any, draggedObj: object, index: any) {

    draggedObj["type"] == triggerType;

    if (triggerType == "date") {
      draggedObj["dateVisibility"] = true;
      draggedObj["isZoneLocalTime"] = !this.utils.isNullOrEmpty(draggedObj["zoneLocalTime"]) && (Date.parse(draggedObj["triggerTime"]) != Date.parse(draggedObj["zoneLocalTime"])) ? true : false;
    } else if (triggerType == "trigger") {
      draggedObj["dateVisibility"] = false;
      draggedObj["isZoneLocalTime"] = false;
    } else {
      draggedObj["dateVisibility"] = false;
      draggedObj["isZoneLocalTime"] = false;
    }

  };

  imageArt(e: any, idx: number) {
    e.preventDefault();

    this.isImageLibrary = 'block';
    this.imglibData = { index: idx };
  };

  recurrencePopup(e: any, drgObj: Object, idx: number) {
    e.preventDefault();

    let dragged = {
      "index": idx,
      "rrule": !this.utils.isEmptyObject(drgObj) && drgObj.hasOwnProperty("rrule") && !this.utils.isNullOrEmpty(drgObj["rrule"]) ? drgObj["rrule"] : "",
      "timeZoneName": !this.utils.isEmptyObject(drgObj) && drgObj.hasOwnProperty("timeZoneName") && !this.utils.isNullOrEmpty(drgObj["timeZoneName"]) ? drgObj["timeZoneName"] : "",
    };

    this.isRecurrencePopup = true;
    this.recurrenceData = dragged;
  };

  assignSquareDatas(notifyObj: Object) {
    this.notification["obj"] = notifyObj;

    if (!this.utils.isEmptyObject(notifyObj)) {
      this.notification["dragged"] = [];

      let menuTiles = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];

      for (let i = 0; i < menuTiles.length; i++) {
        //for (let i = menuTiles.length - 1; 0 <= i; i--) {
        let currDrg = menuTiles[i];
        let currObj = {};

        if (!this.utils.isEmptyObject(currDrg) && currDrg.hasOwnProperty("linkTo") && !this.utils.isNullOrEmpty(currDrg["linkTo"])) {
          if (currDrg["linkTo"] === "menu") {
            let pgIndex = this.menus.map(pg => { return pg['_id']; }).indexOf(currDrg["linkId"]);

            if (pgIndex !== -1) {
              currObj = this.menus[pgIndex];
            }

          } else if (currDrg["linkTo"] === "tile") {
            let tileIndex = this.tileList.map(curTile => { return curTile['_id']; }).indexOf(currDrg["linkId"]);

            if (tileIndex !== -1) {
              currObj = this.tileList[tileIndex];
            }

          } else {
            let grpIndex = this.groups.map(grp => { return grp['_id']; }).indexOf(currDrg["linkId"]);

            if (grpIndex !== -1) {
              currObj = this.groups[grpIndex];
            }
          }

          if (!this.utils.isEmptyObject(currObj)) {
            let drgObj = this.setDragged(currObj, currDrg["linkTo"], currDrg);
            this.notification["dragged"].push(drgObj);
          }
        }
      }
    }
  };

  setDragObjectName(dragObj: Object, type: string) {
    var dragName = "";

    if (!this.utils.isEmptyObject(dragObj)) {
      dragName = type === "menu" ? dragObj["title"] : type === "tile" ? dragObj["title"] : dragObj["name"];

      if (!this.utils.isNullOrEmpty(dragName)) {
        dragName = this.utils.htmlEncode(dragName);
      }
    }

    return dragName;
  };

  /* save button event" */
  saveNotification(e: any) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.loaderShared.showSpinner(true);
  };

  save(callback) {
    let id = this.notification.hasOwnProperty("obj") && this.notification["obj"].hasOwnProperty("_id") ? this.notification["obj"]["_id"] : "-1";
    let notificationPage = {
      dateCreated: (new Date()).toUTCString(),
      appId: this.selectedApp,
      orgId: this.oid,
      locationId: this.selectedLocation,
      dateUpdated: (new Date()).toUTCString()
    };

    if (id && id != '') {
      notificationPage["_id"] = id;
    }

    var statusUpdate = this.checkValues(id);

    if (!statusUpdate["result"]) {
      this.utils.iAlert("info", 'Information', statusUpdate["msg"]);
      return false;
    }

    notificationPage["notificationTiles"] = this.getDraggedGroups();
    notificationPage["notifyToRemove"] = this.handleNotificationMatching(notificationPage["notificationTiles"]);

    var objString = JSON.stringify(notificationPage);

    setTimeout(function () {
      this.notifyService.saveNotification(objString)
        .then(res => {
          this.utils.iAlert("info", 'Information', 'Notification updated successfully');

          // notificationSquaresObj = notificationPage.notificationTiles;

          this.listMenu(function () {
            var text = this.pageSearchText
            this.filterApp(text);

            if (callback) {
              callback();
            }
          });
        });
    }, 0);
  };


  handleNotificationMatching(draggedTiles) {
    let notifyToRemove = [];

    if (this.notificationSquares.length > 0) {
      _.each(this.notificationSquares, function (index, tile) {
        let linkTo = tile["linkTo"];
        let linkId = tile["linkId"];
        let squareObj = { "linkTo": linkTo, "linkId": linkId };
        let squareList = _.where(draggedTiles, squareObj);
        let oldList = _.where(this.notificationSquares, squareObj);

        if ((squareList.length != oldList.length) || squareList.length == 0) {
          var removedList = _.where(notifyToRemove, squareObj);

          if (removedList.length == 0) {
            notifyToRemove.push(squareObj);
          }
        }
      });
    }
    return notifyToRemove;
  };

  /*getting the dragged groups */

  getDraggedGroups() {

  };

  /*validate the dragged groups */
  checkValues(id: string) {
    let draggedTiles = this.notification["dragged"];
    let result = true;
    let data = {};
    let tile = {};

    _.each(draggedTiles, function () {
      let obj = this;

      if (obj) {
        var utcDate = "";

        if (this.triggerTime == "") {
          result = false;
          data["msg"] = "DateTime cannot be empty";
        }

        if (this.triggerTime != "") {
          utcDate = this.momentData.convertToTimeZoneDateTime(this.triggerTime, this.timeZoneName);

          let isDateCheck = false;

          if (id && id != '') {
            let oldStartDate = this.oldTriggerTime != "" ? new Date(this.momentData.convertToTimeZoneDateTime(this.oldTriggerTime, this.timeZoneName)) : "";
            let pickeddate = new Date(utcDate);

            if (oldStartDate != "" && oldStartDate.valueOf() != pickeddate.valueOf()) {
              isDateCheck = true;
            }

            if (oldStartDate == "") {
              isDateCheck = true;
            }

          } else {
            isDateCheck = true;
          }

          if (isDateCheck && !this.pastDateValidate(utcDate)) {
            result = false;
            data["msg"] = "The start date and time must be greater than the current date and time";
          }
        }
      }
    });

    data["result"] = result;

    return data;
  };

  /* date validation with current date */
  pastDateValidate(value) {
    var pickeddate = new Date(value);
    var todayDate = new Date();

    if (pickeddate.valueOf() > todayDate.valueOf()) {
      return true;
    } else {
      return false;
    }
  };

  /* Setting dragging Groups, Menus, Tiles */
  setDragged(currObj: Object, type: string, squareObj?: object, isReplicate?: boolean) {
    let dragged = {
      "uniqueId": this.getUniqueId(),
      "name": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("name") && !this.utils.isNullOrEmpty(squareObj["name"]) ? this.utils.htmlEncode(squareObj["name"]) : this.setDragObjectName(currObj, type),
      "imageUrl": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("imageUrl") && !this.utils.isNullOrEmpty(squareObj["imageUrl"]) ? squareObj["imageUrl"] : "/img/tile_default.jpg",
      "activate": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("activate") && !this.utils.isNullOrEmpty(squareObj["activate"]) ? squareObj["activate"] : false,
      "isPushed": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("isPushed") && !this.utils.isNullOrEmpty(squareObj["isPushed"]) ? squareObj["isPushed"] : false,
      "type": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("type") && !this.utils.isNullOrEmpty(squareObj["type"]) ? squareObj["type"] : "date",
      "isRecurrence": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("isRecurrence") && !this.utils.isNullOrEmpty(squareObj["isRecurrence"]) ? squareObj["isRecurrence"] : false,
      "linkId": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("linkId") && !this.utils.isNullOrEmpty(squareObj["linkId"]) ? squareObj["linkId"] : "",
      "linkTo": type,
      "rrule": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("rrule") && !this.utils.isNullOrEmpty(squareObj["rrule"]) ? squareObj["rrule"] : "",
      "notificationText": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("notificationText") && !this.utils.isNullOrEmpty(squareObj["notificationText"]) ? this.utils.htmlEncode(squareObj["notificationText"]) : "",
      "pusheddatetime": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("pusheddatetime") && !this.utils.isNullOrEmpty(squareObj["pusheddatetime"]) ? this.utils.toLocalDateTime(squareObj["pusheddatetime"]) : "",
      "oldTriggerTime": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("triggerTime") && !this.utils.isNullOrEmpty(squareObj["triggerTime"]) ? squareObj["triggerTime"] : "",
      "triggerTime": !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("triggerTime") && !this.utils.isNullOrEmpty(squareObj["triggerTime"]) ? squareObj["triggerTime"] : "",
    };

    if (squareObj && (type == "event" || type == "catilist" || type == "tilist" || type == "livestream")) {
      dragged["title"] = "Groups: " + dragged["name"];
    } else if (squareObj && type == "tile") {
      dragged["title"] = "Tile: " + dragged["name"];
    } else if (squareObj && type == "menu") {
      dragged["title"] = "Page: " + dragged["name"];
    }


    dragged["activateText"] = dragged["activate"] ? "Deactivate" : "Activate";
    dragged["timeZoneName"] = squareObj && squareObj.hasOwnProperty("timeZoneName") && !this.utils.isNullOrEmpty(squareObj["timeZoneName"]) ? squareObj["timeZoneName"] : this.momentData.getCurrenTimeZone();
    dragged["zoneLocalTime"] = !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("triggerTime") && !this.utils.isNullOrEmpty(squareObj["triggerTime"]) ? this.utils.toLocalDateTime(squareObj["triggerTime"]) : "";
    dragged["dateVisibility"] = dragged["type"] == "date" ? true : false;
    dragged["triggerIsDisable"] = dragged["triggerTime"] != "" ? '' : 'disabled';

    if (!this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("triggerTime") && !this.utils.isNullOrEmpty(squareObj["triggerTime"])) {
      dragged.triggerTime = this.momentData.getLocalDateToTimeZoneDate(dragged.triggerTime, dragged["timeZoneName"]);
    }

    if (dragged["type"] == "date") {
      dragged["isZoneLocalTime"] = !this.utils.isNullOrEmpty(dragged["zoneLocalTime"]) && (Date.parse(dragged["triggerTime"]) != Date.parse(dragged["zoneLocalTime"])) ? true : false;
    } else {
      dragged["isZoneLocalTime"] = false;
    }

    if (squareObj && squareObj["group"] && squareObj["group"]._id) {
      dragged["isGroup"] = true;
      dragged["groupId"] = squareObj["group"]._id;
      dragged["groupType"] = squareObj["group"].type;
      dragged["groupName"] = squareObj["group"].name;
    }
    else {
      dragged["isGroup"] = false;
      dragged["groupId"] = "";
      dragged["groupType"] = "";
      dragged["groupName"] = "";
    }

    if (!this.utils.isEmptyObject(squareObj)) {
      if (dragged.rrule != "" && dragged.rrule.indexOf('BYHOUR=') !== -1 && dragged["timeZoneName"] != "") {
        dragged.rrule = this.convertTimezoneHourMinutes(dragged.rrule, dragged.triggerTime, dragged["timeZoneName"]);
      }
    }

    if (dragged.rrule != "") {
      dragged["ruleButtonText"] = "Edit";
      dragged["isRecurrenceDelete"] = true;
      dragged["rruleString"] = !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("rruleString") && !this.utils.isNullOrEmpty(squareObj["rruleString"]) ? squareObj["rruleString"] : "";
    } else {
      dragged["ruleButtonText"] = "Recurrence";
      dragged["isRecurrenceDelete"] = false;
    }

    if (this.utils.isEmptyObject(squareObj)) {
      dragged["isRecurrence"] = true;
    }

    dragged["group"] = squareObj && squareObj["group"] ? squareObj["timeZoneName"] : this.momentData.getCurrenTimeZone();

    if (type === "event") {
      dragged["availableStart"] = !this.utils.isEmptyObject(currObj) && currObj.hasOwnProperty("eventStart") && !this.utils.isNullOrEmpty(currObj["eventStart"]) ? (currObj["eventStart"]) : "";
      dragged["availableEnd"] = !this.utils.isEmptyObject(currObj) && currObj.hasOwnProperty("availableEnd") && !this.utils.isNullOrEmpty(currObj["availableEnd"]) ? (currObj["availableEnd"]) : "";
    }

    var offset = moment.tz(dragged["timeZoneName"]).format('Z');
    var timeZoneObj = {
      timeZoneName: dragged["timeZoneName"],
      timeZoneOffSet: offset
    };

    dragged["zone"] = JSON.stringify(timeZoneObj);

    dragged["obj"] = currObj;

    return dragged;
  };

  convertTimezoneHourMinutes = function (recurrence, date, timeZone) {
    let timeObj = this.isHourAndMinutesCheck(recurrence);

    if (timeObj && timeObj.time) {
      let fmt = "MM/DD/YYYY h:mm A";
      let m = moment.tz(date, fmt, timeZone);

      m.utc();

      let hours;
      let minutes;

      if (m.hour() < 10) {
        hours = "0" + m.hour();
      }

      if (m.minutes() < 10) {
        minutes = "0" + m.minutes();
      }

      let hourReplace = "BYHOUR=" + timeObj.byhour;
      let mintesReplace = "BYMINUTE=" + timeObj.byminute;

      recurrence = recurrence.replace(hourReplace, "BYHOUR=" + hours);
      recurrence = recurrence.replace(mintesReplace, "BYMINUTE=" + minutes);
    }

    return recurrence;
  }

  isHourAndMinutesCheck = function (icaldata) {
    var interval, byday, bymonth, bymonthday, byhour, byminute, count, until;
    var day, month, year, weekday, ical, endHours, endMins;
    var i, matches, match, matchIndex, template, d, input, index;
    var rule = this.parseIcal(icaldata);

    if (rule.RRULE === undefined) {
      return "";
    } else {
      matches = /INTERVAL=([0-9]+);?/.exec(rule.RRULE);
      if (matches) {
        interval = matches[1];
      } else {
        interval = '1';
      }

      matches = /BYHOUR=([0-9]+);?/.exec(rule.RRULE);
      if (matches) {
        byhour = matches[1];
      } else {
        byhour = '1';
      }

      matches = /BYMINUTE=([0-9]+);?/.exec(rule.RRULE);
      if (matches) {
        byminute = matches[1];
      } else {
        byminute = '1';
      }

      matches = /BYDAY=([^;]+);?/.exec(rule.RRULE);
      if (matches) {
        byday = matches[1];
      } else {
        byday = '';
      }

      matches = /BYMONTHDAY=([^;]+);?/.exec(rule.RRULE);
      if (matches) {
        bymonthday = matches[1].split(",");
      } else {
        bymonthday = null;
      }

      matches = /BYMONTH=([^;]+);?/.exec(rule.RRULE);
      if (matches) {
        bymonth = matches[1].split(",");
      } else {
        bymonth = null;
      }

      matches = /COUNT=([0-9]+);?/.exec(rule.RRULE);
      if (matches) {
        count = matches[1];
      } else {
        count = null;
      }

      matches = /UNTIL=([0-9T]+);?/.exec(rule.RRULE);
      if (matches) {
        until = matches[1];
      } else {
        until = null;
      }

      matches = /BYSETPOS=([^;]+);?/.exec(rule.RRULE);
      if (matches) {
      }

      if (byhour && byminute && byhour != "") {
        var obj = {
          byhour: byhour,
          byminute: byminute,
          time: byhour + ":" + byminute
        }

        return obj;
      }
    }
  };

  parseLine(icalline) {
    var result = {};
    var pos = icalline.indexOf(':');
    var property = icalline.substring(0, pos);
    result["value"] = icalline.substring(pos + 1);

    if (property.indexOf(';') !== -1) {
      pos = property.indexOf(';');
      result["parameters"] = property.substring(pos + 1);
      result["property"] = property.substring(0, pos);
    } else {
      result["parameters"] = null;
      result["property"] = property;
    }
    return result;
  }

  parseIcal(icaldata) {
    var lines = [];
    var result = {};
    var propAndValue = [];
    var line = null;
    var nextline;

    lines = icaldata.split('\n');
    lines.reverse();
    while (true) {
      if (lines.length > 0) {
        nextline = lines.pop();
        if (nextline.charAt(0) === ' ' || nextline.charAt(0) === '\t') {
          // Line continuation:
          line = line + nextline;
          continue;
        }
      } else {
        nextline = '';
      }

      // New line; the current one is finished, add it to the result.
      if (line !== null) {
        line = this.parseLine(line);
        // We ignore properties for now
        if (line.property === 'RDATE' || line.property === 'EXDATE') {
          result[line.property] = this.cleanDates(line.value);
        } else {
          result[line.property] = line.value;
        }
      }

      line = nextline;
      if (line === '') {
        break;
      }
    }
    return result;
  }

  cleanDates(dates) {
    // Get rid of timezones
    // TODO: We could parse dates and range here, maybe?
    var result = [];
    var splitDates = dates.split(',');
    var date;

    for (date in splitDates) {
      if (splitDates.hasOwnProperty(date)) {
        if (splitDates[date].indexOf('Z') !== -1) {
          result.push(splitDates[date].substring(0, 15));
        } else {
          result.push(splitDates[date]);
        }
      }
    }
    return result;
  }

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

  /* Select notifications */
  loadNotifications() {
    this.notificationSquares = this.utils.isArray(this.notifications) && this.notifications.length > 0 && this.notifications[0].hasOwnProperty("notificationTiles") && this.notifications[0]["notificationTiles"].length > 0 ? this.notifications[0]["notificationTiles"] : [];
    this.assignSquareDatas(this.utils.isArray(this.notifications) && this.notifications.length > 0 ? this.notifications[0] : {})
  };

  setPageTitle(pg: object) {
    return !this.utils.isNullOrEmpty(pg["title"]) && pg["title"].length > 10 && (pg["isSmart"] || pg["isRole"] || pg["isNotification"]) ? pg["title"].slice(0, 10) + "..." : pg["title"];
  };

  setZoneTime(locatime: string) {
    return !this.utils.isNullOrEmpty(locatime) ? locatime + " (local time)" : "";
  };

  setPushedDate(pushedDate: string) {
    return !this.utils.isNullOrEmpty(pushedDate) ? "Pushed&nbsp;At&nbsp;:&nbsp;&nbsp;" + pushedDate.slice(0, 10) : "";
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
        this.getTilesCategories();
        this.getApps();
        this.timeZones = this.momentData.getTimeZones();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
