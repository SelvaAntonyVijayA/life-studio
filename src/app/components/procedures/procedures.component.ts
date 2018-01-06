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
    dragged["createDate"] = (new Date()).toUTCString();

    return dragged;
  };

  getTileContent(tileObj: any) {

  };

  languageChange(langId: string) {
    this.selectedLanguage = langId;
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
    if (this.dragIndex !== -1 && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("eventDragContainer")) {
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
    this.procedureService.procedureCategoriesList(this.oid).subscribe(listProcCat => {
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

  /* Select Procedure */
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

      } else {
        this.setProcedureData(true, obj);
      }
    });

    this.procedure["obj"] = obj;
  };

  setProcedureData(isSelect: boolean, obj: any) {
    if (isSelect) {
      this.resetProcedure();

      if (obj && obj.hasOwnProperty("tiles")) {
        for (let i = 0; i < obj.tiles.length; i++) {
          this.draggedTiles.push(obj.tiles[i]["_id"]);
        }
      }
    }

    this.procedureService.getEventByTiles(obj._id)
      .then(proObj => {
        if (proObj && proObj[0]) {
          this.assignProcedureDatas(proObj[0]);
        }
      });
  };

  assignProcedureDatas(objProcedure: Object) {
    this.procedure["obj"] = objProcedure;
    this.draggedTiles = [];

    if (!this.utils.isEmptyObject(objProcedure)) {
      this.procedureName = objProcedure.hasOwnProperty("name") ? objProcedure["name"] : "";
      this.procedureCategory = objProcedure.hasOwnProperty("category") ? objProcedure["category"] : "";
      this.isSquare = objProcedure.hasOwnProperty("isSquare") ? objProcedure["isSquare"] : false;
    }

    this.selectedLanguage = "en";

    if (objProcedure.hasOwnProperty("tiles") && objProcedure["tiles"].length > 0) {
      var currTiles = objProcedure["tiles"];

      for (let i = currTiles.length - 1; 0 <= i; i--) {
        if (currTiles[i].hasOwnProperty("_id")) {
          this.draggedTiles.push(currTiles[i]["_id"]);
          this.assignDragged(currTiles[i]);
        }
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
    var procedure = {};

    procedure["_id"] = !this.utils.isEmptyObject(this.procedure) && this.procedure.hasOwnProperty("obj") && this.procedure["obj"].hasOwnProperty("_id") ? this.procedure["obj"]["_id"] : "-1";
    procedure["name"] = this.procedureName;
    procedure["category"] = this.procedureCategory;
    procedure["type"] = 'procedure';
    procedure["organizationId"] = this.oid;
    procedure["isSquare"] = this.isSquare;
    procedure["tiles"] = [];

    if (this.selectedLanguage !== "en") {
      var procedureObj = this.selectedLanguage["obj"];

      procedure[this.selectedLanguage] = procedureObj[this.selectedLanguage] ? procedureObj[this.selectedLanguage] : {};
      procedure[this.selectedLanguage]["tiles"] = this.getDraggedTiles();

      procedure["tiles"] = procedureObj.tiles;
    }

    if ((procedure["_id"] === "-1" && this.selectedLanguage !== "en") || this.selectedLanguage == "en") {
      procedure["tiles"] = this.getDraggedTiles();
    }

    if (this.utils.isNullOrEmpty(procedure["name"].trim()) && this.procedureCategory === "-1" && procedure["tiles"].length === 0) {
      return {};
    }

    return procedure;
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

      tile["name"] = dragTileObj["name"];
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
    var obj1 = this.getCompareValues();

    var obj1Sring = JSON.stringify(obj1);
    obj1 = JSON.parse(this.utils.htmlDecode(obj1Sring));

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
      obj2["tiles"] = this.removeCreatedDate(obj2["tiles"]);
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
    obj1["tiles"] = this.removeCreatedDate(obj1["tiles"]);

    for (let i = 0; i < this.languageList.length; i++) {
      var langCode = this.languageList[i]["code"];

      if (langCode !== this.selectedLanguage) {
        delete obj1[langCode];
        delete obj2[langCode];
      } else {
        if (obj1[langCode] && obj1[langCode]["tiles"]) {
          obj1[langCode]["tiles"] = this.removeCreatedDate(obj1[langCode]["tiles"]);
        }

        if (obj2[langCode] && obj2[langCode]["tiles"]) {
          obj2[langCode]["tiles"] = this.removeCreatedDate(obj2[langCode]["tiles"]);
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

  removeCreatedDate = function (currTiles: any[]) {
    if (currTiles.length > 0) {
      for (let i = 0; i < currTiles.length; i++) {
        delete currTiles[i]["createDate"];
        delete currTiles[i]["isPushed"];
        delete currTiles[i]["pusheddatetime"];
      }
    }
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

  /* New Folder */
  newProcedure(e: any) {
    e.preventDefault();
    this.resetProcedure("reset");
  };

  /* Save Procedure */
  saveProcedure(e: any, showMessage?: boolean) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

  };

  /* Duplicate Procedure */
  duplicateProcedure(e: any) {
    e.preventDefault();
  };

  /* Delete Procedure */
  deleteProcedure(e: any) {
    e.preventDefault();
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
}
