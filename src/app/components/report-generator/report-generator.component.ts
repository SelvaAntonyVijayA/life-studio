
import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';

import { TileService } from '../../services/tile.service';
import { ProcedureService } from '../../services/procedure.service';
import { ReportGeneratorService } from '../../services/report-generator.service';
import { PageService } from '../../services/page.service';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.css'],
  providers: [PageService, ReportGeneratorService],
  encapsulation: ViewEncapsulation.None
})
export class ReportGeneratorComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    private tileService: TileService,
    private procedureService: ProcedureService,
    private reportGeneratorService: ReportGeneratorService,
    private pageService: PageService
  ) { }

  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  tileCategories: any[] = [];
  selectedCategory: string = "-1";
  tileList: any[] = [];
  selectedTiles: string[] = [];
  tileSquares: any[] = [];
  proceduresList: any[] = [];
  selectedProcedure: string = "-1";
  reportRuleList: any[] = [];
  selectedRule: Object = {};
  ruleTextSearch: string = "";
  appList: any[] = [];
  selectedApp: string = "-1";
  selectedReport: string = "-1";
  tileSearchText: string = "";
  baseTiles: any[] = [];
  selectedBaseTile: string = "-1";
  squaresPanelHgt: number = 870;
  reportName: string = "";

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

  reportRuleDataReset() {
    this.reportRuleReset();
    this.oid = "";
    this.tileCategories = [];
    this.tileList = [];
    this.tileSquares = [];
    this.proceduresList = [];
    this.reportRuleList = [];
    this.appList = [];

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

    this.selectedCategory = "-1";
  };

  reportRuleReset(isReportChange?: boolean) {
    this.resetSquares();
    this.selectedTiles = [];
    this.selectedProcedure = "-1";
    this.selectedRule = {};
    this.ruleTextSearch = "";
    this.selectedApp = "-1";
    this.selectedReport = "-1";
    this.tileSearchText = "";
    this.baseTiles = [];
    this.selectedBaseTile = "-1";
    this.squaresPanelHgt = 870;
    this.reportName = isReportChange ? this.reportName : "";
  };

  setScrollList() {
    this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#rule_group_main", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#main-tile_squares", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#tiles-list-show", "#rule_group_main", "#main-tile_squares");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#tiles-list-show", "#rule_group_main", "#main-tile_squares"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#tiles-list-show", "#rule_group_main", "#main-tile_squares"]);
  };

  /* Getting unique Id */
  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };

  trackByTileId(index: number, obj: any): any {
    return obj["tileId"];
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  trackByBlockId(index: number, obj: any): any {
    return obj["blockId"];
  };

  loadReportRule() {
    this.getReportRuleDatas().subscribe(reportRuleDatas => {
      this.setTileCategories(reportRuleDatas[0]);
      this.setTileSquares(reportRuleDatas[1]);
      this.setWeightList(reportRuleDatas[2]);
      this.setProcedures(reportRuleDatas[3]);
      this.setApps(reportRuleDatas[4]);
      this.loaderShared.showSpinner(false);
    });
  };

  setApps(apps: any[]) {
    if (this.utils.isArray(apps) && apps.length > 0) {
      this.appList = apps;
    }
  };

  setTileCategories(tileCats: any[]) {
    if (this.utils.isArray(tileCats) && tileCats.length > 0) {
      this.tileCategories = tileCats;
    }
  };

  setWeightList(ruleList: any[]) {
    this.reportRuleList = ruleList;
  };

  setProcedures(procList: any[]) {
    this.proceduresList = procList;
  };

  setTileSquares(tileSqrsObj: Object) {
    let tileIds: string[] = this.setSquares(tileSqrsObj["tiles"]);

    if (!this.utils.isEmptyObject(tileSqrsObj)) {
      for (let i = 0; i < tileSqrsObj["tiles"].length; i++) {

        if (tileIds.indexOf(tileSqrsObj["tiles"][i]["_id"]) > -1) {
          let tile = this.tileNotifyIcons(tileSqrsObj["tiles"][i], tileSqrsObj["apptiles"]);

          this.tileList.push(tile);
        }
      }
    }
  };

  setSquares(tiles: any[]) {
    let tileIds: string[] = [];

    if (this.utils.isArray(tiles) && tiles.length > 0) {
      let blockIds: string[] = [];

      for (let i = 0; i < tiles.length; i++) {
        let currTile: Object = tiles[i];
        let squareObj: Object = {
          "uniqueId": this.getUniqueId(),
          "tileId": currTile["_id"],
          "title": currTile["title"],
          "xAxisLabel": currTile["title"],
          "blocks": [],
          "assigned": ""
        };
        
        let blocksData: any[] = currTile.hasOwnProperty("blocksData") && currTile["blocksData"].length > 0 ? currTile["blocksData"] : [];

        if (blocksData.length > 0) {
          let blks: any[] = blocksData.filter(blk => {
            return blk["type"] === 'survey' || blk["type"] === 'painlevel' || blk["type"] === 'questionnaire';
          });

          for (let j = 0; j < blks.length; j++) {
            let blkData = blks[j];

            let currBlock = {
              "blockId": blkData["_id"],
              "type": blkData["type"]
            };

            if (currBlock["type"] === "painlevel") {
              squareObj = this.setPainLevel(blkData, squareObj, currBlock, blockIds);
            } else if (currBlock["type"] === "questionnaire") {
              squareObj = this.setQuestionnaire(blkData, squareObj, currBlock, blockIds);
            } else {
              squareObj = this.setSurvey(blkData, squareObj, currBlock, blockIds);
            }
          }
        }

        if (squareObj["blocks"].length > 0) {
          let opt = squareObj["blocks"][0]["options"][0];
          squareObj["assigned"] = opt["blkValue"];
          tileIds.push(squareObj["tileId"]);
          this.tileSquares.push(squareObj);
        }
      }
    }

    return tileIds;
  };

  setPainLevel(tileBlock: Object, squareObj: Object, currBlk: Object, blockIds: string[]) {
    let currOpt = {
      "questionText": !this.utils.isNullOrEmpty(tileBlock["data"]["question"]) ? tileBlock["data"]["question"] : "",
      "index": "-1",
      "blkValue": currBlk["blockId"],
      "isDisabled": true,
      "datas": []
    }

    for (let k = 0; k < 11; k++) {
      let opt = {
        "index": k,
        "value": "",
        "text": k
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
        "blkValue": opt["index"] + "-" + currBlk["blockId"],
        "isDisabled": true,
        "datas": []
      }

      if (opt.hasOwnProperty("options")) {
        for (let l = 0; l < opt["options"].length; l++) {
          let option = {
            "index": l,
            "text": opt["options"][l],
            "value": ""
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
      "index": "-1",
      "blkValue": currBlk["blockId"],
      "isDisabled": true,
      "datas": []
    }

    if (this.utils.isArray(tileBlock["data"]["questions"])) {
      for (let k = 0; k < tileBlock["data"]["questions"].length; k++) {
        let opt = {
          "index": k,
          "value": "",
          "text": tileBlock["data"]["questions"][k]
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

  getReportRuleDatas() {
    let tileCats = this.getTileCategories();
    let tilesAndSquares = this.getAppTileSquares();
    let ruleList = this.getRuleList();
    let procedureList = this.getProcedures();
    let appList = this.getApps();

    return observableForkJoin([tileCats, tilesAndSquares, ruleList, procedureList, appList]);
  };

  getTileCategories() {
    let tileCategory = this.tileService.getTileCategory(this.oid);

    return tileCategory;
  };

  getAppTileSquares() {
    let tilesAndSquares = this.reportGeneratorService.getAppTileSquares(this.oid);

    return tilesAndSquares;
  };

  getRuleList(ruleId?: string) {
    let qaWeights = this.reportGeneratorService.getReportRule(this.oid, ruleId);

    return qaWeights;
  };

  getProcedures() {
    let procedures = this.procedureService.procedureList(this.oid, "", "procedure");

    return procedures;
  };

  getApps() {
    let apps = this.pageService.getApps(this.oid);

    return apps;
  };

  /* Tile Notify Icons */
  tileNotifyIcons(currTile: Object, appTiles: Object) {
    var tileNotifications = "";
    var tileSmart = "";
    var pageApps = "";
    var tileProcedure = "";
    var tileRules = "";
    currTile["procedureIds"] = [];

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

          currTile["procedureIds"].push(procedure["procId"]);
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

    let sqrTile = this.tileSquares.find(s => s['tileId'] === currTile["_id"]);

    if (!this.utils.isEmptyObject(sqrTile)) {
      sqrTile["procedureIds"] = currTile["procedureIds"];
    }

    return currTile;
  };

  selectTiles(e: any, currTile: Object) {
    e.preventDefault();
    e.stopPropagation();

    if (this.selectedReport !== "-1") {
      let tileIndex: number = this.selectedTiles.indexOf(currTile["_id"]);

      if (this.selectedReport === "1") {
        for (let i = 0; i < this.selectedTiles.length; i++) {
          this.unassignSelectedBaseSquare(this.selectedTiles[i]);
        }

        this.selectedTiles = [];
        this.baseTiles = [];
      }

      if (tileIndex === -1) {
        this.selectedTiles.push(currTile["_id"]);
        this.baseTiles.push(currTile);

        if (this.selectedBaseTile !== "-1") {
          this.assignSelectedBaseSquare(currTile["_id"]);
        } else if (this.selectedReport === "1") {
          this.reportEnableSelected(currTile["_id"]);
        }
      } else if(this.selectedReport !== "1") {
        this.selectedTiles.splice(tileIndex, 1);
        this.baseTiles.splice(tileIndex, 1);

        if (this.selectedBaseTile === currTile["_id"]) {
          this.selectedBaseTile = "-1";
        }

        this.unassignSelectedBaseSquare(currTile["_id"]);
      }
    } else {
      this.utils.iAlert('error', 'Information', 'Please select report type');
    }
  };

  assignSelectedBaseSquare(tileId: string) {
    let baseSqr: Object = this.tileSquares.find(s => s['tileId'] === this.selectedBaseTile);

    let selectedBaseOpt: any[] = [];

    if (!this.utils.isEmptyObject(baseSqr)) {
      let assigned: string = baseSqr["assigned"];

      for (let i = 0; i < baseSqr["blocks"].length; i++) {
        let blk: Object = baseSqr["blocks"][i];

        for (let j = 0; j < blk["options"].length; j++) {
          let opt: Object = blk["options"][j];

          if (opt["blkValue"] === assigned) {
            selectedBaseOpt = opt["datas"];
            break;
          }
        }

        if (selectedBaseOpt.length > 0) {
          break;
        }
      }
    }

    if (selectedBaseOpt.length > 0) {
      let currTile: Object = this.tileSquares.find(s => s['tileId'] === tileId);
      let currAssigned: string = currTile["assigned"];

      for (let i = 0; i < currTile["blocks"].length; i++) {
        let blk: Object = currTile["blocks"][i];

        for (let j = 0; j < blk["options"].length; j++) {
          let opt: Object = blk["options"][j];

          let optLen: number = selectedBaseOpt.length > 0 ? selectedBaseOpt.length - 1 : -1;

          for (let k = 0; k < opt["datas"].length; k++) {
            let currData = opt["datas"][k];
            currData["value"] = currAssigned == opt["blkValue"] && selectedBaseOpt.length > 0 && k <= optLen && !this.utils.isNullOrEmpty(selectedBaseOpt[k]["value"]) ? selectedBaseOpt[k]["value"] : "";
          }
        }
      }
    }
  };

  unassignSelectedBaseSquare(tileId: string) {
    let sqrTile: Object = this.tileSquares.find(s => s['tileId'] === tileId);

    if (!this.utils.isEmptyObject(sqrTile)) {
      for (let j = 0; j < sqrTile["blocks"].length; j++) {
        let blk: Object = sqrTile["blocks"][j];
        sqrTile["assigned"] = "";

        for (let k = 0; k < blk["options"].length; k++) {
          let opt: Object = blk["options"][k];
          opt["isDisabled"] = true;

          for (let m = 0; m < opt["datas"].length; m++) {
            let currData = opt["datas"][m];
            currData["value"] = "";
          }
        }
      }

      if (sqrTile["blocks"].length > 0) {
        let opt = sqrTile["blocks"][0]["options"][0];
        sqrTile["assigned"] = opt["blkValue"];
      }
    }
  };

  reportEnableSelected(tileId: string) {
    let sqrTile: Object = this.tileSquares.find(s => s['tileId'] === tileId);

    if (!this.utils.isEmptyObject(sqrTile)) {
      let blocks: Object = sqrTile["blocks"];

      for (let blk in blocks) {
        if (blocks.hasOwnProperty(blk)) {
          let currBlk: Object = blocks[blk];

          var opt = currBlk["options"][0];
          opt["isDisabled"] = false;
          break;
        }
      }
    }
  };

  checkSelectedExists(currTile: Object) {
    return this.selectedTiles.indexOf(currTile["_id"]) > -1 ? true : false;
  };

  doSort(isVal: boolean) {
    this.tileSort["isAsc"] = isVal;
  };

  changeTileView(viewName: string) {
    this.tileSort["listType"] = viewName;
  };

  selectRule(e: any, ruleObj: Object) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.utils.isEmptyObject(ruleObj) && this.selectedRule["_id"] === ruleObj["_id"]) {
      return false;
    }

    this.reportRuleReset();

    if (this.utils.isEmptyObject(this.selectedRule) || (!this.utils.isEmptyObject(this.selectedRule) && this.selectedRule["_id"] !== ruleObj["_id"])) {
      this.loaderShared.showSpinner(true);
      this.selectedRule = Object.assign({}, ruleObj);
      this.selectReportData();
      this.loaderShared.showSpinner(false);
    }
  };

  appChange(appId: string) {
    this.selectedApp = appId;
  };

  reportChange(repType: string) {
    this.reportRuleReset(true);

    this.setSquarePanelHeight(repType);
    this.selectedReport = repType;
  };

  setSquarePanelHeight(repType: string) {
    this.squaresPanelHgt = repType === "0" ? 843 : 870;
  };

  changeTileBase(selectedVal: any, sqr: Object, opt: Object) {
    setTimeout(() => {
      opt["isDisabled"] = this.selectedReport === "0" && this.selectedBaseTile === sqr["tileId"] ? false : this.selectedReport === "1" ? false : true;
      sqr["assigned"] = selectedVal;
    }, 0);

    let selectedBaseOpt: any[] = [];

    for (let i = 0; i < this.selectedTiles.length; i++) {
      let currSqr: Object = this.tileSquares.find(s => s['tileId'] === this.selectedTiles[i]);
      let assigned: string = currSqr["assigned"];

      for (let j = 0; j < currSqr["blocks"].length; j++) {
        let blck: Object = currSqr["blocks"][j];

        for (let k = 0; k < blck["options"].length; k++) {
          let opt: Object = blck["options"][k];

          if (sqr["tileId"] === currSqr["tileId"] && opt['blkValue'] !== selectedVal && !opt["isDisabled"]) {
            opt["isDisabled"] = true;
          }

          if (sqr["tileId"] !== currSqr["tileId"] && currSqr["tileId"] === this.selectedBaseTile && opt['blkValue'] === assigned) {
            selectedBaseOpt = opt["datas"];
          }

          let optLen: number = selectedBaseOpt.length > 0 ? selectedBaseOpt.length - 1 : -1;

          if ((currSqr["tileId"] !== this.selectedBaseTile) || (sqr["tileId"] === currSqr["tileId"])) {
            for (let m = 0; m < opt["datas"].length; m++) {

              let currData = opt["datas"][m];
              currData["value"] = this.selectedBaseTile !== "-1" && currSqr["tileId"] !== this.selectedBaseTile && selectedBaseOpt.length > 0 && m <= optLen && sqr["tileId"] === currSqr["tileId"] && opt['blkValue'] === selectedVal && !this.utils.isNullOrEmpty(selectedBaseOpt[m]["value"]) ? selectedBaseOpt[m]["value"] : "";
            }
          }
        }
      }
    }
  };

  changeSubSquareValues(dt: Object, currVal: string, currIdx: number) {
    dt['value'] = currVal;

    for (let i = 0; i < this.selectedTiles.length; i++) {
      let currSqr: Object = this.tileSquares.find(s => s['tileId'] === this.selectedTiles[i]);
      let assigned: string = currSqr["assigned"];

      for (let j = 0; j < currSqr["blocks"].length; j++) {
        let blck: Object = currSqr["blocks"][j];

        for (let k = 0; k < blck["options"].length; k++) {
          let opt: Object = blck["options"][k];

          for (let m = 0; m < opt["datas"].length; m++) {
            let currData = opt["datas"][m];

            if (m === currIdx && assigned === opt['blkValue']) {
              currData["value"] = currVal;
            }
          }
        }
      }
    }
  };

  baseLineTileChange(tileId: string) {
    this.selectedBaseTile = tileId;

    let sqrIdx: number = this.tileSquares.map(s => { return s['tileId']; }).indexOf(tileId);
    let baseIdx: number = this.baseTiles.map(t => { return t['_id']; }).indexOf(tileId);
    let selectedIdx: number = this.selectedTiles.indexOf(tileId);
    let sqrObj: Object = {};

    if (sqrIdx !== -1) {
      sqrObj = Object.assign({}, this.tileSquares[sqrIdx]);
      this.utils.arrayMove(this.tileSquares, sqrIdx, 0);
    }

    if (baseIdx !== -1) {
      this.utils.arrayMove(this.baseTiles, baseIdx, 0);
    }

    if (selectedIdx !== -1) {
      this.utils.arrayMove(this.selectedTiles, selectedIdx, 0);
    }

    setTimeout(() => {
      this.resetSquares(tileId);
    }, 0);
  };

  resetSquares(tileId?: string) {
    for (let i = 0; i < this.selectedTiles.length; i++) {
      let currSqr: Object = this.tileSquares.find(s => s['tileId'] === this.selectedTiles[i]);
      currSqr["assigned"] = "";
      currSqr["xAxisLabel"] = currSqr["title"];

      for (let j = 0; j < currSqr["blocks"].length; j++) {
        let blck: Object = currSqr["blocks"][j];

        for (let k = 0; k < blck["options"].length; k++) {
          let opt: Object = blck["options"][k];
          opt["isDisabled"] = true;

          for (let m = 0; m < opt["datas"].length; m++) {
            let currData = opt["datas"][m];
            currData["value"] = "";
          }
        }
      }

      if (currSqr["blocks"].length > 0) {
        let opt = currSqr["blocks"][0]["options"][0];
        currSqr["assigned"] = opt["blkValue"];
        opt["isDisabled"] = !this.utils.isNullOrEmpty(tileId) && currSqr["tileId"] === tileId ? false : true;
      }
    }
  };

  selectReportData() {
    if (!this.utils.isEmptyObject(this.selectedRule)) {
      var reportObj = this.selectedRule;

      var reportType = reportObj.hasOwnProperty("type") && !this.utils.isNullOrEmpty(reportObj["type"]) ? reportObj["type"] : "0";
      this.reportName = reportObj.hasOwnProperty("name") && !this.utils.isNullOrEmpty(reportObj["name"]) ? reportObj["name"] : "";
      this.selectedReport = reportObj.hasOwnProperty("type") && !this.utils.isNullOrEmpty(reportObj["type"]) ? reportObj["type"] : "-1";

      if (this.selectedReport === "0") {
        this.selectedProcedure = reportObj.hasOwnProperty("procedureId") && !this.utils.isNullOrEmpty(reportObj["procedureId"]) ? reportObj["procedureId"] : "-1";
      }

      this.setSquarePanelHeight(reportType);

      if (reportObj.hasOwnProperty("tiles") && !this.utils.isEmptyObject(reportObj["tiles"])) {
        let currTiles: Object = reportObj["tiles"];

        for (let tileId in currTiles) {
          let tileObj: Object = currTiles[tileId];
          let tile: Object = this.tileList.find(t => t['_id'] === tileId);
          let tileSqr: Object = this.tileSquares.find(s => s['tileId'] === tileId);

          var base = tileObj.hasOwnProperty("base") && !this.utils.isNullOrEmpty(tileObj["base"]) ? this.utils.convertToBoolean(tileObj["base"]) : false;
          var blockIds = tileObj.hasOwnProperty("blocks") && !this.utils.isEmptyObject(tileObj["blocks"]) ? Object.keys(tileObj["blocks"]) : [];

          this.selectedTiles.push(tileId);
          this.baseTiles.push(tile);

          if (base) {
            this.selectedBaseTile = tileId;
          }

          base = this.selectedReport === "1" ? true : base;

          this.selectAssignedTileBlocks(blockIds, tileId, tileSqr, tileObj, base, reportType);
        }

        if (this.selectedBaseTile !== "-1") {
          let sqrIdx: number = this.tileSquares.map(s => { return s['tileId']; }).indexOf(this.selectedBaseTile);
          let baseIdx: number = this.baseTiles.map(t => { return t['_id']; }).indexOf(this.selectedBaseTile);
          let selectedIdx: number = this.selectedTiles.indexOf(this.selectedBaseTile);

          if (sqrIdx !== -1) {
            this.utils.arrayMove(this.tileSquares, sqrIdx, 0);
          }

          if (baseIdx !== -1) {
            this.utils.arrayMove(this.baseTiles, baseIdx, 0);
          }

          if (selectedIdx !== -1) {
            this.utils.arrayMove(this.selectedTiles, selectedIdx, 0);
          }
        }
      }
    }
  };

  selectAssignedTileBlocks(blockIds: string[], tileId: string, tileSqr: Object, tileObj: Object, base: boolean, reportType: string) {
    if (blockIds.length > 0) {
      if (reportType === "0") {
        tileSqr["xAxisLabel"] = tileObj["xAxisLabel"];
      }

      for (let i = 0; i < blockIds.length; i++) {
        var blockAnswers = tileObj["blocks"][blockIds[i]];
        var assignedBlock = tileSqr["blocks"].find(b => b["blockId"] === blockIds[i]);

        if (!this.utils.isEmptyObject(assignedBlock)) {
          if (this.utils.isArray(blockAnswers)) {
            var opt = assignedBlock["options"][0];
            opt["isDisabled"] = base ? false : true;
            tileSqr['assigned'] = opt["blkValue"];

            for (let j = 0; j < opt["datas"].length; j++) {
              opt["datas"][j]["value"] = !this.utils.isNullOrEmpty(blockAnswers[j]) ? blockAnswers[j] : "";
            }
          } else {
            for (let idxKy in blockAnswers) {
              var idxAnswers = blockAnswers[idxKy];
              var idxOpt = assignedBlock["options"].find(b => b["index"].toString() === idxKy.toString());

              if (!this.utils.isEmptyObject(idxOpt)) {
                idxOpt["isDisabled"] = base ? false : true;
                tileSqr['assigned'] = idxOpt["blkValue"];

                for (let k = 0; k < idxOpt["datas"].length; k++) {
                  idxOpt["datas"][k]["value"] = !this.utils.isNullOrEmpty(idxAnswers[k]) ? idxAnswers[k] : "";
                }
              }
            }
          }
        }
      }
    }
  };

  reportNew(e: any) { // Resetting the report to new fresh
    e.preventDefault();
    this.reportRuleReset();
  };

  reportSave(e: any) { // Saving the report
    e.preventDefault();

    let tileSquares: Object = {};

    if (this.utils.isNullOrEmpty(this.reportName)) {
      this.utils.iAlert('error', 'Information', 'Report name is empty');
      return false;
    }

    if (this.selectedReport === "-1") {
      this.utils.iAlert('error', 'Information', 'Report type not selected');
      return false;
    }

    if (this.selectedReport === "0" && this.selectedBaseTile === "-1") {
      this.utils.iAlert('error', 'Information', 'No base tile is selected');
      return false;
    }

    if (this.selectedTiles.length > 0) {
      this.loaderShared.showSpinner(true);

      let isNotInt: boolean = false;

      for (let i = 0; i < this.selectedTiles.length; i++) {
        let currTileId: string = this.selectedTiles[i];
        let tileSqr: Object = this.tileSquares.find(s => s['tileId'] === currTileId);
        let isBase: boolean = this.selectedBaseTile !== "-1" && this.selectedBaseTile === currTileId ? true : false;

        if (!this.utils.isEmptyObject(tileSqr)) {
          let xAxisLabel: string = tileSqr["xAxisLabel"];
          let assignedBlckVal: string = tileSqr["assigned"]
          let blockSplitted: string[] = assignedBlckVal.split("-");
          let blockId: string = blockSplitted.length > 1 ? blockSplitted[1] : blockSplitted[0];
          let blockObj: Object = tileSqr["blocks"].find(b => b["blockId"] === blockId);
          let blockIdx: string = blockSplitted.length > 1 ? blockSplitted[0] : "-1";
          let repVals: number[] = [];

          if (!this.utils.isEmptyObject(blockObj)) {
            let blockOpts: Object = blockObj["options"].find(o => o["blkValue"] === assignedBlckVal);

            if (!this.utils.isEmptyObject(blockOpts)) {
              let reportDatas: any[] = blockOpts["datas"];

              for (let j = 0; j < reportDatas.length; j++) {
                let currVal: any = reportDatas[j]["value"];

                if ((!this.utils.isNullOrEmpty(currVal) && this.utils.validateNumber(currVal)) || this.utils.isNullOrEmpty(currVal)) {
                  repVals.push(parseInt(currVal));
                } else if (!this.utils.isNullOrEmpty(currVal)) {
                  this.utils.iAlert('error', 'Information', 'Absolute Value is not an integer!!!');
                  isNotInt = true;
                  break;
                }
              }
            }
          }

          if (!isNotInt) {
            tileSquares[currTileId] = {
              "base": isBase,
              "blocks": {}
            };

            if (this.selectedReport == "0") {
              tileSquares[currTileId]["xAxisLabel"] = xAxisLabel;
            }

            let cascadeQues: Object = {};

            if (blockIdx !== "-1") {
              cascadeQues[blockIdx] = repVals;
            }

            tileSquares[currTileId]["blocks"][blockId] = blockIdx !== "-1" ? cascadeQues : repVals;
          }
        }

        if (isNotInt) {
          break;
        }
      }

      if (isNotInt) {
        this.loaderShared.showSpinner(false);
        return false;
      }

      let reportDataObj: Object = {
        "name": this.reportName,
        "tiles": tileSquares,
        "type": this.selectedReport,
        "organizationId": this.oid,
        "dateCreated": (new Date()).toUTCString(),
        "dateUpdated": (new Date()).toUTCString()
      };

      if (this.selectedProcedure !== "-1") {
        reportDataObj["procedureId"] = this.selectedProcedure;
      }

      if (!this.utils.isEmptyObject(this.selectedRule)) {
        reportDataObj["_id"] = this.selectedRule["_id"];
        reportDataObj["dateCreated"] = this.selectedRule["dateCreated"];
      }

      this.reportGeneratorService.saveReportRule(reportDataObj)
        .subscribe(repObj => {
          let repId: string = !this.utils.isEmptyObject(repObj) && repObj.hasOwnProperty("_id") ? repObj["_id"] : "-1";

          if (!this.utils.isNullOrEmpty(repId)) {
            this.getRuleList(repId).subscribe(repList => {

              if (this.utils.isArray(repList) && repList.length > 0) {
                if (reportDataObj.hasOwnProperty("_id")) {
                  let repIdx: number = this.reportRuleList.map(rpl => { return rpl['_id']; }).indexOf(repId);
                  this.reportRuleList[repIdx] = repList[0];
                } else {
                  this.reportRuleList.push(repList[0]);
                }

                this.selectedRule = repList[0];
              }
            });
          }

          let alertMsg: string = reportDataObj.hasOwnProperty("_id") ? "Report updated successfully" : "Report saved sucessfully";
          this.loaderShared.showSpinner(false);
          this.utils.iAlert("success", "", alertMsg);
        });
    } else {
      this.utils.iAlert('error', 'Information', 'No blocks are selected');
    }
  };

  reportDelete(e: any) { // Deleting the report
    e.preventDefault();
    e.stopPropagation();

    if (!this.utils.isEmptyObject(this.selectedRule)) {
      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Report rule??", "Delete", "Cancel", (r) => {
        if (r["resolved"]) {
          this.loaderShared.showSpinner(true);

          this.reportGeneratorService.removeReportRule(this.selectedRule["_id"]).subscribe(deleteStatus => {
            let ruleIdx: number = this.reportRuleList.map(rpl => { return rpl['_id']; }).indexOf(this.selectedRule["_id"]);
            this.reportRuleList.splice(ruleIdx, 1);
            this.loaderShared.showSpinner(false);
            this.reportRuleReset();

            this.utils.iAlert('success', '', 'Rule deleted successfully');
          });
        }
      });
    } else {
      this.utils.iAlert('error', 'Information', 'Please select a Rule!!!');
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.reportRuleDataReset();
        this.setScrollList();
        this.oid = Cookie.get('oid');
        this.loadReportRule();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
