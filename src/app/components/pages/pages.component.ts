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
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';


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
    this.selectedLanguage = "en";
    this.selectedPage = "";
    this.pageSearchText = "";

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }
  };

  getTileContent(tileObj: any) {
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

  showAppNamesAssigned(squareObj: Object, type?: string) {
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
      this.getPageTitle(squareObj);
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
  };

  appChange(appId: string) {
    this.selectedApp = appId;
    this.getLocations(appId);
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

  getLocations(appId: string) {
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

        this.getPages();
      });
  };

  assignGroups() {
    this.getListGroups().subscribe(grps => {
      this.groups = [];

      for (let i = 0; i < grps.length; i++) {
        this.groups = this.groups.concat(grps[i]);
      }

      if (this.groups.length > 0) {
        for (let i = 0; i < this.groups.length; i++) {
          this.showAppNamesAssigned(this.groups[i], 'groups');
        }
      }
    });
  };

  getPages(pageId?: string) {
    if (!this.utils.isNullOrEmpty(this.selectedApp) && !this.utils.isNullOrEmpty(this.selectedLocation)) {
      this.pageService.getPages(this.oid, this.selectedApp, this.selectedLocation)
        .then(pgs => {
          if (this.utils.isArray(pgs) && pgs.length > 0) {
            this.pageList = pgs;
            this.selectedPage = this.pageList[0]["_id"];
            this.pageAssignedValues();
          } else {
            this.pageList = [];
          }
        });
    } else if (this.utils.isNullOrEmpty(pageId)) {
      this.pageList = [];
    }
  };

  pageAssignedValues() {
    for (let i = 0; i < this.pageList.length; i++) {
      this.showAppNamesAssigned(this.pageList[i], 'page')
    }
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  moveUpDown(pg: Object, move: string, idx: number) {
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

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.pageDataReset();
      this.setScrollList();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
      this.assignGroups();
      this.getLanguages();
      this.getApps();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
