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
  selectedHsr: Object = {};
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
  squareTileSearch: string = "";
  ruleName: string = "";
  ruleColor: string = "-1";
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

    this.squareTileSearch = "";

    this.yearList = [];
    this.monthDays = [];
    this.monthNames = [];

    this.setListYear();
    this.setMonthDays();
    this.setMonths();
  };

  statusReset() {
    this.selectedHsr = {};
    this.selectedTiles = [];
    this.ruleTextSearch = "";
    this.ruleName = "";
    this.ruleColor = "-1";
    this.resetProfile();
    this.resetSquares();
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

  getRules(ruleId?: string) {
    let rules = this.healthStatusRulesService.hsrList(this.oid, ruleId);

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

    currTile["appId"] = [];

    for (let appId in appTiles) {
      if (appTiles[appId].indexOf(currTile["_id"]) > -1) {
        if (currTile["appId"].indexOf(appId) === -1) {
          currTile["appId"].push(appId);
        }
      }
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
    let tileIds: string[] = [];
    let blockIds: string[] = [];

    if (!this.utils.isEmptyObject(tileSqrsObj)) {
      let blocks = tileSqrsObj["tiles"]["blocks"];

      for (let i = 0; i < tileSqrsObj["tiles"]["data"].length; i++) {
        let currTile = tileSqrsObj["tiles"]["data"][i];
        let squareObj: any = { "uniqueId": this.getUniqueId(), "tileId": currTile["_id"], "title": currTile["title"], "blocks": [] };
        let appTiles = tileSqrsObj["apptiles"];

        squareObj["appId"] = [];

        for (let appId in appTiles) {
          if (appTiles[appId].indexOf(currTile["_id"]) > -1) {
            if (squareObj["appId"].indexOf(appId) === "-1") {
              squareObj["appId"].push(appId);
            }
          }
        }

        if (currTile.hasOwnProperty("blocks")) {
          for (let j = 0; j < currTile["blocks"].length; j++) {
            let blkId = currTile["blocks"][j];

            let tileBlock = blocks.find(b => b['_id'] === blkId);

            if (!this.utils.isEmptyObject(tileBlock)) {
              let currBlock = { "blockId": blkId, "type": tileBlock["type"] }
              //squareObj["blockId"] = blkId;
              //squareObj["type"] = tileBlock["type"];


              if (tileBlock["type"] === "painlevel") {
                squareObj = this.setPainLevel(tileBlock, squareObj, currBlock, blockIds);
              } else if (tileBlock["type"] === "questionnaire") {
                squareObj = this.setQuestionnaire(tileBlock, squareObj, currBlock, blockIds);
              } else if (tileBlock["type"] === "survey") {
                squareObj = this.setSurvey(tileBlock, squareObj, currBlock, blockIds);
              }
            }
          }
        }

        if (squareObj["blocks"].length > 0) {
          this.tileSquares.push(squareObj);
        }
      }
    }
  };

  setPainLevel(tileBlock: Object, squareObj: Object, currBlk: Object, blockIds: string[]) {
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

    currBlk["options"] = [currOpt];

    if (blockIds.indexOf(currBlk["blockId"]) === -1) {
      blockIds.push(currBlk["blockId"]);
      squareObj["blocks"].push(currBlk);
    }

    return squareObj;
  };

  setQuestionnaire(tileBlock: Object, squareObj: Object, currBlk: Object, blockIds: string[]) {
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

    currBlk["options"] = [];

    for (let k = 0; k < level1.length; k++) {
      let opt = level1[k];

      let currOpt = {
        "questionText": !this.utils.isNullOrEmpty(opt["questionText"]) ? opt["questionText"] : "",
        "index": opt["index"],
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

      currBlk["options"].push(currOpt);

    }

    if (blockIds.indexOf(currBlk["blockId"]) === -1) {
      blockIds.push(currBlk["blockId"]);
      squareObj["blocks"].push(currBlk);
    }

    return squareObj;
  };

  setSurvey(tileBlock: Object, squareObj: Object, currBlk: Object, blockIds: string[]) {
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

    currBlk["options"] = [currOpt];

    if (blockIds.indexOf(currBlk["blockId"]) === -1) {
      blockIds.push(currBlk["blockId"]);
      squareObj["blocks"].push(currBlk);
    }

    return squareObj;
  };

  selectHsr(e: any, hsrObj: Object) {
    e.preventDefault();
    e.stopPropagation();

    if (this.utils.isEmptyObject(this.selectedHsr) || (!this.utils.isEmptyObject(this.selectedHsr) && this.selectedHsr["_id"] !== hsrObj["_id"])) {
      this.loaderShared.showSpinner(true);
      this.statusReset();
      this.selectedHsr = hsrObj;
      let profileData = hsrObj.hasOwnProperty("profiles") ? hsrObj["profiles"] : {};
      this.ruleName = hsrObj.hasOwnProperty("name") && !this.utils.isNullOrEmpty(hsrObj["name"]) ? hsrObj["name"] : "";
      this.ruleColor = hsrObj.hasOwnProperty("ruleStatusColor") && !this.utils.isNullOrEmpty(hsrObj["ruleStatusColor"]) ? hsrObj["ruleStatusColor"] : "-1";
      this.setProfileObj(profileData);

      let allsquares: any[] = [];

      if (hsrObj.hasOwnProperty("squares") && !this.utils.isEmptyObject(hsrObj["squares"])) {
        for (var key in hsrObj["squares"]) {
          allsquares = allsquares.concat(hsrObj["squares"][key]);
        }
      }

      if (allsquares.length > 0) {
        this.setSquares(allsquares);
      }

      this.loaderShared.showSpinner(false);
    }
  };

  setSquares(sqrs: any[]) {
    if (this.tileSquares.length > 0) {

      for (let i = 0; i < this.tileSquares.length; i++) {
        let tileSqr = this.tileSquares[i];
        let sqrObj = {};

        for (let j = 0; j < tileSqr["blocks"].length; j++) {
          let currBlock = tileSqr["blocks"][j];

          if (currBlock['type'] === "questionnaire" || currBlock['type'] === "survey" || currBlock['type'] === "painlevel") {

            for (let k = 0; k < currBlock["options"].length; k++) {
              let currOpt = currBlock["options"][k];
              let quesIdx = currOpt.hasOwnProperty("index") ? currOpt["index"] : "-1";
              quesIdx = quesIdx !== "-1" ? quesIdx.toString() : quesIdx;

              for (let l = 0; l < currOpt["datas"].length; l++) {
                let currData = currOpt["datas"][l];

                if (this.squareCheck(currBlock["blockId"], sqrs, currData["value"], quesIdx)) {
                  currData["assigned"] = true;
                }
              }
            }
          }
        }
      }
    }
  };

  squareCheck(blockId: string, squares: any[], answer: number, index?: string) {
    let result = false;
    let currAnswer = answer.toString();

    for (let m = 0; m < squares.length; m++) {
      let sqr = squares[m];

      if (sqr.hasOwnProperty("answer")) {
        if (this.utils.isArray(sqr["answer"])) {
          if (sqr["blockId"] == blockId && sqr["answer"].indexOf(currAnswer) > -1) {
            result = true;
          }
        } else if (index !== "-1" && sqr["blockId"] === blockId && !this.utils.isEmptyObject(sqr["answer"]) && this.utils.isArray(sqr["answer"][index]) && sqr["answer"][index].indexOf(currAnswer) > -1) {
          result = true;
        }
      }
    }

    return result;
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

  resetSquares() {
    if (this.tileSquares.length > 0) {
      for (let i = 0; i < this.tileSquares.length; i++) {
        let tileSqr = this.tileSquares[i];

        for (let j = 0; j < tileSqr["blocks"].length; j++) {
          let currBlock = tileSqr["blocks"][j];

          for (let k = 0; k < currBlock["options"].length; k++) {
            let currOpt = currBlock["options"][k];

            for (let l = 0; l < currOpt["datas"].length; l++) {
              let currData = currOpt["datas"][l];
              currData["assigned"] = false;
            }
          }
        }
      }
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

    return profile
  };

  getSquaresAndTiles() {
    var selectedSquareTiles = {};
    selectedSquareTiles["squareIds"] = [];
    selectedSquareTiles["squareTileIds"] = [];
    selectedSquareTiles["squaresByTiles"] = {};

    for (let i = 0; i < this.tileSquares.length; i++) {
      let tileSqr = this.tileSquares[i];
      let square: Object = {};
      let tileId = tileSqr["tileId"];

      for (let j = 0; j < tileSqr["blocks"].length; j++) {
        let currBlock = tileSqr["blocks"][j];
        square["blockId"] = currBlock["blockId"];
        let type = currBlock["type"];

        let quesAnswer: Object = {};
        let answer: any[] = [];

        for (let k = 0; k < currBlock["options"].length; k++) {
          let currOpt = currBlock["options"][k];
          let index = type === "questionnaire" ? currOpt["index"] : "-1";
          index = index.toString();

          for (let l = 0; l < currOpt["datas"].length; l++) {
            let currData = currOpt["datas"][l];

            if (currData["assigned"] && selectedSquareTiles["squareTileIds"].indexOf(tileId) === -1) {
              selectedSquareTiles["squareTileIds"].push(tileId);
              selectedSquareTiles["squareTileIds"][tileId] = [];
            }

            if (currData["assigned"]) {
              let answeredVal = currData["value"].toString();

              if (type == "questionnaire") {
                if (quesAnswer.hasOwnProperty(index)) {
                  quesAnswer[index].push(answeredVal);
                } else {
                  quesAnswer[index] = [answeredVal];
                }
              } else {
                answer.push(answeredVal);
              }
            }
          }
        }

        if (answer.length > 0 || !this.utils.isEmptyObject(quesAnswer)) {
          square["answer"] = type === "questionnaire" ? quesAnswer : answer;
          let answeredSqr: Object = Object.assign({}, square);

          selectedSquareTiles["squareIds"].push(answeredSqr);

          if (!this.utils.isNullOrEmpty(tileId)) {
            if (selectedSquareTiles["squaresByTiles"].hasOwnProperty(tileId)) {
              selectedSquareTiles["squaresByTiles"][tileId].push(answeredSqr);
            } else {
              selectedSquareTiles["squaresByTiles"][tileId] = [answeredSqr];
            }
          }
        }
      }
    }

    return selectedSquareTiles;
  };

  saveHsr(e: any) {
    e.preventDefault();
    e.stopPropagation();

    let hsrObj: Object = {};

    if (!this.utils.isEmptyObject(this.selectedHsr)) {
      hsrObj["_id"] = this.selectedHsr["_id"];
    }

    this.loaderShared.showSpinner(true);
    hsrObj["orgId"] = this.oid;
    hsrObj["name"] = this.ruleName;
    hsrObj["ruleStatusColor"] = this.ruleColor;
    hsrObj["profiles"] = this.getProfile();

    let selectedSquareTiles: Object = this.getSquaresAndTiles();
    hsrObj["squares"] = selectedSquareTiles["squaresByTiles"];
    hsrObj["tileId"] = selectedSquareTiles["squareTileIds"];
    //engine.squaresByTiles = selectedSquareTiles.squaresByTiles;
    //engine.createdBy = userId;
    hsrObj["dateCreated"] = (new Date()).toUTCString();
    hsrObj["dateUpdated"] = (new Date()).toUTCString();

    if (this.utils.isNullOrEmpty(hsrObj["name"])) {
      this.loaderShared.showSpinner(false);
      this.utils.iAlert('error', 'Information', 'You must enter the Rule name');
      return false;
    }

    if (hsrObj["ruleStatusColor"] === "-1") {
      this.loaderShared.showSpinner(false);
      this.utils.iAlert('error', 'Information', 'Please select Status Color');
      return false;
    }

    if (this.utils.isArray(hsrObj["tileId"]) && hsrObj["tileId"].length === 0) {
      this.loaderShared.showSpinner(false);
      this.utils.iAlert('error', 'Information', 'You must select a Square');
      return false;
    }

    this.healthStatusRulesService.saveHsr(hsrObj).then(hsrRes => {
      let id: string = hsrObj.hasOwnProperty("_id") ? hsrObj["_id"] : hsrRes["_id"];

      this.getRules(id).then(rulesRes => {
        if (this.utils.isArray(rulesRes) && rulesRes.length > 0) {
          if (hsrObj.hasOwnProperty("_id")) {
            var hsrIdx = this.hsrList.map(hsrl => { return hsrl['_id']; }).indexOf(id);
            this.hsrList[hsrIdx] = rulesRes[0];
          } else {
            this.hsrList.push(rulesRes[0]);
            this.selectedHsr = rulesRes[0];
          }
        }
      });

      this.loaderShared.showSpinner(false);
      this.utils.iAlert("success", "", "Rule updated successfully");
    });
  };

  deleteHsr(e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.utils.isEmptyObject(this.selectedHsr)) {
      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Rule??", "Delete", "Cancel", (r) => {
        if (r["resolved"]) {
          this.loaderShared.showSpinner(true);

          this.healthStatusRulesService.removeHsr(this.selectedHsr["_id"]).then(deleteStatus => {
            var hsrIdx = this.hsrList.map(hsrl => { return hsrl['_id']; }).indexOf(this.selectedHsr["_id"]);
            this.hsrList.splice(hsrIdx, 1);
            this.loaderShared.showSpinner(false);

            this.utils.iAlert('success', '', 'Rule deleted successfully');
          });
        }
      });
    } else {
      this.utils.iAlert('error', 'Information', 'Please select a Rule!!!');
    }
  };

  newHsr(e: any) {
    e.preventDefault();
    e.stopPropagation();

    this.statusReset();
  };

  /* Dragged tile by uniqueId */
  trackByTileId(index: number, obj: any) {
    return obj["tileId"];
  };

  trackByBlockId(index: number, obj: any) {
    return obj["blockId"];
  };

  /* Dragged tile by uniqueId */
  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };

  /* Getting unique Id */
  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#hsr_group_main", "#tiles-list-show", "#main-tile_squares"]);
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
    this.destroyScroll();
  };
}
