import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { TileService } from '../../services/tile.service';
import { SmartService } from '../../services/smart.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'app-smart',
  templateUrl: './smart.component.html',
  styleUrls: ['./smart.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [PageService, SmartService]
})
export class SmartComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    private pageService: PageService,
    private tileService: TileService,
    private smartService: SmartService
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
  selectedMenuGroup: Object = {};
  tileList: any[] = [];
  selectedTile: Object = {};
  tileCategories: any[] = [];
  selectedCategory: string = "-1";
  tileSquares: any[] = [];
  profileData: any[] = [];
  /*smartData: Object = {
    "squares": []
  };*/
  profileObj: Object = { "ifNotAnswered": false };
  yearList: any[] = [];
  monthDays: any[] = [];
  monthNames: any[] = [];
  squaresPanelHgt: number = 633;

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
    this.resetAppData();

    this.oid = "";
    this.appList = [];
    this.selectedApp = "";
    this.tileCategories = [];
    this.selectedCategory = "-1";

    this.yearList = [];
    this.monthDays = [];
    this.monthNames = [];

    this.setListYear();
    this.setMonthDays();
    this.setMonths();
  };

  smartReset() {
    this.selectedMenuGroup = {};
    this.selectedTile = {};

    this.profileReset();
    this.resetSmartSquaresDatas();
    //this.smartData["squares"] = [];
  };

  resetAppData() {
    this.menuGroups = [];
    this.smart = [];
    this.notifications = [];
    this.menuGroupSearch = "";
    this.tileList = [];

    this.tileSquares = [];
    this.profileData = [];
    this.profileObj = { "ifNotAnswered": false };
    this.squaresPanelHgt = 633;

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

  resetSmartSquaresDatas() {
    if (this.tileSquares.length > 0) {
      for (let i = 0; i < this.tileSquares.length; i++) {
        let tileSqr = this.tileSquares[i];
        tileSqr["ifNotAnswered"] = false;

        if (tileSqr["questions"].length > 0) {
          for (let j = 0; j < tileSqr["questions"].length; j++) {
            let ques = tileSqr["questions"][j];
            ques["assigned"] = false;
          }
        }
      }
    }
  };

  profileReset() {
    for (let ky in this.profileObj) {
      this.profileObj[ky] = "";
    }
  }

  appChange(appId: string) {
    this.loaderShared.showSpinner(true);
    this.selectedApp = appId;
    this.smartReset();
    this.resetAppData();

    this.loadSmartDatas(false).subscribe(tileCats => {
      this.setSmartData(tileCats, false);
    });
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#menu-group-list", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#main-squares-area", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#menu-group-list");
      this.cms["appDatas"]["scrollList"].push("#tiles-list-show");
      this.cms["appDatas"]["scrollList"].push("#main-squares-area");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#menu-group-list", "#tiles-list-show", "#main-squares-area"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#menu-group-list", "#tiles-list-show"]);
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {
          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];
            //this.menuGroupsList();
            //this.setTileCategories();
            //this.getTileSquares();
            //this.getAppProfileData();

            this.loadSmartDatas(true).subscribe(tileCats => {
              this.setSmartData(tileCats, true);
            });
          } else {
            this.loaderShared.showSpinner(false);
          }
        });
    }
  };

  setSmartData(smartDatas: any[], isInitial?: boolean) {
    this.setMenuGroupList(smartDatas[0]);
    this.setTileCategories(smartDatas[1], isInitial);
    this.setTileSquares(smartDatas[2]);
    this.setAppProfileData(smartDatas[3]);

    this.loaderShared.showSpinner(false);
  };

  setTileCategories(tileCats: any, isInitial?: boolean) {
    /*this.getTilesCategories().subscribe(tileCats => {
      this.tileCategories = tileCats[0];
      this.tileList = tileCats[1]["tiles"];
      this.assignTileNoitfyIcons();
    });*/

    if (isInitial) {
      this.tileCategories = tileCats[0];
      this.tileList = tileCats[1]["tiles"];
    } else {
      this.tileList = tileCats["tiles"];
    }

    this.assignTileNoitfyIcons();
  };

  loadSmartDatas(isInitial: boolean) {
    let tileCatData: any;
    let menuGroupList = this.getMenuGroupList();

    if (isInitial) {
      tileCatData = this.getTilesCategories();
    } else {
      tileCatData = this.getAppPageTiles();
    }

    let tileSquares = this.getTileSquareList();
    let profileData = this.pageService.appProfileData(this.selectedApp);

    return Observable.forkJoin([menuGroupList, tileCatData, tileSquares, profileData]);
  };

  assignTileNoitfyIcons() {
    for (let i = 0; i < this.tileList.length; i++) {
      this.tileList[i] = this.tileNotifyIcons(this.tileList[i]);
    }
  };

  getTilesCategories() {
    let tileCategory = this.tileService.getTileCategory(this.oid);
    let squareTiles = this.getAppPageTiles();

    return Observable.forkJoin([tileCategory, squareTiles]);
  };

  getAppPageTiles() {
    let pageTile = this.pageService.appPageTiles(this.oid, this.selectedApp);
    return pageTile;
  };

  getMenuGroupList() {
    let listMenuGroup = this.pageService.pageSquaresList(this.oid, this.selectedApp);

    return listMenuGroup
  };

  getTileSquareList() {
    let tileSqrs = this.pageService.tileSquares(this.oid, this.selectedApp);

    return tileSqrs;
  }

  setTileSquares(tileSqrs: any[]) {
    /* this.pageService.tileSquares(this.oid, this.selectedApp)
       .then(tileSqrs => {
         if (this.utils.isArray(tileSqrs) && tileSqrs.length > 0) {
           
         }
       });*/

    if (this.utils.isArray(tileSqrs) && tileSqrs.length > 0) {
      this.tileSquares = tileSqrs;
      this.setSmartSquares(tileSqrs);
    }
  };

  setAppProfileData(prfDtas: any[]) {
    /*this.pageService.appProfileData(this.selectedApp)
      .then(prfDtas => {

      });*/

    if (this.utils.isArray(prfDtas) && prfDtas.length > 0) {
      this.profileData = prfDtas;
      this.checkProfileData();
    }

    this.setSquaresPanelHeight();
  };

  setSquaresPanelHeight() {
    let profiles = Object.keys(this.profileObj);
    let profFields = ["firstName", "lastName", "gender", "birthday"];

    if (profiles.length > 0) {
      for (let i = 0; i < profFields.length; i++) {
        if (profiles.indexOf(profFields[i]) === -1) {
          this.squaresPanelHgt = profFields[i] === "birthday" ? this.squaresPanelHgt + 60 : this.squaresPanelHgt + 30;
        }
      }
    } else {
      this.squaresPanelHgt = this.squaresPanelHgt + 150;
    }
  };

  setSmartSquares(squares: any[]) {
    //this.smartData["squares"] = [];
    //let squares = this.tileSquares.map(s => Object.assign({}, s));
    this.tileSquares = [];

    for (let i = 0; i < squares.length; i++) {
      let sqr = squares[i];
      let sqrSmart = {
        "_id": sqr["_id"],
        "type": sqr["type"],
        "ifNotAnswered": false
      };

      if (sqr.hasOwnProperty("data")) {
        sqrSmart["questionText"] = sqr["data"].hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(sqr["data"]["questionText"]) ? sqr["data"]["questionText"] : "";

        if (sqr["data"].hasOwnProperty("questions") && this.utils.isArray(sqr["data"]["questions"]) && sqr["data"]["questions"].length > 0) {
          let questions = sqr["data"]["questions"];
          sqrSmart["questions"] = [];

          for (let j = 0; j < questions.length; j++) {
            let ques = {
              "text": questions[j],
              "assigned": false
            }

            sqrSmart["questions"].push(ques);
          }
        }
      }

      if (sqrSmart.hasOwnProperty("questions")) {
        this.tileSquares.push(sqrSmart);
      }
    }
  };

  setMenuGroupList(squares: Object) {
    /*this.pageService.pageSquaresList(this.oid, this.selectedApp)
      .then(squares => {
        
      });*/

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

  /* Dragged tile by uniqueId */
  trackByTileId(index: number, obj: any) {
    return obj["_id"];
  };

  checkProfileData() {
    if (this.utils.isArray(this.profileData) && this.profileData.length > 0) {
      for (let i = 0; i < this.profileData.length; i++) {
        let profData = this.profileData[i];

        if (!this.utils.isEmptyObject(profData) && profData.hasOwnProperty("name") && !this.utils.isNullOrEmpty(profData['name'])) {
          let name = profData['name'].toLowerCase();
          let type = profData['type'];

          if (this.utils.trim(name) === "firstname" && type === "text") {
            this.profileObj["firstName"] = "";
          }

          if (this.utils.trim(name) === "lastname" && type === "text") {
            this.profileObj["lastName"] = "";
          }

          if (this.utils.trim(name) === "gender" && type === "select") {
            this.profileObj["gender"] = "";
          }

          if (this.utils.trim(name) === "dob" && type === "date") {
            this.profileObj["birthmonth"] = "";
            this.profileObj["birthday"] = "";
            this.profileObj["birthyearoption"] = "";
            this.profileObj["birthyear"] = "";
            this.profileObj["birthyearuntil"] = "";
          }
        }
      }
    }
  };

  setListYear() {
    for (let i = new Date().getFullYear(); i > 1900; i--) {
      this.yearList.push(i);
    }
  };

  setMonthDays() {
    for (let i = 1; i <= 31; i++) {
      this.monthDays.push(i);
    }
  };

  setMonths() {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    for (let i = 0; i < months.length; i++) {
      this.monthNames.push(months[i]);
    }
  };

  getProfile() {
    var profile = {};

    profile["firstname"] = this.profileObj.hasOwnProperty("firstname") ? this.profileObj["firstname"] : "";
    profile["lastname"] = this.profileObj.hasOwnProperty("lastname") ? this.profileObj["lastname"] : "";
    profile["gender"] = this.profileObj.hasOwnProperty("gender") ? this.profileObj["gender"] : "";
    profile["birthmonth"] = this.profileObj.hasOwnProperty("birthmonth") ? this.profileObj["birthmonth"] : "";
    profile["birthday"] = this.profileObj.hasOwnProperty("birthday") ? this.profileObj["birthday"] : "";
    profile["birthyearoption"] = this.profileObj.hasOwnProperty("birthyearoption") ? this.profileObj["birthyearoption"] : "";
    profile["birthyear"] = this.profileObj.hasOwnProperty("birthyear") ? this.profileObj["birthyear"] : "";
    profile["birthyearuntil"] = this.profileObj.hasOwnProperty("birthyearuntil") ? this.profileObj["birthyearuntil"] : "";

    profile["ifNotAnswered"] = this.profileObj["ifNotAnswered"];

    return profile
  };

  getSquares() {
    var assignedSquares = [];

    for (let i = 0; i < this.tileSquares.length; i++) {
      let sqr = this.tileSquares[i];
      let answer = [];
      let square = { "blockId": sqr["_id"] };

      for (let j = 0; j < sqr["questions"].length; j++) {
        let ques = sqr["questions"][j];

        if (ques["assigned"]) {
          answer.push(j);
        }
      }

      if (answer.length > 0) {
        square["ifNotAnswered"] = sqr["ifNotAnswered"];
        square["answer"] = answer;
        assignedSquares.push(square);
      }
    }

    return assignedSquares;
  };

  saveSmart(e: any) {
    e.preventDefault();
    e.stopPropagation();

    let smrtObj = !this.utils.isEmptyObject(this.selectedMenuGroup) ? this.selectedMenuGroup : !this.utils.isEmptyObject(this.selectedTile) ? this.selectedTile : {};

    if (!this.utils.isEmptyObject(smrtObj)) {
      this.loaderShared.showSpinner(true);
      var obj = {};
      obj["appId"] = this.selectedApp;
      obj["orgId"] = this.oid;
      obj["profiles"] = this.getProfile();
      obj["squares"] = this.getSquares();
      obj["type"] = smrtObj["type"];
      obj["engineId"] = smrtObj["_id"];
      obj["dateCreated"] = (new Date()).toUTCString();
      obj["dateUpdated"] = (new Date()).toUTCString();

      this.smartService.saveSmart(obj)
        .then(menuResObj => {
          this.getMenuGroupList().then(mnuGrpObj => {
            this.setMenuGroupList(mnuGrpObj);

            this.getAppPageTiles().then(appPgTiles => {
              this.setTileCategories(appPgTiles, false);
            });

            this.loaderShared.showSpinner(false);
            this.utils.iAlert('success', '', 'Smart engine updated successfully');
          });
        });
    } else {
      this.utils.iAlert('error', 'Information', 'You must at least select a square for smart engine!!!');
    }
  };

  setProfileObj(profObj: Object) {
    if (!this.utils.isEmptyObject(profObj)) {
      for (let fieldName in profObj) {
        if (this.profileObj.hasOwnProperty(fieldName)) {
          this.profileObj[fieldName] = profObj[fieldName];
        }
      }
    }
  };

  setSquares(sqrs: any[]) {
    if (this.utils.isArray(sqrs) && sqrs.length > 0) {
      for (let i = 0; i < sqrs.length; i++) {
        let square = sqrs[i];

        if (square.hasOwnProperty("blockId") && !this.utils.isNullOrEmpty(square['blockId'])) {
          let squareExists = this.tileSquares.find(t => t['_id'] === square['blockId']);

          if (!this.utils.isEmptyObject(squareExists)) {
            if (square.hasOwnProperty("answer") && square["answer"].length > 0 && squareExists["questions"].length > 0) {
              let totalIndex = squareExists["questions"].length - 1;
              for (let j = 0; j < square["answer"].length; j++) {
                let answered = !this.utils.isNullOrEmpty(square["answer"][j]) ? parseInt(square["answer"][j]) : "";

                if (!this.utils.isNullOrEmpty(answered) && totalIndex >= answered) {
                  squareExists["questions"][answered]["assigned"] = true;
                }
              }
            }

            if (square.hasOwnProperty("ifNotAnswered")) {
              squareExists["ifNotAnswered"] = this.utils.convertToBoolean(squareExists["ifNotAnswered"]);
            }
          }
        }
      }
    }
  };

  selectMenuGroupTile(e: any, obj: Object) {
    e.preventDefault();
    e.stopPropagation();

    this.loaderShared.showSpinner(true);
    this.smartReset();

    if (!this.utils.isEmptyObject(obj)) {
      if (obj["type"] !== "tile") {
        this.selectedMenuGroup = obj;
      } else {
        this.selectedTile = obj;
      }

      this.getSmartEngine(obj);
    }
  };

  getSmartEngine(obj: Object) {
    let smrtObj = { "type": obj["type"], "engineId": obj["_id"] };

    this.smartService.smartList(this.oid, this.selectedApp, smrtObj)
      .then(smrtDatas => {
        if (smrtDatas.length > 0) {
          this.setProfileObj(smrtDatas[0].profiles);
          this.setSquares(smrtDatas[0].squares);
        }

        this.loaderShared.showSpinner(false);
      });
  };

  /*getGroupTilesSquares() {
      let menuGroupList = this.getMenuGroupList();
      //let squareData = this.getAppPageTiles();
      let tileSquares = this.getTileSquareList();
  
      return Observable.forkJoin([menuGroupList, tileSquares]);
    };*/

  deleteSmart(e: any) {
    e.preventDefault();
    e.stopPropagation();

    let smrtObj = !this.utils.isEmptyObject(this.selectedMenuGroup) ? this.selectedMenuGroup : !this.utils.isEmptyObject(this.selectedTile) ? this.selectedTile : {};

    if (!this.utils.isEmptyObject(smrtObj)) {
      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Smart Engine??", "Delete", "Cancel", (r) => {
        if (r["resolved"]) {
          this.loaderShared.showSpinner(true);

          var deleteObj = { "appId": this.selectedApp, "orgId": this.oid, "type": smrtObj["type"], "engineId": smrtObj["_id"] };

          this.smartService.removeSmart(deleteObj).then(deleteStatus => {
            this.getMenuGroupList().then(mnuGrpObj => {
              this.setMenuGroupList(mnuGrpObj);
              this.getAppPageTiles().then(appPgTiles => {
                this.setTileCategories(appPgTiles, false);
              });

              this.profileReset();
              this.resetSmartSquaresDatas();
              this.loaderShared.showSpinner(false);
              this.utils.iAlert('success', '', 'Smart engine deleted successfully');
            });
          });
        }
      });
    } else {
      this.utils.iAlert('error', 'Information', 'Please select a Square!!!');
    }
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
