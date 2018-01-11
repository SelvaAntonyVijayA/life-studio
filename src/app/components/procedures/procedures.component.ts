import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { ProcedureService } from '../../services/procedure.service';

declare var $: any;
declare var combobox: any;

@Component({
  selector: 'procedures',
  templateUrl: './procedures.component.html',
  styleUrls: ['./procedures.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ProceduresComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private procedureService: ProcedureService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private tileService: TileService,
    private renderer: Renderer) {
    this.utils = Utils;
  }

  organizations: any[] = [];
  private orgChangeDetect: any;
  oid: string = "";
  utils: any;
  draggedTiles: any[] = [];
  tileDropped: Object = {};
  tilesToUpdate: any[] = [];
  isMerge: Object = {};
  droppedTile: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  procedureFilter: Object = {
    "procedureSearch": "",
    "procedureCategory": { "_id": "-1", "fieldName": "category" },
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"],
        "type": ["categoryName"]
      }
    },
  };

  procedures: any[] = [];
  procedure: Object = {};
  dragIndex: number = -1;
  languageList: any[] = [];
  selectedLanguage: string = "en";
  procedureCategories: any[] = [];
  procedureName: string = "";
  procedureCategory: string = "-1";
  isSquare: boolean = false;

  /* Setting for default dragged tile */
  setDraggedTile(tile: any, procObj?: Object) {
    var dragged = {
      "uniqueId": this.getUniqueId(), "tile": {},
    };

    if (tile && !this.utils.isEmptyObject(tile)) {
      tile = this.tileNotifyIcons(tile);

      var currTile = {
        "_id": tile.hasOwnProperty("_id") ? tile["_id"] : "-1",
        "title": tile.hasOwnProperty("title") && !this.utils.isNullOrEmpty(tile["title"]) ? tile["title"] : "",
        "art": tile.hasOwnProperty("art") && !this.utils.isNullOrEmpty(tile["art"]) ? tile["art"] : "",
        "categoryName": tile.hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(tile["categoryName"]) ? tile["categoryName"] : "",
        "tileApps": tile["tileApps"],
        "isWeight": tile["isWeight"],
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

      dragged["tile"] = currTile;
    }

    var isTrigger = this.utils.isEmptyObject(procObj);

    dragged["triggerDays"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("triggerDays") ? procObj["triggerDays"] : 0;
    dragged["triggerActionOn"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("triggerActionOn") ? procObj["triggerActionOn"] : "before";
    dragged["expireInDays"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("expireInDays") ? procObj["expireInDays"] : 0;
    dragged["imageUrl"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("imageUrl") ? procObj["imageUrl"] : 0;
    dragged["permanent"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("permanent") ? procObj["permanent"] : false;
    dragged["topSquare"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("topSquare") ? procObj["topSquare"] : false;
    dragged["orderFirst"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("orderFirst") ? procObj["orderFirst"] : false;
    dragged["showName"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("showName") ? procObj["showName"] : true;
    dragged["reminder"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("reminder") ? procObj["reminder"] : false;
    dragged["isHospital"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("isHospital") ? procObj["isHospital"] : false;
    dragged["notForPatient"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("notForPatient") ? procObj["notForPatient"] : false;
    dragged["createDate"] = !this.utils.isEmptyObject(procObj) && procObj.hasOwnProperty("createDate") ? procObj["createDate"] : (new Date()).toUTCString();
    return dragged;
  };

  getTileContent(tileObj: any) {

  };

  languageChange(langId: string) {
    this.checkNew('Would you like to save your previous work?', (isChanged) => {
      if (isChanged) {
        this.saveProcedure("", false, false, "language", { "langId": langId });
      } else {
        this.selectedLanguage = langId;
        this.setLanguageData();
      }
    });
  };

  setLanguageData() {
    var procObj = this.procedure.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.procedure["obj"]) ? this.procedure["obj"] : {};

    if (!this.utils.isNullOrEmpty(procObj) && procObj.hasOwnProperty(this.selectedLanguage)) {
      if (procObj[this.selectedLanguage].hasOwnProperty("tiles") && procObj[this.selectedLanguage]["tiles"].length > 0) {
        var langTiles = procObj[this.selectedLanguage]["tiles"];
      }
    } else if ((this.selectedLanguage === "en" || !procObj.hasOwnProperty(this.selectedLanguage)) && (procObj.hasOwnProperty("tiles") && procObj["tiles"].length > 0)) {
      langTiles = procObj["tiles"];
    }

    if (langTiles.length > 0 || this.selectedLanguage === "en" || procObj.hasOwnProperty(this.selectedLanguage)) {
      this.draggedTiles = [];
      this.procedure["draggedTiles"] = [];
    }

    for (let i = langTiles.length - 1; 0 <= i; i--) {
      if (langTiles[i].hasOwnProperty("_id")) {
        this.draggedTiles.push(langTiles[i]["_id"]);
        this.assignDragged(langTiles[i]);
      }
    }
  };

  /* Dragged tile on drop */
  private onDrop(currTile, isDynamic) {
    var draggedTile = this.setDraggedTile(currTile);

    if (this.procedure.hasOwnProperty("draggedTiles")) {
      if (this.dragIndex === -1) {
        this.procedure["draggedTiles"].push(draggedTile);
      } else {
        var currIdx = this.dragIndex;

        if (!isDynamic) {
          this.procedure["draggedTiles"].splice(currIdx, 1);
        } else {
          this.procedure["draggedTiles"][currIdx] = draggedTile;
        }

        this.dragIndex = -1;
      }
    } else {
      this.procedure["draggedTiles"] = [draggedTile];
    }

    this.droppedTile = currTile;
  };

  /* Setting Drag Index for every tile index change */
  setDragIndex(idx: number, obj: any) {
    if (this.dragIndex !== -1 && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("procedureDragContainer")) {
      var totalIdx = this.procedure["draggedTiles"].length - 1;

      this.dragIndex = !idx ? -1 : totalIdx - idx;
    }
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    //this.destroyScroll();

    this.mScrollbarService.initScrollbar('#dragged-procedure-tiles', this.scrollbarOptions);
    this.mScrollbarService.initScrollbar('#main-container-procedures', this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#dragged-procedure-tiles");
      this.cms["appDatas"]["scrollList"].push("#main-container-procedures");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#dragged-procedure-tiles", "#main-container-procedures"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#dragged-procedure-tiles", "#main-container-procedures"]);
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  resetProcedureDatas() {
    this.resetSort();
    this.resetProcedure();
    this.procedures = [];
    this.languageList = [];
    this.procedureCategories = [];
    this.oid = "";
  };

  resetSort() {
    this.procedureFilter["procedureSearch"] = ""
    this.procedureFilter["procedureCategory"]["_id"] = "-1";
    this.procedureFilter["sort"]["selected"] = "date_desc";
    this.procedureFilter["sort"]["isAsc"] = false;
  };

  resetProcedure(mergeReset?: string) {
    this.dragIndex = -1;
    this.droppedTile = {};
    this.isMerge = {};
    this.tilesToUpdate = [];
    this.draggedTiles = [];
    this.selectedLanguage = "en";
    this.procedure = {};
    this.procedureCategory = "-1";
    this.isSquare = false;
    this.procedureName = "";

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
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

  /* Fetching both procedures and procedure categories */
  listProcedureCategories() {
    this.procedureService.procedureCategoriesList(this.oid, "procedure").subscribe(listProcCat => {
      this.procedures = listProcCat[0];
      this.procedureCategories = listProcCat[1];
      this.mergeCategoryName();
    });
  };

  /* Getting current procedure object to assign category name */
  mergeCategoryName() {
    for (let i = 0; i < this.procedures.length; i++) {
      this.procedures[i] = this.assignCategoryName(this.procedures[i]);
    }
  };

  /* Assigning category name to the procedure object */
  assignCategoryName(procedureObj: any) {
    var procCatId = procedureObj.hasOwnProperty("category") ? procedureObj["category"] : "-1";
    var index = -1;

    if (procCatId !== "-1" && this.procedureCategories.length > 0) {
      index = this.procedureCategories.map(function (procCat) { return procCat['_id']; }).indexOf(procCatId);
    }

    procedureObj["categoryName"] = index !== -1 && this.procedureCategories[index].hasOwnProperty("name") ? this.procedureCategories[index]["name"] : "";

    return procedureObj;
  };

  /* Track a DOM by its index value */
  trackByIndex(index: number, obj: any): any {
    return index;
  };

  /* Dragged tile by uniqueId */
  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };

  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  tileNotifyIcons(currTile: Object) {
    var tileNotifications = "";
    var tileSmart = "";
    var pageApps = "";
    var tileProcedure = "";
    var tileRules = "";

    if (currTile.hasOwnProperty("notification") && currTile["notification"].hasOwnProperty("apps") && currTile["notification"]["apps"].length > 0) {
      for (let i = 0; i < currTile["notification"]["apps"].length; i++) {
        var app = currTile["notification"]["apps"][i];
        tileNotifications += i === 0 ? app.name : ", " + app.name;
      }

      currTile["isNotification"] = "block";
    } else {
      currTile["isNotification"] = "none";
    }

    if (currTile.hasOwnProperty("smart") && currTile["smart"].hasOwnProperty("apps") && currTile["smart"]["apps"].length > 0) {
      for (let i = 0; i < currTile["smart"]["apps"].length; i++) {
        var smartApp = currTile["smart"]["apps"][i];
        tileSmart += i == 0 ? smartApp.name : ", " + smartApp.name;
      }

      currTile["isSmart"] = "block";
    } else {
      currTile["isSmart"] = "none";
    }

    if (currTile.hasOwnProperty("Apps") && currTile["Apps"].length > 0) {
      for (let i = 0; i < currTile["Apps"].length; i++) {
        var app = currTile["Apps"][i];
        pageApps += i === 0 ? app.appName : ", " + app.appName;
      }
    }

    if (currTile.hasOwnProperty("Procedure") && currTile["Procedure"].length > 0) {
      for (let i = 0; i < currTile["Procedure"].length; i++) {
        var procedure = currTile["Procedure"][i];
        tileProcedure += i === 0 ? procedure.name : ", " + procedure.name;
      }

      currTile["isProcedure"] = "block";
    } else {
      currTile["isProcedure"] = "none";
    }

    if (currTile.hasOwnProperty("hsrRuleEngine") && currTile["hsrRuleEngine"].length > 0) {
      for (let i = 0; i < currTile["hsrRuleEngine"].length; i++) {
        var hsr = currTile["hsrRuleEngine"][i];
        tileRules += i === 0 ? hsr.ruleName : ", " + hsr.ruleName;
      }

      currTile["isRules"] = "block";
    } else {
      currTile["isRules"] = "none";
    }

    currTile["isWeight"] = currTile.hasOwnProperty("isWeight") && currTile["isWeight"] ? "block" : "none";
    currTile["isRole"] = currTile.hasOwnProperty("isRoleBased") && currTile["isRoleBased"] ? "block" : "none";
    currTile["tileNotifications"] = tileNotifications;
    currTile["tileSmart"] = tileSmart;
    currTile["tileApps"] = pageApps;
    currTile["tileProcedure"] = tileProcedure;
    currTile["tileHealthStatusRules"] = tileRules;

    return currTile;
  };

  /* Filter Changing */
  filterChange(val: any, fieldName: string) {
    if (fieldName === "procedureCategory") {
      this.procedureFilter[fieldName]["_id"] = val;
    }

    if (fieldName === "sort") {
      var sortOpt = val.split("_");
      this.procedureFilter[fieldName]["selected"] = val;
      this.procedureFilter[fieldName]["isAsc"] = sortOpt[1] === "asc" ? true : false;
    }
  };

  /*Procedure Notification Icon Check Conditions */
  procedureNotificationIcon(proc: any) {
    if (proc && proc.hasOwnProperty("notification") && proc.notification.hasOwnProperty("apps") && proc.notification.apps.length > 0) {
      for (let i = 0; i < proc.notification.apps.length; i++) {
        proc["tileNotifications"] = i === 0 ? proc.notification.apps[i]["name"] : ", " + proc.notification.apps[i]["name"];
      }
    }

    if (proc && proc.hasOwnProperty("Apps") && proc.Apps.length > 0) {
      for (let i = 0; i < proc.Apps.length; i++) {
        proc["pageApps"] = i === 0 ? proc.Apps[i]["appName"] : ", " + proc.Apps[i]["appName"];
      }
    }

    if (proc && proc.hasOwnProperty("smart") && proc.smart.hasOwnProperty("apps") && proc.smart.apps.length > 0) {
      for (let i = 0; i < proc.smart.apps.length; i++) {
        proc["tileSmart"] = i === 0 ? proc.smart.apps[i]["name"] : ", " + proc.smart.apps[i]["name"];
      }
    }

    proc["isRole"] = proc.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty("isRoleBased") && proc["isRoleBased"] ? true : false;
  };

  /* Selecting the current procedure in the DOM*/
  selectProcedure(e: any, obj: any) {
    e.preventDefault();
    e.stopPropagation();
    var self = this;

    var procExist = false;

    if (!this.utils.isEmptyObject(this.procedure) && this.procedure.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.procedure["obj"])) {
      if (this.procedure["obj"].hasOwnProperty("_id") && !this.utils.isNullOrEmpty(this.procedure["obj"]["_id"])) {
        procExist = this.procedure["obj"]["_id"] === obj["_id"] ? true : false;
      }
    }

    this.checkNew('Would you like to save your previous work?', (r) => {
      if (r) {
        this.saveProcedure("", false, false, "select", obj);
      } else {
        this.setProcedureData(true, obj);
      }
    });
  };

  /* Setting the procedure data for the DOM */
  setProcedureData(isSelect: boolean, obj: any, langId?: string) {
    if (isSelect) {
      this.resetProcedure();

      if (obj && obj.hasOwnProperty("tiles")) {
        for (let i = 0; i < obj.tiles.length; i++) {
          this.draggedTiles.push(obj.tiles[i]["_id"]);
        }
      }
    }

    this.procedureService.getProcedureByTiles(obj._id)
      .then(proObj => {
        if (proObj && proObj[0]) {
          this.assignProcedureDatas(proObj[0], langId);
        }
      });
  };

  assignProcedureDatas(objProcedure: Object, langId?: string) {
    this.procedure["obj"] = objProcedure;

    if (!this.utils.isEmptyObject(objProcedure)) {
      this.procedureName = objProcedure.hasOwnProperty("name") ? objProcedure["name"] : "";
      this.procedureCategory = objProcedure.hasOwnProperty("category") ? objProcedure["category"] : "";
      this.isSquare = objProcedure.hasOwnProperty("isSquare") ? objProcedure["isSquare"] : false;
    }

    if (!this.utils.isNullOrEmpty(langId)) {
      this.selectedLanguage = langId;
    } else if (this.utils.isNullOrEmpty(this.selectedLanguage)) {
      this.selectedLanguage = "en";
    }

    this.procedure["draggedTiles"] = [];
    var currTiles = []

    if (objProcedure.hasOwnProperty("tiles") && objProcedure["tiles"].length > 0 && this.selectedLanguage === "en") {
      currTiles = objProcedure["tiles"];
    } else if (!this.utils.isNullOrEmpty(this.selectedLanguage)) {
      if (!this.utils.isEmptyObject(objProcedure) && objProcedure.hasOwnProperty(this.selectedLanguage)) {
        if (objProcedure[this.selectedLanguage].hasOwnProperty("tiles") && objProcedure[this.selectedLanguage]["tiles"].length > 0) {
          currTiles = objProcedure[this.selectedLanguage]["tiles"];
        }
      } else {
        currTiles = objProcedure["tiles"];
      }
    }

    for (let i = currTiles.length - 1; 0 <= i; i--) {
      if (currTiles[i].hasOwnProperty("_id")) {
        this.draggedTiles.push(currTiles[i]["_id"]);
        this.assignDragged(currTiles[i]);
      }
    }
  };

  assignDragged(currTile: any) {
    var tileObj = !this.utils.isEmptyObject(currTile) && currTile.hasOwnProperty("tileData") ? currTile["tileData"] : {};
    var draggedTile = this.setDraggedTile(tileObj, currTile);

    if (this.procedure.hasOwnProperty("draggedTiles")) {
      this.procedure["draggedTiles"].push(draggedTile);
    } else {
      this.procedure["draggedTiles"] = [draggedTile];
    }
  };

  getCompareValues() {
    var proc = {};
    proc["_id"] = !this.utils.isEmptyObject(this.procedure) && this.procedure.hasOwnProperty("obj") && this.procedure["obj"].hasOwnProperty("_id") ? this.procedure["obj"]["_id"] : "-1";
    proc["name"] = this.procedureName;
    proc["category"] = this.procedureCategory;
    proc["type"] = 'procedure';
    proc["organizationId"] = this.oid;
    proc["isSquare"] = this.isSquare;
    proc["tiles"] = [];

    if (this.selectedLanguage !== "en") {
      var procedureObj = this.procedure.hasOwnProperty("obj") ? Object.assign({}, this.procedure["obj"]) : {};

      proc[this.selectedLanguage] = {};
      proc[this.selectedLanguage]["tiles"] = this.getDraggedTiles();

      proc["tiles"] = procedureObj.tiles;
    }

    if ((proc["_id"] === "-1" && this.selectedLanguage !== "en") || this.selectedLanguage == "en") {
      proc["tiles"] = this.getDraggedTiles();
    }

    if (this.utils.isNullOrEmpty(proc["name"].trim()) && this.procedureCategory === "-1" && proc["tiles"].length === 0) {
      return {};
    }

    return proc;
  };

  getDraggedTiles() {
    var currDraggedTiles = [];
    var drgTiles = this.procedure.hasOwnProperty("draggedTiles") && this.procedure["draggedTiles"].length > 0 ? this.procedure["draggedTiles"] : [];

    for (let i = drgTiles.length - 1; 0 <= i; i--) {
      var tile = {};
      var dragTileObj = drgTiles[i];

      tile["_id"] = !this.utils.isEmptyObject(dragTileObj["tile"]) && dragTileObj["tile"].hasOwnProperty("_id") ? dragTileObj["tile"]["_id"] : "-1";
      tile["title"] = !this.utils.isEmptyObject(dragTileObj["tile"]) && dragTileObj["tile"].hasOwnProperty("title") ? dragTileObj["tile"]["title"] : "";
      tile["permanent"] = dragTileObj["permanent"];

      if (!tile["permanent"]) {
        tile["triggerDays"] = dragTileObj["triggerDays"];
        tile["triggerDays"] = !this.utils.isNullOrEmpty(tile["triggerDays"]) ? tile["triggerDays"] : 0;
        tile["triggerActionOn"] = dragTileObj["triggerActionOn"];
        tile["expireInDays"] = dragTileObj["expireInDays"];
        tile["expireInDays"] = !this.utils.isNullOrEmpty(tile["expireInDays"]) ? tile["expireInDays"] : 0;
      }

      tile["imageUrl"] = dragTileObj["imageUrl"];
      tile["topSquare"] = dragTileObj["topSquare"];
      tile["wideSquare"] = tile["topSquare"];
      tile["orderFirst"] = dragTileObj["orderFirst"];
      tile["showName"] = dragTileObj["showName"];
      tile["reminder"] = dragTileObj["reminder"];
      tile["isHospital"] = dragTileObj["isHospital"];
      tile["notForPatient"] = dragTileObj["notForPatient"];
      tile["createDate"] = dragTileObj["createDate"];

      currDraggedTiles.push(tile);
    }

    return currDraggedTiles;
  };

  newProcedureCompare() {
    var id = this.procedure.hasOwnProperty("obj") && this.procedure["obj"].hasOwnProperty("_id") ? this.procedure["obj"]["_id"] : "-1";
    var currProcObj = this.getCompareValues();

    var obj1Sring = JSON.stringify(currProcObj);
    currProcObj = JSON.parse(this.utils.htmlDecode(obj1Sring));
    var obj1 = Object.assign({}, currProcObj);

    var obj2 = {};

    if (!this.utils.isEmptyObject(this.procedure) && this.procedure.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.procedure["obj"])) {
      var procObj = this.procedure["obj"];
      obj2 = Object.assign({}, procObj);
      var obj2Sring = JSON.stringify(obj2);
      obj2 = JSON.parse(this.utils.htmlDecode(obj2Sring));
      delete obj2['notification'];
      delete obj2['smart'];
      delete obj2['background_landscape'];
      delete obj2['background_portrait'];
      delete obj2['background'];
      delete obj2['createdBy'];
      delete obj2['dateCreated'];
      delete obj2['dateUpdated'];
      delete obj2['Apps'];
      delete obj2['isRoleBased'];

      if (!this.utils.isEmptyObject(obj2) && obj2.hasOwnProperty("tiles")) {
        obj2["tiles"] = this.removeCreatedDate(obj2["tiles"]);
      }
    }

    delete obj2['descFontColor'];
    delete obj2['timelineBackgroundColor'];
    delete obj2['timelineFontColor'];
    delete obj2['titleFontColor'];

    delete obj2['art'];
    delete obj2['background_landscape'];
    delete obj2['background_portrait'];
    delete obj2['background'];
    delete obj2['top_banner'];
    delete obj2['topBannerUrl'];
    delete obj2['scrollIconsUnder'];
    delete obj2['descFontColor'];
    delete obj2['timelineBackgroundColor'];
    delete obj2['timelineFontColor'];
    delete obj2['titleFontColor'];
    delete obj2['timeLine'];
    delete obj2['doubleWidthSquareDetails'];
    delete obj2['webBackground'];

    delete obj2['createdBy'];
    delete obj2['dateCreated'];
    delete obj2['dateUpdated'];
    delete obj1['Apps'];
    delete obj1['isRoleBased'];

    if (!this.utils.isEmptyObject(obj1) && obj1.hasOwnProperty("tiles")) {
      obj1["tiles"] = this.removeCreatedDate(obj1["tiles"]);
    }

    if (!this.utils.isEmptyObject(obj2) && obj2.hasOwnProperty("tiles")) {
      for (let i = 0; i < obj2["tiles"].length; i++) {
        var currTile = obj2["tiles"][i];

        delete currTile["tileData"];
      }
    }

    if (!this.utils.isEmptyObject(obj1) && obj1.hasOwnProperty("tiles")) {
      for (let i = 0; i < obj1["tiles"].length; i++) {
        var currTile = obj1["tiles"][i];

        delete currTile["tileData"];
      }
    }

    for (let i = 0; i < this.languageList.length; i++) {
      var langCode = this.languageList[i]["code"];

      if (langCode !== this.selectedLanguage) {
        delete obj1[langCode];
        delete obj2[langCode];
      } else {
        if (obj1.hasOwnProperty(langCode) && obj1[langCode].hasOwnProperty("tiles")) {
          obj1[langCode]["tiles"] = this.removeCreatedDate(obj1[langCode]["tiles"]);

          for (let k = 0; k < obj1[langCode]["tiles"].length; k++) {
            var langTile = obj1[langCode]["tiles"][k];

            if (langTile.hasOwnProperty("tileData")) {
              delete langTile["tileData"];
            }
          }
        }

        if (obj2.hasOwnProperty(langCode) && obj2[langCode].hasOwnProperty("tiles")) {
          obj2[langCode]["tiles"] = this.removeCreatedDate(obj2[langCode]["tiles"]);

          for (let j = 0; j < obj2[langCode]["tiles"].length; j++) {
            var langTile = obj2[langCode]["tiles"][j];

            if (langTile.hasOwnProperty("tileData")) {
              delete langTile["tileData"];
            }
          }
        }
      }
    }

    return this.utils.compareObj(obj1, obj2);
  };

  checkNew(message: string, cb: any) {
    var isModified = this.newProcedureCompare();

    if (!isModified) {
      var r = confirm(message);
      cb(r);
    } else {
      cb(false);
    }
  };

  removeCreatedDate(currTiles: any[]) {
    if (currTiles.length > 0) {
      for (let i = 0; i < currTiles.length; i++) {
        delete currTiles[i]["createDate"];
        delete currTiles[i]["isPushed"];
        delete currTiles[i]["pusheddatetime"];
      }
    }

    return currTiles;
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  /* Adding Dynamic draggable */
  addDraggable(idx: number) {
    var dragged = { "uniqueId": this.getUniqueId(), "procedureDragContainer": true };
    var totalIdx = this.procedure["draggedTiles"].length - 1;

    if (this.dragIndex === -1) {
      this.dragIndex = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
      this.procedure["draggedTiles"].splice(this.dragIndex, 0, dragged);
    } else if (this.dragIndex > -1) {
      var fromIdx = this.dragIndex;
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.procedure["draggedTiles"], fromIdx, toIdx);
        var move = this.procedure["draggedTiles"];
        //this.dragIndex = toIdx;
      }
    }
  };

  /* Adding a duplicated dragged tile */
  replicateTile(obj: any) {
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile") ? obj["tile"] : {};
    var replicatedTile = this.setDraggedTile(replicateTile);
    this.procedure["draggedTiles"].push(replicatedTile);
  };

  /* Moving dragged tiles up and down */
  moveUpDown(move: string, idx: number) {
    var totalIdx = this.procedure["draggedTiles"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.procedure["draggedTiles"], fromIdx, toIdx);
  };

  /* Deleting current dragged tile */
  deleteDraggedTile(idx: number) {
    this.droppedTile = {};
    var totalIdx = this.procedure["draggedTiles"].length - 1;
    var currIdx = totalIdx - idx;

    var tile = this.procedure["draggedTiles"][currIdx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.procedure["draggedTiles"].splice(currIdx, 1);
  };

  /* New Procedure */
  newProcedure(e: any) {
    e.preventDefault();

    this.checkNew('Would you like to save your previous work?', (r) => {
      if (r) {
        this.saveProcedure("", false, false, "new");
      } else {
        this.resetProcedure("reset");
      }
    });
  };

  /* Save Procedure */
  saveProcedure(e: any, showMessage?: boolean, isDuplicate?: boolean, isAnother?: string, procCurrObj?: Object) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    var procedureObj = {};
    var id = this.procedure.hasOwnProperty("obj") && this.procedure["obj"].hasOwnProperty("_id") ? this.procedure["obj"]["_id"] : "-1";
    procedureObj = this.getProcedureObj(id);


    if (this.utils.isNullOrEmpty(procedureObj["name"])) {
      alert('You must at least enter an Procedure name');
      return false;
    } else if (isDuplicate) {
      procedureObj["name"] = "Copy of " + procedureObj["name"];
      delete procedureObj["_id"];
    }

    if (this.procedureCategory === "-1") {
      alert('Please select a type for the Procedure');
      return false;
    }

    if (this.selectedLanguage !== "en") {
      var procObj = this.procedure.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.procedure["obj"]) ? this.procedure["obj"] : {};

      procedureObj[this.selectedLanguage] = {};
      procedureObj[this.selectedLanguage]["tiles"] = this.getDraggedTiles();
    }

    if ((id === "-1" && this.selectedLanguage !== "en") || this.selectedLanguage == "en") {
      procedureObj["tiles"] = this.getDraggedTiles();
    }

    if (procedureObj.hasOwnProperty("tiles") && procedureObj["tiles"].length > 0) {
      var procTileResult = this.manageProcedure(procedureObj["tiles"]);

      if (!procTileResult) {
        return procTileResult;
      }
    }

    this.save(procedureObj, showMessage, isDuplicate, isAnother, procCurrObj);
  };

  save(procObj: Object, showMessage?: boolean, isDuplicate?: boolean, isAnother?: string, procCurrObj?: Object) {
    var self = this;

    this.procedureService.saveProcedure(procObj)
      .then(procResObj => {
        var isNew = procObj.hasOwnProperty("_id") && !self.utils.isNullOrEmpty(procObj["_id"]) ? false : true;

        if (showMessage) {
          var alertMessage = isNew ? "Procedure Created" : "Procedure Updated";
          alertMessage = isDuplicate ? "Duplicate Procedure Created" : alertMessage;
          alert(alertMessage);
        }

        procObj = self.assignCategoryName(procObj);

        if (!isNew) {
          var procIndex = this.procedures.map(function (procCat) { return procCat['_id']; }).indexOf(procObj["_id"]);

          if (procIndex !== -1) {
            this.procedures[procIndex] = procObj;
          }
        } else if (procResObj.hasOwnProperty("_id") && !self.utils.isNullOrEmpty(procResObj["_id"])) {
          procObj["_id"] = procResObj["_id"];
          this.procedures.push(procObj);
        }

        if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "select") {
          this.setProcedureData(true, procCurrObj);
        } else if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "new") {
          this.resetProcedure("reset");
        } else if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "language") {
          this.setProcedureData(true, procObj, procCurrObj["langId"]);
        } else {
          var isSelect = isDuplicate ? true : false;
          this.setProcedureData(isSelect, procObj);
        }
      });
  };

  manageProcedure(currTiles) {
    var assignedTiles = {};
    var result = true;

    for (let i = 0; i < currTiles.length; i++) {
      var curTile = currTiles[i];

      if (assignedTiles[curTile["_id"]]) {
        if ((assignedTiles[curTile["_id"]]["type"] === "permanent") || (curTile.hasOwnProperty("permanent") && curTile["permanent"])) {
          alert('Same tile cannot be assigned after it is assigned to permanent');
          result = false;
          return result;
        } else if (assignedTiles[curTile["_id"]]["type"] === curTile["triggerActionOn"] && assignedTiles[curTile["_id"]]["days"] === curTile["triggerDays"]) {
          alert('Same Tile cannot be assigned with same days and with same trigger');
          result = false;
          return result;
        } else {
          assignedTiles = this.procAssignTile(assignedTiles, curTile);
        }
      } else {
        assignedTiles = this.procAssignTile(assignedTiles, curTile);
      }
    }

    return result;
  };

  procAssignTile(assignedTiles: Object, tileObj: Object) {
    assignedTiles[tileObj["_id"]] = {}
    assignedTiles[tileObj["_id"]]["type"] = tileObj["permanent"] ? "permanent" : tileObj["triggerActionOn"];

    if (assignedTiles[tileObj["_id"]]["type"] === "permanent") {
      assignedTiles[tileObj["_id"]]["days"] = 0;
    } else {
      assignedTiles[tileObj["_id"]]["days"] = tileObj["triggerDays"];
    }

    return assignedTiles;
  };

  getProcedureObj(procId: string) {
    var proc = {};
    var exitsProcObj = this.procedure.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.procedure["obj"]) ? this.procedure["obj"] : {};

    if (procId !== "-1") {
      proc["_id"] = procId;

      if (exitsProcObj.hasOwnProperty("notification")) {
        proc["notification"] = exitsProcObj["notification"];
      }

      if (exitsProcObj.hasOwnProperty("smart")) {
        proc["smart"] = exitsProcObj["smart"];
      }
    }

    proc["name"] = this.procedureName;
    proc["category"] = this.procedureCategory;
    proc["type"] = 'procedure';
    proc["organizationId"] = this.oid;
    proc["dateCreated"] = procId !== "-1" && exitsProcObj.hasOwnProperty("dateCreated") ? exitsProcObj["dateCreated"] : (new Date()).toUTCString();
    proc["dateUpdated"] = (new Date()).toUTCString();
    proc["background_landscape"] = procId !== "-1" && exitsProcObj.hasOwnProperty("background_landscape") ? exitsProcObj["background_landscape"] : "";
    proc["background_portrait"] = procId !== "-1" && exitsProcObj.hasOwnProperty("background_portrait") ? exitsProcObj["background_portrait"] : "";
    proc["background"] = procId !== "-1" && exitsProcObj.hasOwnProperty("background") ? exitsProcObj["background"] : "";
    proc["timelineBackgroundColor"] = procId !== "-1" && exitsProcObj.hasOwnProperty("timelineBackgroundColor") ? exitsProcObj["timelineBackgroundColor"] : "";
    proc["timelineFontColor"] = procId !== "-1" && exitsProcObj.hasOwnProperty("timelineFontColor") ? exitsProcObj["timelineFontColor"] : "";
    proc["titleFontColor"] = procId !== "-1" && exitsProcObj.hasOwnProperty("titleFontColor") ? exitsProcObj["titleFontColor"] : "";
    proc["descFontColor"] = procId !== "-1" && exitsProcObj.hasOwnProperty("descFontColor") ? exitsProcObj["descFontColor"] : "";
    proc["isSquare"] = this.isSquare;

    return proc;
  };

  /* Duplicate Procedure */
  duplicateProcedure(e: any) {
    e.preventDefault();

    if (this.procedure.hasOwnProperty("obj") && this.procedure["obj"].hasOwnProperty("_id")) {
      this.saveProcedure("", true, true);
    } else {
      alert("Procedure not selected");
    }
  };

  /* Delete Procedure */
  deleteProcedure(e: any) {
    e.preventDefault();

    if (this.procedure.hasOwnProperty("obj") && this.procedure["obj"].hasOwnProperty("_id")) {
      var r = confirm("Are you sure want to delete this Procedure?");

      if (r) {
        var procId = this.procedure["obj"]["_id"];

        this.procedureService.removeProcedure(procId).then(deleteRes => {
          if (!this.utils.isEmptyObject(deleteRes) && deleteRes.hasOwnProperty("deleted") && deleteRes["deleted"]) {
            var procIndex = this.procedures.map(function (procCat) { return procCat['_id']; }).indexOf(procId);
            this.procedures.splice(procIndex, 1);

            this.resetProcedure("reset");
            alert("Procedure Removed");
          }
        });
      }
    } else {
      alert("Procedure not selected");
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.setScrollList();
      this.resetProcedureDatas();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
      this.listProcedureCategories();
      this.getLanguages();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
