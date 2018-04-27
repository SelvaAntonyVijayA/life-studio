import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { TileService } from '../../services/tile.service';
import { PageService } from '../../services/page.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { EventService } from '../../services/event.service';
import { FolderService } from '../../services/folder.service';
import { CategoryService } from '../../services/category.service';
import { ProcedureService } from '../../services/procedure.service';
import { LivestreamService } from '../../services/livestream.service';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/debounceTime';


declare var $: any;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
  providers: [PageService, LivestreamService]
})
export class PagesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private tileService: TileService,
    private pageService: PageService,
    private eventService: EventService,
    private folderService: FolderService,
    private categoryService: CategoryService,
    private procedureService: ProcedureService,
    private liveStreamService: LivestreamService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils) {
  }

  /* Variables Intialization */
  organizations: any[] = [];
  tilesToUpdate: any[] = [];
  isMerge: Object = {};
  draggedTiles: any[] = [];
  droppedTile: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  private orgChangeDetect: any;
  oid: string = "";
  groupType: string = "list";
  languageList: any[] = [];
  selectedLanguage: string = "en";
  appList: any[] = [];
  selectedApp: string = "";
  locationList: any[] = [];
  selectedLocation: string = "";
  pageList: any[] = [];
  selectedPage: string = "";
  pageSearchText: string = "";
  groups: any[] = [];
  page: Object = {};
  dragIndex: number = -1;
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
  draggedGroups: Object = {
    "event": {},
    "tilist": {},
    "catilist": {},
    "livestream": {},
    "procedure": {},
    "process": {},
    "menu": {}
  };

  pageTitle: string = "";
  pageInDetail: boolean = false;
  noTabShow: boolean = false;
  hidden: boolean = false;
  randomOrder: boolean = false;
  alphabeticalOrder: boolean = false;
  livestreamOnTop: boolean = false;
  isMenuBg: boolean = false;
  menuBgObj: Object = {};
  setupFrom: string = "default";
  defaultTheme: Object = {};
  initialTileLoad: boolean = false;
  isImageLibrary: string = "none";
  imglibData: object = {};

  /* Setting dragging Groups, Menus, Tiles */
  setDragged(currObj: Object, type: string, menuItem?: Object, drgExits?: boolean, procedure?: Object) {
    var dragged = {
      "uniqueId": this.getUniqueId(),
      "menuName": !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("name") && !this.utils.isNullOrEmpty(menuItem["name"]) ? menuItem["name"] : this.setDragObjectName(currObj, type),
      "art": !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("imageUrl") && !this.utils.isNullOrEmpty(menuItem["imageUrl"]) ? menuItem["imageUrl"] : "/img/tile_default.jpg",
      "activate": !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("activate") && !this.utils.isNullOrEmpty(menuItem["activate"]) ? menuItem["activate"] : true,
      "showName": !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("showName") && !this.utils.isNullOrEmpty(menuItem["showName"]) ? menuItem["showName"] : false,
      "type": type
    };

    if (type === "event") {
      dragged["availableDate"] = !this.utils.isEmptyObject(currObj) && currObj.hasOwnProperty("eventStart") && !this.utils.isNullOrEmpty(currObj["eventStart"]) ? this.utils.toLocalDateTime(currObj["eventStart"], "mm/dd/yy") : !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("availableOn") && !this.utils.isNullOrEmpty(menuItem["availableOn"]) ? this.utils.toLocalDateTime(menuItem["availableOn"], "mm/dd/yy") : "";
      dragged["availableTime"] = !this.utils.isEmptyObject(currObj) && currObj.hasOwnProperty("eventStart") && !this.utils.isNullOrEmpty(currObj["eventStart"]) ? this.utils.toLocalDateTime(currObj["eventStart"], "g:ii a") : !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("availableOn") && !this.utils.isNullOrEmpty(menuItem["availableOn"]) ? this.utils.toLocalDateTime(menuItem["availableOn"], "g:ii a") : "";
      dragged["endDate"] = !this.utils.isEmptyObject(currObj) && currObj.hasOwnProperty("availableEnd") && !this.utils.isNullOrEmpty(currObj["availableEnd"]) ? this.utils.toLocalDateTime(currObj["availableEnd"], "mm/dd/yy") : !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("endOn") && !this.utils.isNullOrEmpty(menuItem["endOn"]) ? this.utils.toLocalDateTime(menuItem["endOn"], "mm/dd/yy") : "";
      dragged["endTime"] = !this.utils.isEmptyObject(currObj) && currObj.hasOwnProperty("availableEnd") && !this.utils.isNullOrEmpty(currObj["availableEnd"]) ? this.utils.toLocalDateTime(currObj["availableEnd"], "g:ii a") : !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("endOn") && !this.utils.isNullOrEmpty(menuItem["endOn"]) ? this.utils.toLocalDateTime(menuItem["endOn"], "g:ii a") : "";
    }

    if (!this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("wideSquare") && !this.utils.isNullOrEmpty(menuItem["wideSquare"])) {
      dragged["topSquare"] = menuItem["wideSquare"] ? true : false;
      dragged["orderFirst"] = !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("orderFirst") && !this.utils.isNullOrEmpty(menuItem["orderFirst"]) ? menuItem["orderFirst"] : false;
    } else {
      dragged["topSquare"] = !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("topSquare") && !this.utils.isNullOrEmpty(menuItem["topSquare"]) ? menuItem["topSquare"] : false;
      dragged["orderFirst"] = dragged["topSquare"];
    }

    dragged["requiresPermission"] = !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("requiresPermission") && !this.utils.isNullOrEmpty(menuItem["requiresPermission"]) ? menuItem["requiresPermission"] : false;
    dragged["isPrivate"] = !this.utils.isEmptyObject(menuItem) && menuItem.hasOwnProperty("isPrivate") && !this.utils.isNullOrEmpty(menuItem["isPrivate"]) ? menuItem["isPrivate"] : false;

    if (type === "tile" && !this.utils.isEmptyObject(procedure)) {
      dragged["procedureId"] = procedure.hasOwnProperty("procedureId") ? procedure["procedureId"] : "";
      dragged["procedureName"] = procedure.hasOwnProperty("procedureName") ? procedure["procedureName"] : "";
      dragged["isProcedureSquare"] = procedure.hasOwnProperty("isProcedureSquare") ? procedure["isProcedureSquare"] : false;
    }

    if (type === "tile" && !this.utils.isEmptyObject(currObj)) {
      var currTile = {};

      if (!drgExits) {
        var tile = this.tileNotifyIcons(currObj);

        currTile = {
          "_id": tile.hasOwnProperty("_id") ? tile["_id"] : "-1",
          "title": tile.hasOwnProperty("title") && !this.utils.isNullOrEmpty(tile["title"]) ? tile["title"] : "",
          "art": tile.hasOwnProperty("art") && !this.utils.isNullOrEmpty(tile["art"]) ? tile["art"] : "",
          "categoryName": tile.hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(tile["categoryName"]) ? tile["categoryName"] : "",
          "tileApps": tile["tileApps"],
          "isWgt": tile["isWgt"],
          "tileHealthStatusRules": tile["tileHealthStatusRules"],
          "isRules": tile["isRules"],
          "tileProcedure": tile["tileProcedure"],
          "isProcedure": tile["isProcedure"],
          "tileSmart": tile["tileSmart"],
          "isSmart": tile["isSmart"],
          "tileNotifications": tile["tileNotifications"],
          "isNotification": tile["isNotification"],
          "isRole": tile["isRole"]
        }
      }

      dragged["obj"] = !drgExits ? currTile : currObj;
    } else {
      dragged["obj"] = currObj;
    }

    return dragged;
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  /* Refreshing whole page data */
  pageDataReset() {
    this.pageReset();
    this.organizations = [];
    this.oid = "";
    this.groupType = "list";
    this.languageList = [];
    this.appList = [];
    this.selectedApp = "";
    this.locationList = [];
    this.selectedLocation = "";
    this.pageList = [];
    this.groups = [];
    this.groupFilter = {
      "groupSearch": "",
      "groupType": "-1",
      "sort": {
        "selected": "date_desc", "isAsc": false, "fieldNames": {
          "date": ["dateUpdated", "dateCreated"],
          "name": ["name"]
        }
      }
    };
  };

  /*Refresh current Page data */
  pageReset(mergeReset?: string) {
    this.isMerge = {};
    this.tilesToUpdate = [];
    this.draggedTiles = [];
    this.droppedTile = {};
    this.page = {};
    this.selectedLanguage = "en";
    this.selectedPage = "";
    this.pageSearchText = "";
    this.resetDraggedGroups();
    this.dragIndex = -1;
    this.pageTitle = "";
    this.pageInDetail = false;
    this.noTabShow = false;
    this.hidden = false;
    this.randomOrder = false;
    this.alphabeticalOrder = false;
    this.livestreamOnTop = false;
    this.isMenuBg = false;
    this.resetBlankMenu();
    this.menuBgObj = {};
    this.setupFrom = "default";
    this.isImageLibrary = "none";
    this.imglibData = {};

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }
  };

  getTileContent(tileObj: any) {
    if (!this.utils.isEmptyObject(tileObj) && tileObj.hasOwnProperty("isSpinner")) {
      this.loaderShared.showSpinner(false);
    }

    this.initialTileLoad = true;
  };

  /* Getting page title from the current language */
  getPageTitle(pg: Object) {
    pg["pageTitle"] = this.selectedLanguage === "en" && !this.utils.isNullOrEmpty(pg["title"]) ? this.utils.htmlEncode(pg["title"]) : this.selectedLanguage !== "en" && pg.hasOwnProperty(this.selectedLanguage) && !this.utils.isNullOrEmpty(pg[this.selectedLanguage]["title"]) ? this.utils.htmlEncode(pg[this.selectedLanguage]["title"]) : "";
  };

  setPageTitle(pg: object) {
    return !this.utils.isNullOrEmpty(pg["pageTitle"]) && pg["pageTitle"].length > 10 && (pg["isSmart"] || pg["isRole"] || pg["isNotification"]) ? pg["pageTitle"].slice(0, 10) + "..." : pg["pageTitle"];
  };

  /* Getting and trimming the group nme */
  getGroupName(grpName: string) {
    return !this.utils.isNullOrEmpty(grpName) ? this.utils.htmlEncode(grpName) : "";
  };

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
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

  showAppNamesAssigned(squareObj: Object, type?: string, groupName?: string) {
    var tileNotifications = "";
    var tileSmart = "";
    var pageApps = "";
    var tileProcedure = "";

    if (!this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("notification") && squareObj["notification"].hasOwnProperty("apps") && this.utils.isArray(squareObj["notification"]["apps"]) && squareObj["notification"]["apps"].length > 0) {
      for (let i = 0; i < squareObj["notification"]["apps"].length; i++) {
        var app = squareObj["notification"]["apps"][i];
        tileNotifications += i === 0 ? app["name"] : ", " + app.name;
      }
    }

    if (!this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("smart") && squareObj["smart"].hasOwnProperty("apps") && this.utils.isArray(squareObj["smart"]["apps"]) && squareObj["smart"]["apps"].length > 0) {
      for (let i = 0; i < squareObj["smart"]["apps"].length; i++) {
        var app = squareObj["smart"]["apps"][i];
        tileSmart += i === 0 ? app["name"] : ", " + app["name"];
      }
    }

    if (!this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("Apps") && this.utils.isArray(squareObj["Apps"]) && squareObj["Apps"].length > 0) {
      for (let i = 0; i < squareObj["Apps"].length; i++) {
        var app = squareObj["Apps"][i];
        pageApps += i === 0 ? app["appName"] : ", " + app["appName"];
      }
    }

    if (!this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("Procedure") && this.utils.isArray(squareObj["Procedure"]) && squareObj["Procedure"].length > 0) {
      for (let i = 0; i < squareObj["Procedure"].length; i++) {
        var pro = squareObj["Procedure"][i];
        tileProcedure += i === 0 ? pro["name"] : ", " + pro["name"];
      }
    }

    squareObj["tileNotifications"] = tileNotifications;
    squareObj["tileSmart"] = tileSmart;
    squareObj["tileApps"] = pageApps;
    squareObj["tileProcedure"] = tileProcedure;
    squareObj["isRole"] = !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("isRoleBased") && squareObj["isRoleBased"] ? true : false;
    squareObj["isSmart"] = !this.utils.isNullOrEmpty(tileSmart) ? true : false;
    squareObj["isNotification"] = !this.utils.isNullOrEmpty(tileNotifications) ? true : false;

    if (!this.utils.isNullOrEmpty(type) && type === "page") {
      squareObj[squareObj["_id"]] = "menu";
      this.getPageTitle(squareObj);
    } else {
      squareObj[squareObj["_id"]] = "groups";
      squareObj["type"] = groupName;
    }
  };

  getLanguages() {
    if (this.languageList.length === 0) {
      this.tileService.getLanguages()
        .then(langs => {
          this.languageList = langs;
        });
    }
  };

  languageChange(langCode: string) {
    this.selectedLanguage = langCode;

    if ((this.page.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.page["obj"])) && ((this.selectedLanguage !== "en" && this.page["obj"].hasOwnProperty(this.selectedLanguage)) || this.selectedLanguage === "en")) {
      this.checkPageMenu('Would you like to save your previous work?', 'Save', 'Discard', false, (r) => {
        if (r) {
          this.savePage("", false, "lang");
        } else {
          this.setPageData(true, this.page["obj"]);
        }
      });
    }
  };

  appChange(appId: string) {
    this.loaderShared.showSpinner(true);
    this.selectedApp = appId;
    this.getLocations(appId, true);
    this.pageReset("merge");
  };

  locationChange(locId: string) {
    this.loaderShared.showSpinner(true);
    this.selectedLocation = locId;
    this.pageReset("merge");
    this.getPages("", true, true);
    this.getPageDefaultTheme();
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

        var spinnerStatus = isSpinner ? true : false;
        this.getPages("", true, spinnerStatus);
        this.getPageDefaultTheme();
      });
  };

  getPageDefaultTheme() {
    this.defaultTheme = {};

    if (!this.utils.isNullOrEmpty(this.selectedApp) && this.selectedApp !== "-1" && !this.utils.isNullOrEmpty(this.selectedLocation) && this.selectedLocation !== "-1") {
      this.pageService.defaultThemeList(this.selectedApp, this.selectedLocation)
        .then(themes => {
          if (this.utils.isArray(themes) && themes.length > 0) {
            this.defaultTheme = themes[0];
          }
        });
    }
  };

  assignGroups() {
    var types = ['event', 'tilist', 'catilist', 'livestream', 'procedure', 'process'];

    this.getListGroups().subscribe(grps => {
      this.groups = [];

      for (let i = 0; i < grps.length; i++) {
        var currGrp = grps[i];

        for (let j = 0; j < currGrp.length; j++) {
          this.showAppNamesAssigned(currGrp[j], 'groups', types[i]);
        }

        this.groups = this.groups.concat(currGrp);
      }
    });
  };

  getPages(pageId?: string, isSelect?: boolean, isSpinner?: boolean) {
    if (!this.utils.isNullOrEmpty(this.selectedApp) && !this.utils.isNullOrEmpty(this.selectedLocation)) {
      this.pageService.getPages(this.oid, this.selectedApp, this.selectedLocation)
        .then(pgs => {
          if (this.utils.isArray(pgs) && pgs.length > 0) {
            this.pageList = pgs;
            this.selectedPage = this.pageList[0]["_id"];
            this.pageAssignedValues();

            if (isSelect) {
              this.selectPage("", this.pageList[0], false, true);
            }
          } else {
            this.pageList = [];
          }

          if (isSpinner) {
            this.loaderShared.showSpinner(false);
          }
        });
    } else if (this.utils.isNullOrEmpty(pageId)) {
      if (isSpinner) {
        this.loaderShared.showSpinner(false);
      }
      this.pageList = [];
    }
  };

  pageAssignedValues() {
    for (let i = 0; i < this.pageList.length; i++) {
      var currPage = this.pageList[i];

      if (!currPage.hasOwnProperty("position")) {
        currPage["position"] = i;
      }

      this.showAppNamesAssigned(currPage, 'page');
    }
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  pgMoveUpDown(pg: Object, move: string, idx: number) {
    var totalIdx = this.pageList.length - 1;
    var fromStart = idx === 0 ? true : false;
    var fromEnd = totalIdx === idx ? true : false;
    var toIdx = fromEnd && move === "up" ? idx - 1 : fromStart && move === "down" ? idx + 1 : -1;

    if (toIdx !== -1 && (fromStart || fromEnd)) {
      this.pageList[toIdx]["position"] = idx;
      pg["position"] = toIdx;
    } else if (toIdx === -1 && !fromStart && !fromEnd) {
      toIdx = move === "up" ? idx - 1 : idx + 1;
      this.pageList[toIdx]["position"] = idx;
      pg["position"] = toIdx
    }
  };

  getListGroups() {
    //var types = ['event', 'tilist', 'catilist', 'livestream', 'procedure', 'process'];
    var liveStreamPost = { "organizationId": this.oid, "createdApp.id": this.selectedApp };
    var evtRes = this.eventService.eventList(this.oid);
    var folRes = this.folderService.folderList(this.oid);
    var catRes = this.categoryService.categoryList(this.oid);
    var liveRes = this.liveStreamService.getLiveStream("", "", "", liveStreamPost);
    var procedureRes = this.procedureService.procedureList(this.oid, "", "procedure");
    var processRes = this.procedureService.procedureList(this.oid, "", "process");

    return Observable.forkJoin([evtRes, folRes, catRes, liveRes, procedureRes, processRes]);
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#main-container-pages", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#main-container-groups", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#dragged-pages-groups-tiles", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-pages");
      this.cms["appDatas"]["scrollList"].push("#main-container-groups");
      this.cms["appDatas"]["scrollList"].push("#dragged-pages-groups-tiles");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-pages", "#main-container-groups", "#dragged-pages-groups-tiles"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#main-container-pages", "#main-container-groups", "#dragged-pages-groups-tiles"]);
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

    return currTile;
  };

  /* Dragged tile on drop */
  private onDrop(data: Object, isDynamic: boolean) {
    if (!this.utils.isNullOrEmpty(data)) {
      var drgObjType = data.hasOwnProperty(data["_id"]) ? data[data["_id"]] : "tile";
      var currType = drgObjType === "groups" ? data["type"] : drgObjType;

      if (currType !== "tile") {
        this.draggedGroups[currType][data["_id"]] = data;
      }

      if (currType === "tile") {
        this.droppedTile = data;
      } else {
        if (currType === "menu") {
          var pgIndex = this.pageList.map(pg => { return pg['_id']; }).indexOf(data["_id"]);
          this.pageList.splice(pgIndex, 1);
        } else {
          var grpIndex = this.groups.map(grp => { return grp['_id']; }).indexOf(data["_id"]);
          this.groups.splice(grpIndex, 1);
        }
      }

      var draggedObj = this.setDragged(data, currType);

      if (this.page.hasOwnProperty("dragged")) {

        if (this.dragIndex === -1) {
          this.page["dragged"].push(draggedObj);
        } else {
          var currIdx = this.dragIndex;

          if (!isDynamic) {
            this.page["dragged"].splice(currIdx, 1);
          } else {
            this.page["dragged"][currIdx] = draggedObj;
          }

          this.dragIndex = -1;
        }
      } else {
        this.page["dragged"] = [draggedObj];
      }
    }
  };

  /* Getting unique Id */
  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  resetDraggedGroups() {
    for (let curType in this.draggedGroups) {
      var currObj = this.draggedGroups[curType];

      if (!this.utils.isEmptyObject(currObj)) {
        for (let id in currObj) {
          var currData = currObj[id];

          if (curType === "menu") {
            this.pageList.push(currData);
          } else {
            this.groups.push(currData);
          }
        }
      }
    }

    this.draggedGroups = {
      "event": {},
      "tilist": {},
      "catilist": {},
      "livestream": {},
      "procedure": {},
      "process": {},
      "menu": {}
    };
  };

  /* Adding Dynamic draggable */
  addDraggable(idx: number) {
    var dragged = { "uniqueId": this.getUniqueId(), "pageDragContainer": true };
    var totalIdx = this.page["dragged"].length - 1;

    if (this.dragIndex === -1) {
      this.dragIndex = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
      this.page["dragged"].splice(this.dragIndex, 0, dragged);
    } else if (this.dragIndex > -1) {
      var fromIdx = this.dragIndex;
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.page["dragged"], fromIdx, toIdx);
        var move = this.page["draggedTiles"];
        //this.dragIndex = toIdx;
      }
    }
  };

  /* Replicate Dragged */
  replicateDragged(drg: any) {
    var replicatedDragged = !this.utils.isEmptyObject(drg) && drg.hasOwnProperty("obj") ? drg["obj"] : {};
    var replicatedObj = this.setDragged(replicatedDragged, drg["type"], {}, true);
    this.page["dragged"].push(replicatedObj);
  };

  /* Move dragged up and down */
  moveUpDown(move: string, idx: number) {
    var totalIdx = this.page["dragged"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.page["dragged"], fromIdx, toIdx);
  };

  /* Delete dragged object */
  deleteDragged(drgObj: Object, idx: number) {

    var totalIdx = this.page["dragged"].length - 1;
    var currIdx = totalIdx - idx;
    var currDrgObj = drgObj["obj"];

    if (drgObj["type"] === "tile") {
      this.droppedTile = {};
      this.droppedTile = currDrgObj;
    } else {
      if (drgObj["type"] === "menu") {
        this.pageList.push(currDrgObj);
      } else {
        this.groups.push(currDrgObj);
      }
    }

    this.page["dragged"].splice(currIdx, 1);
  };

  draggedActivateDeactivate(e: any, drgObj: Object) {
    e.preventDefault();
    drgObj["activate"] = !drgObj["activate"];
  };

  setDragObjectName(dragObj: Object, type: string) {
    var dragName = "";

    if (!this.utils.isEmptyObject(dragObj)) {
      dragName = type === "menu" ? dragObj["pageTitle"] : type === "tile" ? dragObj["title"] : dragObj["name"];

      if (!this.utils.isNullOrEmpty(dragName)) {
        dragName = this.utils.htmlEncode(dragName);
      }
    }

    return dragName;
  };

  selectPage(e: any, pgObj: Object, isSave?: boolean, initial?: boolean) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    var self = this;
    var pgExist = false;

    if (pgObj.hasOwnProperty("_id")) {
      this.loaderShared.showSpinner(true);

      if (!this.utils.isEmptyObject(this.page) && this.page.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.page["obj"])) {
        if (this.page["obj"].hasOwnProperty("_id") && !this.utils.isNullOrEmpty(this.page["obj"]["_id"])) {
          pgExist = this.page["obj"]["_id"] === pgObj["_id"] ? true : false;
        }
      }

      if (!pgExist) {
        this.checkPageMenu('Would you like to save your previous work?', 'Save', 'Discard', false, (r) => {
          if (r) {
            this.savePage("", false, "select", pgObj);
          } else {
            var isSpinner = initial && !this.initialTileLoad ? false : true;
            this.setPageData(true, pgObj, isSpinner);
          }
        });
      } else {
        this.loaderShared.showSpinner(false);
      }
    }
  };

  setPageData(isSelect: boolean, obj: any, isSpinner?: boolean) {
    if (isSelect) {
      this.pageReset();

      var menuTiles = this.selectedLanguage === "en" && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("menuTiles") && obj["menuTiles"].length > 0 ? obj["menuTiles"] : this.selectedLanguage !== "en" && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty(this.selectedLanguage) && obj[this.selectedLanguage].hasOwnProperty("menuTiles") && obj[this.selectedLanguage]["menuTiles"].length > 0 ? obj[this.selectedLanguage]["menuTiles"] : [];

      if (menuTiles.length > 0) {
        for (let i = 0; i < menuTiles.length; i++) {
          var currDrg = menuTiles[i];
          if (!this.utils.isEmptyObject(currDrg) && currDrg.hasOwnProperty("linkTo") && !this.utils.isNullOrEmpty(currDrg["linkTo"])) {
            if (currDrg["linkTo"] === "tile") {
              this.draggedTiles.push(currDrg["linkId"]);
            }
          }
        }
      }
    }

    if (isSelect && this.draggedTiles.length > 0) {
      this.pageService.getPageTiles(this.draggedTiles)
        .then(objTiles => {
          if (this.utils.isArray(objTiles) && objTiles.length > 0) {
            //this.assignEventDatas(evtObj[0]);
            //this.updateTileInterval();
            this.assignEventDatas(objTiles, obj);
          }

          if (isSpinner) {
            this.loaderShared.showSpinner(false);
          }
        });
    } else {
      if (isSpinner) {
        this.loaderShared.showSpinner(false);
      }

      this.assignEventDatas([], obj);
    }
  };

  assignEventDatas(currTiles: any[], pgObj: Object) {
    this.page["obj"] = pgObj;

    if (!this.utils.isEmptyObject(pgObj)) {
      this.page["dragged"] = [];
      var pgTitle = this.selectedLanguage === "en" && pgObj.hasOwnProperty("title") && !this.utils.isNullOrEmpty(pgObj["title"]) ? pgObj["title"] : pgObj.hasOwnProperty(this.selectedLanguage) && pgObj[this.selectedLanguage].hasOwnProperty("title") && !this.utils.isNullOrEmpty(pgObj[this.selectedLanguage]["title"]) ? pgObj[this.selectedLanguage]["title"] : "";
      this.pageTitle = pgTitle;

      this.pageInDetail = pgObj.hasOwnProperty("pageInDetail") && !this.utils.isNullOrEmpty(pgObj["pageInDetail"]) ? this.utils.convertToBoolean(pgObj["pageInDetail"]) : false;
      this.noTabShow = pgObj.hasOwnProperty("noTabShow") && !this.utils.isNullOrEmpty(pgObj["noTabShow"]) ? this.utils.convertToBoolean(pgObj["noTabShow"]) : false;
      this.hidden = pgObj.hasOwnProperty("hidden") && !this.utils.isNullOrEmpty(pgObj["hidden"]) ? this.utils.convertToBoolean(pgObj["hidden"]) : false;
      this.randomOrder = pgObj.hasOwnProperty("randomOrder") && !this.utils.isNullOrEmpty(pgObj["randomOrder"]) ? this.utils.convertToBoolean(pgObj["randomOrder"]) : false;
      this.alphabeticalOrder = pgObj.hasOwnProperty("alphabeticalOrder") && !this.utils.isNullOrEmpty(pgObj["alphabeticalOrder"]) ? this.utils.convertToBoolean(pgObj["alphabeticalOrder"]) : false;
      this.livestreamOnTop = pgObj.hasOwnProperty("livestreamOnTop") && !this.utils.isNullOrEmpty(pgObj["livestreamOnTop"]) ? this.utils.convertToBoolean(pgObj["livestreamOnTop"]) : false;

      var menuTiles = this.selectedLanguage === "en" && pgObj.hasOwnProperty("menuTiles") && pgObj["menuTiles"].length > 0 ? pgObj["menuTiles"] : this.selectedLanguage !== "en" && pgObj.hasOwnProperty(this.selectedLanguage) && pgObj[this.selectedLanguage].hasOwnProperty("menuTiles") ? pgObj[this.selectedLanguage]["menuTiles"] : [];

      for (let i = menuTiles.length - 1; 0 <= i; i--) {
        var currDrg = menuTiles[i];
        var currObj = {};

        if (!this.utils.isEmptyObject(currDrg) && currDrg.hasOwnProperty("linkTo") && !this.utils.isNullOrEmpty(currDrg["linkTo"])) {
          if (currDrg["linkTo"] === "menu") {
            var pgIndex = this.pageList.map(pg => { return pg['_id']; }).indexOf(currDrg["linkId"]);

            if (pgIndex !== -1) {
              currObj = this.pageList[pgIndex];
              this.pageList.splice(pgIndex, 1);
            } else if (this.draggedGroups["menu"].hasOwnProperty(currDrg["linkId"])) {
              currObj = this.draggedGroups["menu"][currDrg["linkId"]];
            }
          } else if (currDrg["linkTo"] === "tile") {
            var tileIndex = currTiles.map(curTile => { return curTile['_id']; }).indexOf(currDrg["linkId"]);

            if (tileIndex !== -1) {
              currObj = currTiles[tileIndex];
            }
          } else {
            var grpIndex = this.groups.map(grp => { return grp['_id']; }).indexOf(currDrg["linkId"]);

            if (grpIndex !== -1) {
              currObj = this.groups[grpIndex];
              this.groups.splice(grpIndex, 1);
            } else if (this.draggedGroups[currDrg["linkTo"]].hasOwnProperty(currDrg["linkId"])) {
              currObj = this.draggedGroups[currDrg["linkTo"]][currDrg["linkId"]];
            }
          }

          if (!this.utils.isEmptyObject(currObj)) {
            var drgObj = this.setDragged(currObj, currDrg["linkTo"], currDrg, false);
            this.page["dragged"].push(drgObj);

            if (currDrg["linkTo"] !== "tile") {
              if (!this.draggedGroups[currDrg["linkTo"]].hasOwnProperty(currDrg["linkTo"])) {
                this.draggedGroups[currDrg["linkTo"]][currDrg["linkId"]] = currObj;
              }
            }
          }
        }
      }
    }
  };

  getPagePostion() {
    var pgCount = this.pageList.length - 1;
    var drgMenus = Object.keys(this.draggedGroups["menu"]);
    var drgMenuCount = drgMenus.length - 1;
    var totalCount = pgCount + drgMenuCount + 1;

    return totalCount;
  };

  getDraggedMenuTiles(isSave: boolean) {
    var items = [];
    var chatTiles = [];
    var streamImageToUpdate = {};
    var obj = {};


    if (this.page.hasOwnProperty("dragged") && this.page["dragged"].length > 0) {

      for (let i = this.page["dragged"].length - 1; 0 <= i; i--) {
        var currDrg = this.page["dragged"][i];

        if (!currDrg.hasOwnProperty('pageDragContainer')) {
          var drgItem = {};

          drgItem["name"] = currDrg["menuName"];
          drgItem["linkTo"] = currDrg["type"];
          drgItem["linkId"] = currDrg["obj"]["_id"];
          drgItem["imageUrl"] = currDrg["art"];
          drgItem["activate"] = currDrg["activate"];

          if (drgItem["linkTo"] === "tile") {
            drgItem["isChat"] = currDrg["obj"].hasOwnProperty("ischat") && !this.utils.isNullOrEmpty(currDrg["obj"]["ischat"]) ? this.utils.convertToBoolean(currDrg["obj"]["ischat"]) : false;

            if (drgItem["isChat"]) {
              chatTiles.push(drgItem);
            }
          }

          if (currDrg.hasOwnProperty("procedureId")) {
            drgItem["procedureId"] = currDrg["procedureId"];
          }

          if (currDrg.hasOwnProperty("procedureName")) {
            drgItem["procedureName"] = currDrg["procedureName"];
          }

          if (currDrg.hasOwnProperty("isProcedureSquare")) {
            drgItem["isProcedureSquare"] = currDrg["isProcedureSquare"];
          }

          if (drgItem["linkTo"] === "event" || drgItem["linkTo"] === "catilist" || drgItem["linkTo"] === 'tilist') {
            var grpObj = currDrg["obj"];

            var currDateStart = drgItem["linkTo"] === "event" ? grpObj["eventStart"] : grpObj["availableStart"];

            if (currDateStart && !this.utils.isNullOrEmpty(this.utils.trim(currDateStart))) {
              drgItem["availableOn"] = this.utils.toUTCDateTime(currDateStart);
              drgItem["endOn"] = this.utils.toUTCDateTime(grpObj["availableEnd"]);
            }
          }

          if (drgItem["linkTo"] === "livestream" && isSave) {
            var lvStrmObj = currDrg["obj"];

            if (lvStrmObj["art"] !== drgItem["imageUrl"]) {
              if (!streamImageToUpdate.hasOwnProperty(drgItem["linkId"])) {
                streamImageToUpdate[drgItem["linkId"]] = drgItem["imageUrl"];
              }
            }
          }

          drgItem["showName"] = currDrg["showName"];
          drgItem["topSquare"] = currDrg["topSquare"];
          drgItem["wideSquare"] = currDrg["topSquare"];
          drgItem["orderFirst"] = currDrg["orderFirst"];
          drgItem["requiresPermission"] = currDrg["requiresPermission"];
          drgItem["isPrivate"] = currDrg["isPrivate"];

          if (!this.utils.isNullOrEmpty(drgItem["linkId"])) {
            items.push(drgItem);
          }
        }
      }
    }
    if (!this.utils.isEmptyObject(streamImageToUpdate)) {
      var streamUpdate = {};
      streamUpdate["linkId"] = "streamToUpdate";
      streamUpdate["streamImageUpdate"] = streamImageToUpdate;
      items.push(streamUpdate);
    }

    obj["items"] = items;
    obj["chatTiles"] = chatTiles;

    return obj;
  };

  getPageData(isSave: boolean) {
    var pgobj = {}
    var pageExists = this.page.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.page["obj"]) ? this.page["obj"] : {};

    if (!this.utils.isEmptyObject(pageExists)) {
      pgobj["_id"] = pageExists["_id"];
    }

    pgobj["dateCreated"] = pageExists.hasOwnProperty("dateCreated") && !this.utils.isNullOrEmpty(pageExists["dateCreated"]) ? pageExists["dateCreated"] : (new Date()).toUTCString();
    pgobj["position"] = pageExists.hasOwnProperty("position") && !this.utils.isNullOrEmpty(pageExists["position"]) ? pageExists["position"] : this.getPagePostion();

    if (pageExists.hasOwnProperty("notification")) {
      pgobj["notification"] = pageExists["notification"];
    }

    if (pageExists.hasOwnProperty("smart")) {
      pgobj["smart"] = pageExists["smart"];
    }

    pgobj["title"] = this.pageTitle;
    pgobj["dateUpdated"] = (new Date()).toUTCString();

    var currAppId = !this.utils.isNullOrEmpty(this.selectedApp) ? this.selectedApp : "-1";
    var appIdx = this.appList.map(app => { return app['_id']; }).indexOf(currAppId);
    var appObj = appIdx !== -1 ? this.appList[appIdx] : {};

    pgobj["appId"] = currAppId;
    pgobj["appName"] = appObj.hasOwnProperty("name") ? appObj["name"] : "";
    pgobj["orgId"] = this.oid;
    pgobj["locationId"] = !this.utils.isNullOrEmpty(this.selectedLocation) ? this.selectedLocation : "-1";
    pgobj["isCategory"] = false;
    pgobj["isHome"] = false;

    var menuTiles = this.getDraggedMenuTiles(isSave);
    pgobj["menuTiles"] = menuTiles["items"];

    pgobj["pageInDetail"] = this.pageInDetail;
    pgobj["noTabShow"] = this.noTabShow;
    pgobj["hidden"] = this.hidden;
    pgobj["randomOrder"] = this.randomOrder;
    pgobj["alphabeticalOrder"] = this.alphabeticalOrder;
    pgobj["livestreamOnTop"] = this.livestreamOnTop;

    return pgobj;
  };

  savePage(e: any, showMessage?: boolean, isAnother?: string, menuCurrObj?: Object) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    var menuObj = this.getPageData(true);
    this.loaderShared.showSpinner(true);

    if (!menuObj.hasOwnProperty("_id")) {
      var isBlankObj = this.pageList[0];

      if (!this.utils.isEmptyObject(isBlankObj) && isBlankObj.hasOwnProperty("_id")) {
        this.utils.iAlert('error', 'Information', 'Please select new to create new page');
        this.loaderShared.showSpinner(false);
        return false;
      }
    }

    if (this.utils.isNullOrEmpty(menuObj["title"])) {
      this.utils.iAlert('error', 'Information', 'You must at least enter a Page title');
      this.loaderShared.showSpinner(false);
      return false;
    }

    for (let i = 0; i < menuObj["menuTiles"].length; i++) {
      if (menuObj["menuTiles"][i].hasOwnProperty("name") && this.utils.isNullOrEmpty(this.utils.trim(menuObj["menuTiles"][i]["name"]))) {
        if (menuObj["menuTiles"][i]["linkId"].toLowerCase() !== "streamtoupdate") {
          this.loaderShared.showSpinner(false);
          this.utils.iAlert('error', 'Information', 'Title can not be empty');

          return false;
        }
      }
    }

    this.updateOrganizationIdsTile();

    var streamImageToUpdateObj = {};
    var streamUpdateIndex = -1;

    streamUpdateIndex = menuObj["menuTiles"].map(s => { return s['linkId']; }).indexOf('streamToUpdate');

    if (streamUpdateIndex != -1) {
      streamImageToUpdateObj = menuObj["menuTiles"][streamUpdateIndex];
      menuObj["menuTiles"].splice(streamUpdateIndex, 1);
    }

    if (menuObj.hasOwnProperty("_id") && this.selectedLanguage !== "en") {
      menuObj[this.selectedLanguage] = {};
      menuObj[this.selectedLanguage]["title"] = this.pageTitle;
      menuObj[this.selectedLanguage]["menuTiles"] = menuObj["menuTiles"];

      streamUpdateIndex = menuObj[this.selectedLanguage]["menuTiles"].map(s => { return s['linkId']; }).indexOf('streamToUpdate');

      if (streamUpdateIndex != -1) {
        streamImageToUpdateObj = menuObj[this.selectedLanguage]["menuTiles"][streamUpdateIndex];
        menuObj[this.selectedLanguage]["menuTiles"].splice(streamUpdateIndex, 1);
      }
      delete menuObj["title"];
      delete menuObj["menuTiles"];
    }

    this.save(menuObj, streamImageToUpdateObj, showMessage, isAnother, menuCurrObj);
  };

  save(menuObj: Object, streamObj: Object, showMessage?: boolean, isAnother?: string, menuCurrObj?: Object) {
    var type = menuObj.hasOwnProperty("_id") ? "update" : "save";
    var menuId = type === "update" ? menuObj["_id"] : "-1";

    this.pageService.pageSaveUpdate(menuObj, type, menuId)
      .then(menuResObj => {
        if (showMessage) {
          var alertMessage = type === "save" ? "Page Created" : "Page Updated";

          if (this.utils.isNullOrEmpty(isAnother)) {
            this.loaderShared.showSpinner(false);
          }

          this.utils.iAlert('success', '', alertMessage + ' Successfully');
        }

        var menuId = menuResObj.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(menuResObj["_id"]) ? menuResObj["_id"] : "-1";

        if (type === "save") {
          if (menuId !== "-1") {
            this.selectedPage = menuId;
          }

          this.resetBlankMenu();
        }

        if (menuId !== "1") {
          this.checksaveUpdate(menuId, type, isAnother);
        }

        this.updatePagesPostion(menuId);

        if (!this.utils.isEmptyObject(streamObj)) {
          this.updatePageLiveStreamImage(streamObj["streamImageUpdate"]);
          this.updateLiveStreamImage(streamObj["streamImageUpdate"]);
        }

        if (!this.utils.isNullOrEmpty(isAnother)) {
          if (isAnother === "new") {
            this.setBlankMenu(true);
          } else if (isAnother === "select") {
            this.setPageData(true, menuCurrObj, true);
          }
        }
      });
  };

  updatePagesPostion(menuId: string) {
    var pagesExists = this.pageList.length > 0 ? this.pageList.map(p => Object.assign({}, p)) : [];
    var drgMenus = Object.assign({}, this.draggedGroups["menu"]);

    for (let menuId in drgMenus) {
      pagesExists.push(drgMenus[menuId]);
    }

    if (pagesExists.length > 0) {
      for (let i = 0; i < pagesExists.length; i++) {
        var currPage = pagesExists[i];

        if (currPage["_id"] !== menuId) {
          var position = {
            "pageId": currPage["_id"],
            "position": currPage["position"]
          };

          this.pageService.pageUpdate("", position);
        }
      }
    };
  };

  updatePageLiveStreamImage(streamObj: Object) {
    for (let streamId in streamObj) {
      var liveStreamObj = {
        "streamId": streamId,
        "url": streamObj[streamId]
      };

      this.pageService.updatePageLiveStreamImage(liveStreamObj);
    }
  };

  updateLiveStreamImage(streamObj: Object) {
    for (let ky in streamObj) {
      var liveStreamObj = {
        "art": streamObj[ky]
      };

      this.pageService.updateLiveStreamImage(liveStreamObj);
    }
  };

  checksaveUpdate(menuId: string, type: string, isAnother?: string) {
    var formData = { "_id": menuId };

    this.pageService.getPages(this.oid, this.selectedApp, this.selectedLocation, formData)
      .then(pgs => {
        if (this.utils.isArray(pgs) && pgs.length > 0) {
          var isUpdatePg = false;

          if (this.utils.isNullOrEmpty(isAnother) && type === "update") {
            isUpdatePg = this.checkDraggedMenus(menuId);
          };

          if (isUpdatePg) {
            this.draggedGroups[menuId] = pgs[0];
          } else {
            if (type === "update") {
              var pgIndex = this.pageList.map(pg => { return pg['_id']; }).indexOf(menuId);

              if (pgIndex !== -1) {
                this.showAppNamesAssigned(pgs[0], 'page');
                this.pageList[pgIndex] = pgs[0];
              }
            } else {
              this.showAppNamesAssigned(pgs[0], 'page');
              this.pageList.push(pgs[0])
            }
          }

          if (this.utils.isNullOrEmpty(isAnother) || (!this.utils.isNullOrEmpty(isAnother) && isAnother === "lang")) {
            this.page["obj"] = pgs[0];

            if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "lang") {
              this.setPageData(true, this.page["obj"]);
            }
          }
        }
      });
  };

  checkDraggedMenus(menuId: string) {
    var result = false;

    if (this.page.hasOwnProperty("dragged") && this.page["dragged"].length > 0) {
      for (let i = 0; i < this.page["dragged"].length; i++) {
        var currDragged = this.page["dragged"][i];

        if (currDragged["type"] === "menu" && currDragged.hasOwnProperty("obj") && !this.utils.isEmptyObject(currDragged["obj"])) {
          if (currDragged["obj"] === menuId) {
            result = true;
            break;
          }
        }
      }
    }

    return result;
  };

  updateOrganizationIdsTile() {
    this.tilesToUpdate = [];
    var pushedTiles = [];
    var draggedItems = this.page.hasOwnProperty("dragged") && this.page["dragged"].length > 0 ? this.page["dragged"] : [];

    for (let i = 0; i < draggedItems.length; i++) {
      var dragItemObj = draggedItems[i];

      if (!dragItemObj.hasOwnProperty["pageDragContainer"]) {
        if (dragItemObj["type"] === "tile" && pushedTiles.indexOf(dragItemObj["obj"]["_id"]) === -1) {
          pushedTiles.push(dragItemObj["obj"]["_id"]);
          this.tilesToUpdate.push(dragItemObj["obj"]);
        }
      }
    }
  };

  getPageValues(isSave: boolean) {
    var pageExists = this.page.hasOwnProperty("obj") ? Object.assign({}, this.page["obj"]) : {};
    var menuPage = {};

    if (pageExists.hasOwnProperty("_id")) {
      menuPage["_id"] = pageExists["_id"];
    }

    var currAppId = !this.utils.isNullOrEmpty(this.selectedApp) ? this.selectedApp : "-1";
    var appIdx = this.appList.map(app => { return app['_id']; }).indexOf(currAppId);
    var appObj = appIdx !== -1 ? this.appList[appIdx] : {};

    menuPage["title"] = this.pageTitle;
    menuPage["appId"] = this.selectedApp;
    menuPage["appName"] = appObj["name"];
    menuPage["orgId"] = this.oid;
    menuPage["locationId"] = this.selectedLocation;
    menuPage["isCategory"] = false;
    menuPage["position"] = pageExists.hasOwnProperty("position") ? pageExists["position"] : "-1";

    var menuTiles = this.getDraggedMenuTiles(isSave);

    //menuPage.menuTiles = menuTiles.Tiles;

    if (pageExists.hasOwnProperty("_id") && this.selectedLanguage !== "en") {
      menuPage[this.selectedLanguage] = pageExists.hasOwnProperty(this.selectedLanguage) ? pageExists[this.selectedLanguage] : {};
      menuPage[this.selectedLanguage]["title"] = this.pageTitle;
      menuPage[this.selectedLanguage]["menuTiles"] = menuTiles["items"];
      delete menuPage["title"];
    }

    menuPage["pageInDetail"] = this.pageInDetail;
    menuPage["noTabShow"] = this.noTabShow;
    menuPage["hidden"] = this.hidden;
    menuPage["randomOrder"] = this.randomOrder;
    menuPage["alphabeticalOrder"] = this.alphabeticalOrder;
    menuPage["livestreamOnTop"] = this.livestreamOnTop;

    if (this.selectedLanguage === "en") {
      menuPage["menuTiles"] = menuTiles["items"];

      if (this.utils.isNullOrEmpty(this.utils.trim(menuPage["title"])) && menuPage["menuTiles"].length === 0) {
        return {};
      }
    }

    return menuPage;
  };

  processDraggedValues(obj: Object) {
    if (obj.hasOwnProperty("menuTiles") && obj["menuTiles"].length > 0) {
      for (let i = 0; i < obj["menuTiles"].length; i++) {
        var currMenuTile = obj["menuTiles"][i];


        if (!currMenuTile.hasOwnProperty("requiresPermission")) {
          currMenuTile["requiresPermission"] = false;
        }

        if (!currMenuTile.hasOwnProperty("isPrivate")) {
          currMenuTile["isPrivate"] = false;
        }
      }
    }

    return obj;
  };

  tabIconObjectCheck(obj1: Object, obj2: Object) {
    if (obj2 && !obj2.hasOwnProperty("tabIcon")) {
      delete obj1["tabIcon"];
    }

    if (obj2 && !obj2.hasOwnProperty("tabIconIsMask")) {
      delete obj1["tabIconIsMask"];
    }

    if (obj2 && !obj2.hasOwnProperty("tabTitleHidden")) {
      delete obj1["tabTitleHidden"];
    }

    if (obj2 && !obj2.hasOwnProperty("tabIconWidth")) {
      delete obj1["tabIconWidth"];
    }

    if (obj2 && !obj2.hasOwnProperty("tabIconHeight")) {
      delete obj1["tabIconHeight"];
    }

    if (obj1 && !obj1.hasOwnProperty("tabIcon")) {
      delete obj2["tabIcon"];
    }

    if (obj1 && !obj1.hasOwnProperty("tabIconIsMask")) {
      delete obj2["tabIconIsMask"];
    }

    if (obj1 && !obj1.hasOwnProperty("tabTitleHidden")) {
      delete obj2["tabTitleHidden"];
    }

    if (obj1 && !obj1.hasOwnProperty("tabIconWidth")) {
      delete obj2["tabIconWidth"];
    }

    if (obj1 && !obj1.hasOwnProperty("tabIconHeight")) {
      delete obj2["tabIconHeight"];
    }
  };

  newPage(e: any) {
    this.checkPageMenu('Would you like to save your previous work?', 'Save', 'Discard', false, (r) => {
      if (r) {
        this.savePage("", false, "new");
      } else {
        this.setBlankMenu();
      }
    });
  };

  setBlankMenu(isSpinner?: boolean) {
    this.pageReset("reset");

    var blankPageObj = {
      "pageTitle": "New Page",
      "position": 0
    };

    for (let i = 0; i < this.pageList.length; i++) {
      var pagePosition = parseInt(this.pageList[i]["position"]);
      this.pageList[i]["position"] = pagePosition + 1;
    }

    this.pageList.push(blankPageObj);

    if (isSpinner) {
      this.loaderShared.showSpinner(true);
    }
  };

  resetBlankMenu() {
    var pgObj = this.pageList.length > 0 ? this.pageList[0] : {};

    if (!pgObj.hasOwnProperty("_id")) {
      this.pageList.splice(0, 1);

      for (let i = 0; i < this.pageList.length; i++) {
        var pagePosition = parseInt(this.pageList[i]["position"]);
        this.pageList[i]["position"] = pagePosition - 1;
      }
    }
  };

  checkPageMenu(message: string, yesButton: string, noButton: string, isSave?: boolean, cb?: any) {
    var pageExists = this.page.hasOwnProperty("obj") ? Object.assign({}, this.page["obj"]) : {};

    var selectedLanguage = this.selectedLanguage;
    var obj1 = this.getPageValues(isSave);
    var obj2 = {};

    if (!this.utils.isEmptyObject(pageExists)) {
      obj2 = pageExists;
      obj2 = this.processDraggedValues(obj2);
      delete obj2["dateCreated"];
      delete obj2["createdBy"];
      delete obj2["updatedBy"];
      delete obj2["dateUpdated"];
      delete obj2["background_landscape"];
      delete obj2["background_portrait"];
      delete obj2["top_banner"];
      delete obj2["notification"];
      delete obj2["smart"];
      delete obj2["Apps"];
      delete obj2["fontColor"];

      delete obj2["background"];
      delete obj2["pageBackgroundColor"];
      delete obj2["tabTitleHidden"];

      delete obj2["isRoleBased"];
      delete obj2["isHome"];
      delete obj2["backgroundColor"];
      delete obj2["bannerFontColor"];
      delete obj2["bannerColor"];
      delete obj2["navbarFontSize"];
      delete obj2["top_banner"];
      delete obj2["topBannerUrl"];
      delete obj2["tabIcon"];
      delete obj2["tabIconIsMask"];
      delete obj2["tabTitleHidden"];
      delete obj2["tabIconWidth"];
      delete obj2["tabIconHeight"];

      delete obj2["pageLayout"];
      delete obj2["singleWidthSquareDetails"];
      delete obj2["doubleWidthSquareDetails"];
      delete obj2["webBackground"];

      delete obj2["follow"];
      delete obj2["linkToNotifications"];


      delete obj2["tileNotifications"];
      delete obj2["tileSmart"];
      delete obj2["tileApps"];
      delete obj2["tileProcedure"];
      delete obj2["isRole"];
      delete obj2["isSmart"];
      delete obj2["isNotification"];
      delete obj2[obj2["_id"]];
      delete obj2["pageTitle"];

      if (this.selectedLanguage !== "en") {
        delete obj2["title"];
        delete obj2["menuTiles"];
      }
    }

    delete obj1["notification"];
    delete obj1["smart"];
    delete obj1["Apps"];
    delete obj1["isRoleBased"]

    if (obj1.hasOwnProperty("position")) {
      obj1["position"] = parseInt(obj1["position"]);
    }

    if (obj2.hasOwnProperty("position")) {
      obj2["position"] = parseInt(obj2["position"]);
    }

    if (obj2 && !obj2.hasOwnProperty("background")) {
      delete obj1["background"];
    }

    for (let i = 0; i < this.languageList.length; i++) {
      var currLang = this.languageList[i];

      if (currLang["code"] !== this.selectedLanguage) {
        delete obj1[currLang["code"]];
        delete obj2[currLang["code"]];
      }
    }

    if (obj2 && !obj2.hasOwnProperty("webBackground")) {
      delete obj1["webBackground"];
    }

    if (obj2 && !obj2.hasOwnProperty("scrollIconsOver")) {
      delete obj1["scrollIconsOver"];
    } else if (obj1 && !obj1.hasOwnProperty("scrollIconsOver")) {
      delete obj2["scrollIconsOver"];
    }

    if (obj2 && !obj2.hasOwnProperty("scrollIconsUnder")) {
      delete obj1["scrollIconsUnder"];
    } else if (obj1 && !obj1.hasOwnProperty("scrollIconsUnder")) {
      delete obj2["scrollIconsUnder"];
    }

    if (obj1 && !obj1.hasOwnProperty("webBackground")) {
      delete obj2["webBackground"];
    }

    if (!this.utils.isEmptyObject(obj1) && !this.utils.isEmptyObject(obj2)) {
      var linkIds = [];

      if (obj2.hasOwnProperty("menuTiles")) {
        for (let i = 0; i < obj2["menuTiles"].length; i++) {
          var currMenuTile = obj2["menuTiles"][i];

          if (currMenuTile.hasOwnProperty("imageUrl") && this.utils.isNullOrEmpty(currMenuTile["imageUrl"])) {
            linkIds.push(currMenuTile["linkId"]);
          }
        }
      }

      if (linkIds.length > 0) {
        if (obj1.hasOwnProperty("menuTiles")) {
          for (let i = 0; i < obj1["menuTiles"].length; i++) {
            var currMenuTile = obj1["menuTiles"][i];

            if (linkIds.indexOf(currMenuTile["linkId"]) > -1 && !this.utils.isNullOrEmpty(currMenuTile["imageUrl"]) && currMenuTile["imageUrl"].indexOf("tile_default") > -1) {
              currMenuTile["imageUrl"] = "";
            }
          }
        }
      }
    }

    this.tabIconObjectCheck(obj1, obj2);
    var result = this.utils.compareObj(obj1, obj2);

    if (!result) {
      this.utils.iAlertConfirm("confirm", "Confirm", message, yesButton, noButton, (res) => {
        cb(res["resolved"]);
      });
    } else {
      cb(false, true);
    }
  };

  deletePage(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.loaderShared.showSpinner(true);

    if (this.page.hasOwnProperty("obj") && this.page["obj"].hasOwnProperty("_id")) {
      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Page?", "Delete", "Cancel", (r) => {
        if (r["resolved"]) {
          var menuId = this.page["obj"]["_id"];

          this.pageService.removeMenu(menuId).then(deleteRes => {
            if (!this.utils.isEmptyObject(deleteRes) && deleteRes.hasOwnProperty("deleted")) {
              var pgIdx = this.pageList.map(pg => { return pg['_id']; }).indexOf(menuId);
              this.pageList.splice(pgIdx, 1);

              if (this.draggedGroups["menu"].hasOwnProperty(menuId)) {
                delete this.draggedGroups["menu"][menuId];
              }

              this.pageReset("reset");
              this.utils.iAlert('success', '', 'Page Removed');
            }

            this.loaderShared.showSpinner(false);
          });
        } else {
          this.loaderShared.showSpinner(false);
        }
      });
    } else {
      this.loaderShared.showSpinner(false);
      this.utils.iAlert('error', 'Information', 'Page not selected');
    }
  };

  menuBackgroundLibrary(e: any, type: string) {
    e.preventDefault();
    this.menuBgObj = {};
    this.setupFrom = "";

    if (this.page.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.page["obj"]) && type === "menu") {
      this.menuBgObj = this.page["obj"];
    } else if (type === "default") {
      this.menuBgObj = this.defaultTheme;
    }

    if ((type === "menu" && !this.utils.isEmptyObject(this.menuBgObj)) || type === "default") {
      this.setupFrom = type;
      this.isMenuBg = true;
    } else if (type === "menu") {
      this.setupFrom = "default";
      this.utils.iAlert('error', 'Information', 'Please select a page');
    }
  };

  menuBackground(menuObj: Object) {
    if (!this.utils.isEmptyObject(menuObj) && menuObj.hasOwnProperty("close")) {
      this.isMenuBg = false;

      if (this.setupFrom === "menu") {
        this.showAppNamesAssigned(menuObj["pageData"], 'page');
        var pgIndex = this.pageList.map(pg => { return pg['_id']; }).indexOf(menuObj["pageData"]["_id"]);
        this.page["obj"] = menuObj["pageData"];
        this.pageList[pgIndex] = menuObj["pageData"];
      } else if (this.setupFrom === "default") {
        this.defaultTheme = menuObj["pageData"];
      }
    }
  };

  onImageLibraryClose(imglib: object) {
    this.isImageLibrary = 'none';
    var currDrg = this.page["dragged"][imglib["data"]["index"]];
    currDrg["art"] = imglib["url"];
  };

  onImageLibraryResult(imglib: object) {
    this.isImageLibrary = 'none';
    var currDrg = this.page["dragged"][imglib["data"]["index"]];
    currDrg["art"] = imglib["url"];
  };

  imageArt(e: any, idx: number) {
    e.preventDefault();

    var totalIdx = this.page["dragged"].length - 1;
    var currIdx = totalIdx - idx;

    this.isImageLibrary = 'block';
    this.imglibData = { index: currIdx };
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
        this.pageDataReset();
        this.setScrollList();
        this.setOrganizations();
        this.oid = Cookie.get('oid');
        this.assignGroups();
        this.getLanguages();
        this.getApps();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
