import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { TileService } from '../../services/tile.service';
import { QaScoresService } from '../../services/qa-scores.service';
import { ProcedureService } from '../../services/procedure.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'app-qa-scores',
  templateUrl: './qa-scores.component.html',
  styleUrls: ['./qa-scores.component.css'],
  providers: [QaScoresService],
  encapsulation: ViewEncapsulation.None
})
export class QaScoresComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    private tileService: TileService,
    private procedureService: ProcedureService,
    private qaScoresService: QaScoresService
  ) { }

  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  tileCategories: any[] = [];
  selectedCategory: string = "-1";
  tileList: any[] = [];
  selectedTiles: string[] = [];
  tileSquares: any[] = [];
  weightList: any[] = [];
  selectedWeight: Object = {};
  weightTextSearch: string = "";
  proceduresList: any[] = [];
  selectedProcedure: string = "";
  weightTitle: string = "";

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

  qaScoresDataReset() {
    this.qaScoresReset();
    this.resetByTilesData();
    this.oid = "";
    this.tileSquares = [];
    this.tileList = [];
    this.tileCategories = [];
    this.weightList = [];
    this.proceduresList = [];
  };

  qaScoresReset() {
    this.selectedTiles = [];
    this.selectedWeight = {};
    this.weightTextSearch = "";
    this.selectedProcedure = "";
    this.weightTitle = "";
    this.resetAssignedScores();
  };

  resetByTilesData() {
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

  /*Tile Notify Icons */
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

  getTileCategories() {
    let tileCategory = this.tileService.getTileCategory(this.oid);

    return tileCategory;
  };

  getAppTileSquares() {
    let tilesAndSquares = this.qaScoresService.getAppTileSquares(this.oid);

    return tilesAndSquares;
  };

  getWeightList() {
    let qaWeights = this.qaScoresService.getQaScores(this.oid);

    return qaWeights;
  };

  getProcedures() {
    let procedures = this.procedureService.procedureList(this.oid, "", "procedure");

    return procedures;
  };

  setScrollList() {
    this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);
    this.mScrollbarService.initScrollbar("#main-tile_squares", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#tiles-list-show");
      this.cms["appDatas"]["scrollList"].push("#main-tile_squares");
      this.cms["appDatas"]["scrollList"].push("#wgt_group_main");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#tiles-list-show", "#main-tile_squares", "#wgt_group_main"];
    }
  };

  loadQaScores() {
    this.getQaScoreDatas().subscribe(qaScoreDatas => {
      this.setTileCategories(qaScoreDatas[0]);
      this.setTileSquares(qaScoreDatas[1]);
      this.setWeightList(qaScoreDatas[2]);
      this.setProcedures(qaScoreDatas[3]);

      this.loaderShared.showSpinner(false);
    });
  };

  getQaScoreDatas() {
    let tileCats = this.getTileCategories();
    let tilesAndSquares = this.getAppTileSquares();
    let weightList = this.getWeightList();
    let procedureList = this.getProcedures();

    return Observable.forkJoin([tileCats, tilesAndSquares, weightList, procedureList]);
  };

  setProcedures(procList: any[]) {
    this.proceduresList = procList;
  };

  setTileCategories(tileCats: any[]) {
    if (this.utils.isArray(tileCats) && tileCats.length > 0) {
      this.tileCategories = tileCats;
    }
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

  setWeightList(wghtlist: any[]) {
    this.weightList = wghtlist;
  };

  setSquares(tiles: any[]) {
    let tileIds: string[] = [];

    if (this.utils.isArray(tiles) && tiles.length > 0) {
      let blockIds: string[] = [];

      for (let i = 0; i < tiles.length; i++) {
        let currTile: Object = tiles[i];
        let squareObj: Object = { "uniqueId": this.getUniqueId(), "tileId": currTile["_id"], "title": currTile["title"], "blocks": [] }
        let blocksData: any[] = currTile.hasOwnProperty("blocksData") && currTile["blocksData"].length > 0 ? currTile["blocksData"] : [];

        if (blocksData.length > 0) {
          let blks: any[] = blocksData.filter(blk => {
            return blk["type"] === 'survey' || blk["type"] === 'painlevel' || blk["type"] === 'questionnaire';
          });

          for (let j = 0; j < blks.length; j++) {
            let blkData = blks[j];

            let currBlock = { "blockId": blkData["_id"], "type": blkData["type"] };

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
      "assigned": false,
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
        "assigned": false,
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
      "assigned": false,
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

  checkSelectedExists(currTile: Object) {
    return this.selectedTiles.indexOf(currTile["_id"]) > -1 ? true : false;
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#tiles-list-show", "#main-tile_squares", "#wgt_group_main"]);
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

  selectWeight(e: any, wgtObj: Object) {
    e.preventDefault();
    e.stopPropagation();

    if (this.utils.isEmptyObject(this.selectedWeight) || (!this.utils.isEmptyObject(this.selectedWeight) && this.selectedWeight["_id"] !== wgtObj["_id"])) {
      this.loaderShared.showSpinner(true);
      this.qaScoresReset();
      let wgtTitle: string = wgtObj.hasOwnProperty("title") && !this.utils.isNullOrEmpty(wgtObj["title"]) ? wgtObj["title"] : "";
      this.weightTitle = wgtTitle;
      this.selectedWeight = wgtObj;
      this.assignSquaresScores(wgtObj);
      this.loaderShared.showSpinner(false);
    }
  };

  assignSquaresScores(wgtObj: Object) {
    if (!this.utils.isEmptyObject(wgtObj)) {
      if (wgtObj.hasOwnProperty("weight")) {
        for (let tileId in wgtObj["weight"]) {
          let sqrTile: Object = this.tileSquares.find(s => s['tileId'] === tileId);

          if (this.selectedTiles.indexOf(tileId) === -1) {
            this.selectedTiles.push(tileId);
          }

          if (!this.utils.isEmptyObject(sqrTile) && wgtObj["weight"].hasOwnProperty(tileId)) {
            let blocksObjs: Object = wgtObj["weight"][tileId];

            if (!this.utils.isEmptyObject(blocksObjs)) {
              for (let blkId in blocksObjs) {
                let blkObj: Object = sqrTile["blocks"].find(s => s['blockId'] === blkId);
                let wgtBlk = wgtObj["weight"][tileId][blkId];

                if (!this.utils.isEmptyObject(blkObj) && blkObj["options"].length > 0) {
                  for (let i = 0; i < blkObj["options"].length; i++) {
                    let currOpt: Object = blkObj["options"][i];

                    for (let idx in wgtBlk) {
                      if (currOpt["index"] === "-1") {
                        let weightValues: any[] = wgtBlk[idx];
                        currOpt["assigned"] = true;

                        for (let j = 0; j < currOpt["datas"].length; j++) {
                          let currData = currOpt["datas"][j];

                          var currVal = !this.utils.isNullOrEmpty(weightValues[j]) ? weightValues[j] : "";
                          currData["value"] = currVal;
                        }

                      } else {
                        let idxBlk: Object = blkObj["options"].find(b => b['index'] === idx);

                        if (!this.utils.isEmptyObject(idxBlk)) {
                          let weightValues: any[] = wgtBlk[idx];
                          idxBlk["assigned"] = true;

                          for (let j = 0; j < idxBlk["datas"].length; j++) {
                            let currData = idxBlk["datas"][j];

                            var currVal = !this.utils.isNullOrEmpty(weightValues[j]) ? weightValues[j] : "";
                            currData["value"] = currVal;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  resetAssignedScores() {
    if (this.tileSquares.length > 0) {
      for (let i = 0; i < this.tileSquares.length; i++) {
        let currSqr: Object = this.tileSquares[i];

        for (let j = 0; j < currSqr["blocks"].length; j++) {
          let blk: Object = currSqr["blocks"][j];

          for (let k = 0; k < blk["options"].length; k++) {
            let opt: Object = blk["options"][k];

            opt["assigned"] = false;

            for (let m = 0; m < opt["datas"].length; m++) {
              let currData = opt["datas"][m];
              currData["value"] = "";
            }
          }
        }
      }
    }
  };

  saveWeight(e: any) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    let weightSaveObj: Object = {};

    if (this.utils.isNullOrEmpty(this.weightTitle)) {
      this.utils.iAlert('error', 'Information', 'Weight title is empty');
      return false;
    }

    if (!this.utils.isEmptyObject(this.selectedWeight)) {
      weightSaveObj["_id"] = this.selectedWeight["_id"];
    }

    let wgtSqrs: Object = this.getAssignedSquares();

    weightSaveObj["title"] = this.weightTitle;
  };

  getAssignedSquares() {
    let weightScoreObj: Object = {};

    if (this.tileSquares.length > 0) {
      for (let i = 0; i < this.tileSquares.length; i++) {
        let sqr: Object = this.tileSquares[i];

        weightScoreObj[sqr["tileId"]] = {};
        let blockAssigned: Object = {};

        for (let j = 0; j < sqr["blocks"].length; j++) {
          let blk: Object = sqr["blocks"][j];
          let blkId: string = blk["blockId"];

          for (let k = 0; k < blk["options"].length; k++) {
            let opt: Object = blk["options"][k];
            let optIndx = opt["index"];
            let answers: any[] = [];

            let isBlkWeightAnswered: boolean = false;

            for (let l = 0; l < blk["datas"].length; l++) {
              let optData: Object = blk["datas"][l];

              if (!isBlkWeightAnswered) {
                isBlkWeightAnswered = !this.utils.isNullOrEmpty(optData["value"]) ? true : false;
              }

              answers.push(optData["value"]);
            }

            if (isBlkWeightAnswered) {
              if (!blockAssigned.hasOwnProperty(blkId)) {
                blockAssigned[blkId] = {};
              }

              blockAssigned[blkId][optIndx] = answers;
            }
          }
        }

        if (!this.utils.isEmptyObject(blockAssigned)) {
          weightScoreObj[sqr["tileId"]] = blockAssigned;
        }
      }
    }

    return weightScoreObj;
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.qaScoresDataReset();
        this.setScrollList();
        this.oid = Cookie.get('oid');
        this.loadQaScores();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
