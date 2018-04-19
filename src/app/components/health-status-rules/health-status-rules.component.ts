import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { HealthStatusRulesService } from '../../services/health-status-rules.service';
import { TileService } from '../../services/tile.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'app-health-status-rules',
  templateUrl: './health-status-rules.component.html',
  styleUrls: ['./health-status-rules.component.css'],
  providers: [PageService, HealthStatusRulesService],
  encapsulation: ViewEncapsulation.None
})
export class HealthStatusRulesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    private pageService: PageService,
    private healthStatusRulesService: HealthStatusRulesService,
    private tileService: TileService
  ) { }

  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  appList: any[] = [];
  selectedApp: string = "-1";
  hsrList: any[] = [];
  selectedHsr: string = "";
  tileCategories: any[] = [];
  selectedCategory: string = "-1";
  tileList: any[] = [];
  selectedTiles: string[] = [];
  tileSquares: any[] = [];
  profileData: any[] = [];
  yearList: any[] = [];
  monthDays: any[] = [];
  monthNames: any[] = [];
  ruleTextSearch: string = "";
  profileObj: Object = {
    "firstname": "",
    "lastname": "",
    "gender": "",
    "birthmonth": "",
    "birthday": "",
    "birthyearoption": "",
    "birthyear": "",
    "birthyearuntil": ""
  };
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

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#hsr_group_main", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#main-tile_squares", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#hsr_group_main");
      this.cms["appDatas"]["scrollList"].push("#tiles-list-show");
      this.cms["appDatas"]["scrollList"].push("#main-tile_squares");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#hsr_group_main", "#tiles-list-show", "#main-tile_squares"];
    }
  };

  statusDataReset() {
    this.statusReset();
    this.resetAppData();
    this.oid = "";
    this.statusReset();
    this.appList = [];
    this.selectedApp = "-1";
    this.hsrList = [];
    this.tileCategories = [];
    this.selectedCategory = "-1";
    this.tileSquares = [];
    this.profileData = [];
    this.tileList = [];
    this.selectedTiles = [];
    this.ruleTextSearch = "";

    this.yearList = [];
    this.monthDays = [];
    this.monthNames = [];

    this.setListYear();
    this.setMonthDays();
    this.setMonths();
  };

  statusReset() {
    this.selectedHsr = "";
    this.resetProfile();
  };

  resetProfile() {
    this.profileObj = {
      "firstname": "",
      "lastname": "",
      "gender": "",
      "birthmonth": "",
      "birthday": "",
      "birthyearoption": "",
      "birthyear": "",
      "birthyearuntil": ""
    };
  };

  resetAppData() {
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

  setApps(apps: any[]) {
    if (this.appList.length === 0) {
      if (this.utils.isArray(apps) && apps.length > 0) {
        this.appList = apps;
        //this.selectedApp = this.appList[0]["_id"];
      }
    }
  };

  appChange(appId: string) {
    this.selectedApp = appId;
  };

  setRules(ruleList: any[]) {
    if (this.utils.isArray(ruleList) && ruleList.length > 0) {
      this.hsrList = ruleList;
    }
  };

  setTileCategories(tileCats: any[]) {
    if (this.utils.isArray(tileCats) && tileCats.length > 0) {
      this.tileCategories = tileCats;
    }
  };

  setTileSquares(tileSqrsObj: Object) {
    if (!this.utils.isEmptyObject(tileSqrsObj)) {
      for (let i = 0; i < tileSqrsObj["tiles"]["data"].length; i++) {
        let tile = this.tileNotifyIcons(tileSqrsObj["tiles"]["data"][i], tileSqrsObj["apptiles"]);

        this.tileList.push(tile);
      }
    }

    this.setSquareTiles(tileSqrsObj);
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  getRuleStatus(ruleObj: Object) {
    let isDeath = ruleObj.hasOwnProperty("ruleStatusColor") && !this.utils.isNullOrEmpty(ruleObj["ruleStatusColor"]) && ruleObj["ruleStatusColor"] == "purple" ? true : false;

    return isDeath;
  };

  getStatusColor(ruleObj: Object) {
    let isDeath = this.getRuleStatus(ruleObj)

    return isDeath ? "gray" : ruleObj["ruleStatusColor"];
  };

  getTileCategories() {
    let tileCategory = this.tileService.getTileCategory(this.oid);

    return tileCategory;
  };

  getTilesAndQuestionnaireSquares() {
    let tilesAndSquares = this.healthStatusRulesService.getTilesAndQuestionnaireSquares(this.oid);

    return tilesAndSquares;
  };

  getApps() {
    let apps = this.pageService.getApps(this.oid);

    return apps;
  };

  getRules() {
    let rules = this.healthStatusRulesService.hsrList(this.oid);

    return rules;
  };

  /*Tile Notify Icons */
  tileNotifyIcons(currTile: Object, appTiles: Object) {
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

    for (let appId in appTiles) {
      if (appTiles[appId].indexOf(currTile["_id"]) > -1) {
        currTile["appId"] = appId;
      }
    }

    if (!currTile.hasOwnProperty("appId")) {
      currTile["appId"] = "-1";
    }

    return currTile;
  };

  getHsrPageDatas() {
    let tileCats = this.getTileCategories();
    let tilesAndSquares = this.getTilesAndQuestionnaireSquares();
    let hsrRules = this.getRules();
    let apps = this.getApps();

    return Observable.forkJoin([tileCats, tilesAndSquares, hsrRules, apps]);
  };

  loadHsrPage() {
    this.getHsrPageDatas().subscribe(hsrPgDatas => {
      this.setTileCategories(hsrPgDatas[0]);
      this.setTileSquares(hsrPgDatas[1]);
      this.setRules(hsrPgDatas[2]);
      this.setApps(hsrPgDatas[3]);
      this.loaderShared.showSpinner(false);
    });
  };

  doSort(isVal: boolean) {
    this.tileSort["isAsc"] = isVal;
  };

  changeTileView(viewName: string) {
    this.tileSort["listType"] = viewName;
  };

  selectTiles(e: any, currTile: Object) {
    e.preventDefault();
    e.stopPropagation();

    let tileIndex = this.selectedTiles.indexOf(currTile["_id"]);

    if (tileIndex === -1) {
      this.selectedTiles.push(currTile["_id"]);
    } else {
      this.selectedTiles.splice(tileIndex, 1);
    }
  };

  checkSelectedExists(currTile: Object) {
    return this.selectedTiles.indexOf(currTile["_id"]) > -1 ? true : false;
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

  setSquareTiles(tileSqrsObj: Object) {
    if (!this.utils.isEmptyObject(tileSqrsObj)) {
      let blocks = tileSqrsObj["tiles"]["blocks"];

      for (let i = 0; i < tileSqrsObj["tiles"]["data"].length; i++) {
        let currTile = tileSqrsObj["tiles"]["data"][i];
        let squareObj: any = { "tileId": currTile["_id"], "title": currTile["title"], "options": [] };
        let appTiles = tileSqrsObj["apptiles"];

        if (currTile.hasOwnProperty("blocks")) {
          for (let j = 0; j < currTile["blocks"].length; j++) {
            let blkId = currTile["blocks"][j];

            let tileBlock = blocks.find(b => b['_id'] === blkId);

            if (!this.utils.isEmptyObject(tileBlock)) {
              squareObj["blockId"] = blkId;
              squareObj["type"] = tileBlock["type"];

              for (let appId in appTiles) {
                if (appTiles[appId].indexOf(currTile["_id"]) > -1) {
                  squareObj["appId"] = appId;
                }
              }

              if (!squareObj.hasOwnProperty("appId")) {
                squareObj["appId"] = "-1";
              }

              if (tileBlock["type"] === "painlevel") {
                squareObj = this.setPainLevel(tileBlock, squareObj);
              } else if (tileBlock["type"] === "questionnaire") {
                squareObj = this.setQuestionnaire(tileBlock, squareObj);
              } else if (tileBlock["type"] === "survey") {
                squareObj = this.setSurvey(tileBlock, squareObj);
              }
            }
          }
        }

        if (squareObj.hasOwnProperty("blockId")) {
          this.tileSquares.push(squareObj);
        }
      }
    }
  };

  setPainLevel(tileBlock: Object, squareObj: Object) {
    let currOpt = {
      "questionText": !this.utils.isNullOrEmpty(tileBlock["data"]["question"]) ? tileBlock["data"]["question"] : "",
      "datas": []
    }

    for (let k = 0; k < 11; k++) {
      let opt = {
        "value": k,
        "text": k,
        "assigned": false
      };

      currOpt["datas"].push(opt);
    }

    squareObj["options"].push(currOpt);

    return squareObj;
  };

  setQuestionnaire(tileBlock: Object, squareObj: Object) {
    let level1 = [];
    let level2 = [];
    let level3 = [];
    let quesOpts = tileBlock["data"]["options"];
    let questionText = !this.utils.isNullOrEmpty(tileBlock["data"]["questionText"]) ? tileBlock["data"]["questionText"] : "";
    let survey_1 = {
      questionText: questionText,
      options: [],
      index: 0
    };

    quesOpts.forEach((opt1: any, key1: number) => {
      survey_1.options.push(opt1["option"]);

      if (opt1.hasOwnProperty("subQuestions")) {
        opt1["subQuestions"].forEach((ques1: any, key2: number) => {
          if (ques1["type"] === "questions") {
            let survey_2 = {
              questionText: ques1["questionText"],
              options: [],
              index: key1 + "_" + key2
            };

            if (ques1.hasOwnProperty("options")) {
              ques1["options"].forEach((opt2: any, key3: number) => {
                survey_2.options.push(opt2["option"]);

                if (opt2.hasOwnProperty("subQuestions")) {
                  opt2["subQuestions"].forEach((ques2: any, key4: number) => {
                    if (ques2["type"] == "questions") {
                      var survey_3 = {
                        questionText: ques2["questionText"],
                        options: [],
                        index: key1 + "_" + key2 + "_" + key3
                      };

                      if (ques2.hasOwnProperty("options")) {
                        ques2["options"].forEach((opt3: any, key5: number) => {
                          survey_3.options.push(opt3["option"]);
                        });
                      }

                      level3.push(survey_3);
                    }
                  });
                }
              });
            }

            level2.push(survey_2);
          }
        });
      }
    });

    level1.push(survey_1);
    level1 = level1.concat(level2, level3);

    for (let k = 0; k < level1.length; k++) {
      let opt = level1[k];

      let currOpt = {
        "questionText": !this.utils.isNullOrEmpty(opt["questionText"]) ? opt["questionText"] : "",
        "datas": []
      }

      if (opt.hasOwnProperty("options")) {
        for (let l = 0; l < opt["options"].length; l++) {
          let option = {
            "text": opt["options"][l],
            "value": l,
            "assigned": false
          };

          currOpt["datas"].push(option);
        }
      }

      squareObj["options"].push(currOpt);
    }

    return squareObj;
  };

  setSurvey(tileBlock: Object, squareObj: Object) {
    let currOpt = {
      "questionText": !this.utils.isNullOrEmpty(tileBlock["data"]["questionText"]) ? tileBlock["data"]["questionText"] : "",
      "datas": []
    }

    if (this.utils.isArray(tileBlock["data"]["questions"])) {
      for (let k = 0; k < tileBlock["data"]["questions"].length; k++) {
        let opt = {
          "value": k,
          "text": tileBlock["data"]["questions"][k],
          "assigned": false
        };

        currOpt["datas"].push(opt);
      }
    }

    squareObj["options"].push(currOpt);

    return squareObj;
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.statusDataReset();
        this.setScrollList();
        this.oid = Cookie.get('oid');
        this.loadHsrPage();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
