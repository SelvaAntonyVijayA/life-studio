import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { ProcedureService } from '../../services/procedure.service';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css']
})
export class ProcessesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private procedureService: ProcedureService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private tileService: TileService,
    private renderer: Renderer,
    private loaderShared: LoaderSharedService,
    public utils: Utils) {
  }

  organizations: any[] = [];
  private orgChangeDetect: any;
  oid: string = "";
  draggedTiles: any[] = [];
  tileDropped: Object = {};
  tilesToUpdate: any[] = [];
  isMerge: Object = {};
  droppedTile: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  processFilter: Object = {
    "processSearch": "",
    "processCategory": { "_id": "-1", "fieldName": "category" },
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"],
        "type": ["categoryName"]
      }
    },
  };

  processes: any[] = [];
  process: any = {};
  dragIndex: number = -1;
  languageList: any[] = [];
  selectedLanguage: string = "en";
  processCategories: any[] = [];
  processName: string = "";
  processCategory: string = "-1";
  isSquare: boolean = false;

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    //this.destroyScroll();

    this.mScrollbarService.initScrollbar('#dragged-process-tiles', this.scrollbarOptions);
    this.mScrollbarService.initScrollbar('#main-container-processes', this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#dragged-process-tiles");
      this.cms["appDatas"]["scrollList"].push("#main-container-processes");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#dragged-process-tiles", "#main-container-processes"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#dragged-process-tiles", "#main-container-processes"]);
  };

  resetProcessDatas() {
    this.resetSort();
    this.resetProcess();
    this.processes = [];
    this.languageList = [];
    this.processCategories = [];
    this.oid = "";
  };

  resetSort() {
    this.processFilter["processSearch"] = ""
    this.processFilter["processCategory"]["_id"] = "-1";
    this.processFilter["sort"]["selected"] = "date_desc";
    this.processFilter["sort"]["isAsc"] = false;
  };

  resetProcess(mergeReset?: string, isSpinner?: boolean) {
    this.dragIndex = -1;
    this.droppedTile = {};
    this.isMerge = {};
    this.tilesToUpdate = [];
    this.draggedTiles = [];
    this.selectedLanguage = "en";
    this.process = {};
    this.processCategory = "-1";
    this.isSquare = false;
    this.processName = "";

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }

    if (isSpinner) {
      this.loaderShared.showSpinner(true);
    }
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  getTileContent(obj: any) {
    if (!this.utils.isEmptyObject(obj) && obj.hasOwnProperty("isSpinner")) {
      this.loaderShared.showSpinner(false);
    }
  };

  /* Setting Drag Index for every tile index change */
  setDragIndex(idx: number, obj: any) {
    if (this.dragIndex !== -1 && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("processDragContainer")) {
      var totalIdx = this.process["draggedTiles"].length - 1;

      this.dragIndex = !idx ? -1 : totalIdx - idx;
    }
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  /* Filter Changing */
  filterChange(val: any, fieldName: string) {
    if (fieldName === "processCategory") {
      this.processFilter[fieldName]["_id"] = val;
    }

    if (fieldName === "sort") {
      var sortOpt = val.split("_");
      this.processFilter[fieldName]["selected"] = val;
      this.processFilter[fieldName]["isAsc"] = sortOpt[1] === "asc" ? true : false;
    }
  };

  /* Fetching both processes and process categories */
  listProcessCategories() {
    this.procedureService.procedureCategoriesList(this.oid, "process").subscribe(listProcCat => {
      this.processes = listProcCat[0];
      this.processCategories = listProcCat[1];
      this.mergeCategoryName();
    });
  };

  /* Getting current process object to assign category name */
  mergeCategoryName() {
    for (let i = 0; i < this.processes.length; i++) {
      this.processes[i] = this.assignCategoryName(this.processes[i]);
    }
  };

  /* Assigning category name to the process object */
  assignCategoryName(processObj: any) {
    var procCatId = processObj.hasOwnProperty("category") ? processObj["category"] : "-1";
    var index = -1;

    if (procCatId !== "-1" && this.processCategories.length > 0) {
      index = this.processCategories.map(procCat => { return procCat['_id']; }).indexOf(procCatId);
    }

    processObj["categoryName"] = index !== -1 && this.processCategories[index].hasOwnProperty("name") ? this.processCategories[index]["name"] : "";

    return processObj;
  };

  languageChange(langId: string) {
    this.loaderShared.showSpinner(true);

    this.checkNew('Would you like to save your previous work?', (isChanged) => {
      if (isChanged) {
        this.saveProcess("", false, false, "language", { "langId": langId });
      } else {
        this.selectedLanguage = langId;
        this.setLanguageData(true);
      }
    });
  };

  setLanguageData(isSpinner?: boolean) {
    var procObj = this.process.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.process["obj"]) ? this.process["obj"] : {};
    var langTiles = [];

    if (!this.utils.isNullOrEmpty(procObj) && procObj.hasOwnProperty(this.selectedLanguage)) {
      if (procObj[this.selectedLanguage].hasOwnProperty("tiles") && procObj[this.selectedLanguage]["tiles"].length > 0) {
        langTiles = procObj[this.selectedLanguage]["tiles"];
      }
    } else if ((this.selectedLanguage === "en" || !procObj.hasOwnProperty(this.selectedLanguage)) && (procObj.hasOwnProperty("tiles") && procObj["tiles"].length > 0)) {
      langTiles = procObj["tiles"];
    }

    if (langTiles.length > 0 || this.selectedLanguage === "en" || procObj.hasOwnProperty(this.selectedLanguage)) {
      this.draggedTiles = [];
      this.process["draggedTiles"] = [];
    }

    for (let i = langTiles.length - 1; 0 <= i; i--) {
      if (langTiles[i].hasOwnProperty("_id")) {
        this.draggedTiles.push(langTiles[i]["_id"]);
        this.assignDragged(langTiles[i]);
      }
    }

    if (isSpinner) {
      this.loaderShared.showSpinner(false);
    }
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

  getLanguages() {
    if (this.languageList.length === 0) {
      this.tileService.getLanguages()
        .then(langs => {
          this.languageList = langs;
        });
    }
  };

  /* Selecting the current process in the DOM*/
  selectProcess(e: any, obj: any) {
    e.preventDefault();
    e.stopPropagation();
    var self = this;

    var procExist = false;
    this.loaderShared.showSpinner(true);

    if (!this.utils.isEmptyObject(this.process) && this.process.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.process["obj"])) {
      if (this.process["obj"].hasOwnProperty("_id") && !this.utils.isNullOrEmpty(this.process["obj"]["_id"])) {
        procExist = this.process["obj"]["_id"] === obj["_id"] ? true : false;
      }
    }

    this.checkNew('Would you like to save your previous work?', (r) => {
      if (r) {
        this.saveProcess("", false, false, "select", obj);
      } else {
        this.setProcessData(true, obj, "", true);
      }
    });
  };

  /*Process Notification Icon Check Conditions */
  processNotificationIcon(proc: any) {
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

  /* Adding Dynamic draggable */
  addDraggable(idx: number) {
    var dragged = { "uniqueId": this.getUniqueId(), "processDragContainer": true };
    var totalIdx = this.process["draggedTiles"].length - 1;

    if (this.dragIndex === -1) {
      this.dragIndex = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
      this.process["draggedTiles"].splice(this.dragIndex, 0, dragged);
    } else if (this.dragIndex > -1) {
      var fromIdx = this.dragIndex;
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.process["draggedTiles"], fromIdx, toIdx);
        var move = this.process["draggedTiles"];
        //this.dragIndex = toIdx;
      }
    }
  };

  /* Adding a duplicated dragged tile */
  replicateTile(obj: any) {
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile") ? obj["tile"] : {};
    var replicatedTile = this.setDraggedTile(replicateTile);
    this.process["draggedTiles"].push(replicatedTile);
  };

  /* Moving dragged tiles up and down */
  moveUpDown(move: string, idx: number) {
    var totalIdx = this.process["draggedTiles"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.process["draggedTiles"], fromIdx, toIdx);
  };

  /* Deleting current dragged tile */
  deleteDraggedTile(idx: number) {
    this.droppedTile = {};
    var totalIdx = this.process["draggedTiles"].length - 1;
    var currIdx = totalIdx - idx;

    var tile = this.process["draggedTiles"][currIdx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.process["draggedTiles"].splice(currIdx, 1);
  };

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
  onDrop(currTile, isDynamic) {
    var draggedTile = this.setDraggedTile(currTile);

    if (this.process.hasOwnProperty("draggedTiles")) {
      if (this.dragIndex === -1) {
        this.process["draggedTiles"].push(draggedTile);
      } else {
        var currIdx = this.dragIndex;

        if (!isDynamic) {
          this.process["draggedTiles"].splice(currIdx, 1);
        } else {
          this.process["draggedTiles"][currIdx] = draggedTile;
        }

        this.dragIndex = -1;
      }
    } else {
      this.process["draggedTiles"] = [draggedTile];
    }

    this.droppedTile = currTile;
  };

  /* New Procedure */
  newProcess(e: any) {
    e.preventDefault();

    this.checkNew('Would you like to save your previous work?', (r) => {
      if (r) {
        this.saveProcess("", false, false, "new");
      } else {
        this.resetProcess("reset");
      }
    });
  };

  checkNew(message: string, cb: any) {
    var isModified = this.newProcessCompare();

    if (!isModified) {
      this.utils.iAlertConfirm("confirm", "Confirm", message, "Save", "Cancel", (r) => {
        cb(r["resolved"]);
      });
    } else {
      cb(false);
    }
  };

  getDraggedTiles() {
    var currDraggedTiles = [];
    var drgTiles = this.process.hasOwnProperty("draggedTiles") && this.process["draggedTiles"].length > 0 ? this.process["draggedTiles"] : [];

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

  getCompareValues() {
    var proc = {};
    proc["_id"] = !this.utils.isEmptyObject(this.process) && this.process.hasOwnProperty("obj") && this.process["obj"].hasOwnProperty("_id") ? this.process["obj"]["_id"] : "-1";
    proc["name"] = this.processName;
    proc["category"] = this.processCategory;
    proc["type"] = 'process';
    proc["organizationId"] = this.oid;
    proc["isSquare"] = this.isSquare;
    proc["tiles"] = [];;

    if (this.selectedLanguage !== "en") {
      var procedureObj = this.process.hasOwnProperty("obj") ? Object.assign({}, this.process["obj"]) : {};

      proc[this.selectedLanguage] = {};
      proc[this.selectedLanguage]["tiles"] = this.getDraggedTiles();

      proc["tiles"] = procedureObj.tiles;
    }

    if ((proc["_id"] === "-1" && this.selectedLanguage !== "en") || this.selectedLanguage == "en") {
      proc["tiles"] = this.getDraggedTiles();
    }

    if (this.utils.isNullOrEmpty(proc["name"].trim()) && this.processCategory === "-1" && proc["tiles"].length === 0) {
      return {};
    }

    return proc;
  };

  newProcessCompare() {
    var id = this.process.hasOwnProperty("obj") && this.process["obj"].hasOwnProperty("_id") ? this.process["obj"]["_id"] : "-1";
    var currProcObj = this.getCompareValues();

    var obj1Sring = JSON.stringify(currProcObj);
    currProcObj = JSON.parse(this.utils.htmlDecode(obj1Sring));
    var obj1 = Object.assign({}, currProcObj);

    var obj2 = {};

    if (!this.utils.isEmptyObject(this.process) && this.process.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.process["obj"])) {
      var procObj = this.process["obj"];
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

  /* Save Procedure */
  saveProcess(e: any, showMessage?: boolean, isDuplicate?: boolean, isAnother?: string, procCurrObj?: Object) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    var processObj = {};
    this.loaderShared.showSpinner(true);
    var id = this.process.hasOwnProperty("obj") && this.process["obj"].hasOwnProperty("_id") ? this.process["obj"]["_id"] : "-1";
    processObj = this.getProcessObj(id);


    if (this.utils.isNullOrEmpty(processObj["name"])) {
      this.utils.iAlert('error', 'Information', 'You must at least enter an Process name');
      this.loaderShared.showSpinner(false);
      return false;
    } else if (isDuplicate) {
      processObj["name"] = "Copy of " + processObj["name"];
      delete processObj["_id"];
    }

    if (this.processCategory === "-1") {
      this.utils.iAlert('error', 'Information', 'Please select a type for the Process');
      this.loaderShared.showSpinner(false);
      return false;
    }

    if (this.selectedLanguage !== "en") {
      //var procObj = this.process.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.process["obj"]) ? this.process["obj"] : {};

      processObj[this.selectedLanguage] = {};
      processObj[this.selectedLanguage]["tiles"] = this.getDraggedTiles();
    }

    if ((id === "-1" && this.selectedLanguage !== "en") || this.selectedLanguage == "en") {
      processObj["tiles"] = this.getDraggedTiles();
    }

    if (processObj.hasOwnProperty("tiles") && processObj["tiles"].length > 0) {
      var procTileResult = this.manageProcess(processObj["tiles"]);

      if (!procTileResult) {
        return procTileResult;
      }
    }

    this.save(processObj, showMessage, isDuplicate, isAnother, procCurrObj);
  };

  save(procObj: Object, showMessage?: boolean, isDuplicate?: boolean, isAnother?: string, procCurrObj?: Object) {
    var self = this;

    this.procedureService.saveProcedure(procObj)
      .then(procResObj => {
        var isNew = procObj.hasOwnProperty("_id") && !self.utils.isNullOrEmpty(procObj["_id"]) ? false : true;

        if (showMessage) {
          var alertMessage = isNew ? "Process Created" : "Process Updated";
          alertMessage = isDuplicate ? "Duplicate Process Created" : alertMessage;
          this.loaderShared.showSpinner(false);
          this.utils.iAlert('success', '', alertMessage);
        }

        procObj = this.assignCategoryName(procObj);

        if (!isNew) {
          var procIndex = this.processes.map(procCat => { return procCat['_id']; }).indexOf(procObj["_id"]);

          if (procIndex !== -1) {
            this.processes[procIndex] = procObj;
          }
        } else if (procResObj.hasOwnProperty("_id") && !self.utils.isNullOrEmpty(procResObj["_id"])) {
          procObj["_id"] = procResObj["_id"];
          this.processes.push(procObj);
        }

        if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "select") {
          this.setProcessData(true, procCurrObj, "", true);
        } else if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "new") {
          this.resetProcess("reset", true);
        } else if (!this.utils.isNullOrEmpty(isAnother) && isAnother === "language") {
          this.setProcessData(true, procObj, procCurrObj["langId"], true);
        } else {
          var isSelect = isDuplicate ? true : false;
          this.setProcessData(isSelect, procObj, "", true);
        }
      });
  };


  /* Setting the procedure data for the DOM */
  setProcessData(isSelect: boolean, obj: any, langId?: string, isSpinner?: boolean) {
    if (isSelect) {
      this.resetProcess();

      if (obj && obj.hasOwnProperty("tiles")) {
        for (let i = 0; i < obj.tiles.length; i++) {
          this.draggedTiles.push(obj.tiles[i]["_id"]);
        }
      }
    }

    this.procedureService.getProcedureByTiles(obj._id)
      .then(proObj => {
        if (proObj && proObj[0]) {
          this.assignProcessDatas(proObj[0], langId);
        }

        if (isSpinner) {
          this.loaderShared.showSpinner(false);
        }
      });
  };

  assignProcessDatas(objProcess: Object, langId?: string) {
    this.process["obj"] = objProcess;

    if (!this.utils.isEmptyObject(objProcess)) {
      this.processName = objProcess.hasOwnProperty("name") ? objProcess["name"] : "";
      this.processCategory = objProcess.hasOwnProperty("category") ? objProcess["category"] : "";
      this.isSquare = objProcess.hasOwnProperty("isSquare") ? objProcess["isSquare"] : false;
    }

    if (!this.utils.isNullOrEmpty(langId)) {
      this.selectedLanguage = langId;
    } else if (this.utils.isNullOrEmpty(this.selectedLanguage)) {
      this.selectedLanguage = "en";
    }

    this.process["draggedTiles"] = [];
    var currTiles = []

    if (objProcess.hasOwnProperty("tiles") && objProcess["tiles"].length > 0 && this.selectedLanguage === "en") {
      currTiles = objProcess["tiles"];
    } else if (!this.utils.isNullOrEmpty(this.selectedLanguage)) {
      if (!this.utils.isEmptyObject(objProcess) && objProcess.hasOwnProperty(this.selectedLanguage)) {
        if (objProcess[this.selectedLanguage].hasOwnProperty("tiles") && objProcess[this.selectedLanguage]["tiles"].length > 0) {
          currTiles = objProcess[this.selectedLanguage]["tiles"];
        }
      } else {
        currTiles = objProcess["tiles"];
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

    if (this.process.hasOwnProperty("draggedTiles")) {
      this.process["draggedTiles"].push(draggedTile);
    } else {
      this.process["draggedTiles"] = [draggedTile];
    }
  };

  manageProcess(currTiles) {
    var assignedTiles = {};
    var result = true;

    for (let i = 0; i < currTiles.length; i++) {
      var curTile = currTiles[i];

      if (assignedTiles[curTile["_id"]]) {
        if ((assignedTiles[curTile["_id"]]["type"] === "permanent") || (curTile.hasOwnProperty("permanent") && curTile["permanent"])) {
          this.utils.iAlert('error', 'Information', 'Same tile cannot be assigned after it is assigned to permanent');
          result = false;
          return result;
        } else if (assignedTiles[curTile["_id"]]["type"] === curTile["triggerActionOn"] && assignedTiles[curTile["_id"]]["days"] === curTile["triggerDays"]) {
          this.utils.iAlert('error', 'Information', 'Same Tile cannot be assigned with same days and with same trigger');
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

  getProcessObj(procId: string) {
    var proc = {};
    var exitsProcObj = this.process.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.process["obj"]) ? this.process["obj"] : {};

    if (procId !== "-1") {
      proc["_id"] = procId;

      if (exitsProcObj.hasOwnProperty("notification")) {
        proc["notification"] = exitsProcObj["notification"];
      }

      if (exitsProcObj.hasOwnProperty("smart")) {
        proc["smart"] = exitsProcObj["smart"];
      }
    }

    proc["name"] = this.processName;
    proc["category"] = this.processCategory;
    proc["type"] = 'process';
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

  /* Duplicate Process */
  duplicateProcess(e: any) {
    e.preventDefault();
    this.loaderShared.showSpinner(true);

    if (this.process.hasOwnProperty("obj") && this.process["obj"].hasOwnProperty("_id")) {
      this.saveProcess("", true, true);
    } else {
      this.loaderShared.showSpinner(false);
      this.utils.iAlert('error', 'Information', 'Process not selected');
    }
  };

  /* Delete Process */
  deleteProcess(e: any) {
    e.preventDefault();
    this.loaderShared.showSpinner(true);

    if (this.process.hasOwnProperty("obj") && this.process["obj"].hasOwnProperty("_id")) {
      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Process?", "Delete", "Cancel", (r) => {
        if (r["resolved"]) {
          var procId = this.process["obj"]["_id"];

          this.procedureService.removeProcedure(procId).then(deleteRes => {
            if (!this.utils.isEmptyObject(deleteRes) && deleteRes.hasOwnProperty("deleted")) {
              var procIndex = this.processes.map(procCat => { return procCat['_id']; }).indexOf(procId);
              this.processes.splice(procIndex, 1);

              this.resetProcess("reset");
              this.utils.iAlert('success', '', 'Process Removed');
            }

            this.loaderShared.showSpinner(false);
          });
        } else {
          this.loaderShared.showSpinner(false);
        }
      });
    } else {
      this.loaderShared.showSpinner(false);
      this.utils.iAlert('error', 'Information', 'Process not selected');
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.setScrollList();
        this.resetProcessDatas();
        this.setOrganizations();
        this.oid = Cookie.get('oid');
        this.listProcessCategories();
        this.getLanguages();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
