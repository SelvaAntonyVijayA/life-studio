import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { TileService } from '../../services/tile.service';
import { PageService } from '../../services/page.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';

declare var $: any;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css'],
  providers: [PageService]
})
export class PagesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private tileService: TileService,
    private pageService: PageService,
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
  };

  /*Refresh current Page data */
  pageReset(mergeReset?: string) {
    this.isMerge = {};
    this.tilesToUpdate = [];
    this.draggedTiles = [];
    this.droppedTile = {};
    this.selectedLanguage = "en";

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }
  };

  getTileContent(tileObj: any) {
  };

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
  };

  showAppNamesAssigned(squareObj: Object) {
    var resultObj = {};
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

    resultObj["tileNotifications"] = tileNotifications;
    resultObj["tileSmart"] = tileSmart;
    resultObj["tileApps"] = pageApps;
    resultObj["tileProcedure"] = tileProcedure;
    resultObj["isRole"] = !this.utils.isEmptyObject(squareObj) && squareObj.hasOwnProperty("isRoleBased") && squareObj["isRoleBased"]? true : false;
    resultObj["isSmart"] = !this.utils.isNullOrEmpty(tileSmart)? true: false;
    resultObj["isNotification"] = !this.utils.isNullOrEmpty(tileNotifications)? true: false;

    return resultObj;
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
      });
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.pageDataReset();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
      this.getLanguages();
      this.getApps();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
