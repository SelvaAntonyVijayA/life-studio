import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { FolderService } from '../../services/folder.service';
import { Utils } from '../../helpers/utils';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.css']
})
export class FoldersComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private folderService: FolderService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils) {
  }

  private orgChangeDetect: any;
  organizations: any[] = [];
  oid: string = "";
  draggedTiles: any[] = [];
  tileDropped: Object = {};
  tilesToUpdate: any[] = [];
  isMerge: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  droppedTile: Object = {};
  folders: any[] = [];
  groupType: string = "list";
  folder: Object = {};
  folderFilter: Object = {
    "folderSearch": "",
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"]
      }
    }
  };
  dragIndex: number = -1;
  availableStart: any = "";
  availableEnd: any = "";
  folderName: string = "";
  art: string = "";

  /* Setting for default dragged tile */
  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(), "tile": {}, "showName": false
    };

    if (tile && !this.utils.isEmptyObject(tile)) {
      dragged["tile"] = this.getCurrentTileObj(tile);
    }

    return dragged;
  };

  /* Set selected dragged tile */
  setSelectedDraggedTile(dragTile: any) {
    var currTile = {};

    if (!this.utils.isEmptyObject(dragTile) && dragTile.hasOwnProperty("tileData")) {
      currTile = this.getCurrentTileObj(dragTile["tileData"]);
    }

    var dragged = {
      "uniqueId": this.getUniqueId(),
      "tile": currTile,
      "showName": !this.utils.isEmptyObject(dragTile) && dragTile.hasOwnProperty("showName") ? dragTile["showName"] : false
    };

    return dragged;
  };

  getCurrentTileObj(tile: Object) {
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

    return currTile;
  };


  getTileContent(tileObj: any) {
    /* if (tileObj.hasOwnProperty("draggedTiles")) {
      this.setDraggedTiles(tileObj["draggedTiles"]);
    } */
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
  };

  /* Filter Changing */
  filterChange(val: any) {
    var sortOpt = val.split("_");
    this.folderFilter["sort"]["selected"] = val;
    this.folderFilter["sort"]["isAsc"] = sortOpt[1] === "asc" ? true : false;
  };

  /* Track by index */
  trackByIndex(index: number, obj: any): any {
    return index;
  };

  /* Dragged tile by uniqueId */
  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };

  /*Folder Notification Icon Check Conditions */
  folderNotificationIcon(fold: any) {
    if (fold && fold.hasOwnProperty("notification") && fold.notification.hasOwnProperty("apps") && fold.notification.apps.length > 0) {
      for (let i = 0; i < fold.notification.apps.length; i++) {
        fold["tileNotifications"] = i === 0 ? fold.notification.apps[i]["name"] : ", " + fold.notification.apps[i]["name"];
      }
    }

    if (fold && fold.hasOwnProperty("Apps") && fold.Apps.length > 0) {
      for (let i = 0; i < fold.Apps.length; i++) {
        fold["pageApps"] = i === 0 ? fold.Apps[i]["appName"] : ", " + fold.Apps[i]["appName"];
      }
    }

    if (fold && fold.hasOwnProperty("smart") && fold.smart.hasOwnProperty("apps") && fold.smart.apps.length > 0) {
      for (let i = 0; i < fold.smart.apps.length; i++) {
        fold["tileSmart"] = i === 0 ? fold.smart.apps[i]["name"] : ", " + fold.smart.apps[i]["name"];
      }
    }

    fold["isRole"] = fold.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty("isRoleBased") && fold["isRoleBased"] ? true : false;
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  private onDrop(drpTile: any, isDynamic?: boolean) {
    var draggedTile = this.setDefaultDraggedTile(drpTile);

    if (this.folder.hasOwnProperty("draggedTiles")) {
      if (this.dragIndex === -1) {
        this.folder["draggedTiles"].push(draggedTile);
      } else {
        var currIdx = this.dragIndex;

        if (!isDynamic) {
          this.folder["draggedTiles"].splice(currIdx, 1);
        } else {
          this.folder["draggedTiles"][currIdx] = draggedTile;
        }

        this.dragIndex = -1;
      }
    } else {
      this.folder["draggedTiles"] = [draggedTile];
    }

    this.droppedTile = drpTile;
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

  setScrollList() {
    this.mScrollbarService.initScrollbar('#main-container-folders', this.scrollbarOptions);
    this.mScrollbarService.initScrollbar('#dragged-folder-tiles', this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-folders");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-folders", "#dragged-folder-tiles"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#main-container-folders", "#dragged-folder-tiles"]);
  };

  /* Setting Drag Index for every tile index change */
  setDragIndex(idx: number, obj: any) {
    if (this.dragIndex !== -1 && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("folderDragContainer")) {
      var totalIdx = this.folder["draggedTiles"].length - 1;

      this.dragIndex = !idx ? -1 : totalIdx - idx;
    }
  };

  folderList(folderId?: string) {
    this.folderService.folderList(this.oid, folderId).then(foldersList => {
      this.folders = foldersList;
    });
  };

  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  /* Add Draggable inbetween dargged tiles */
  addDraggable(idx: number) {
    var dragged = { "uniqueId": this.getUniqueId(), "folderDragContainer": true };
    var totalIdx = this.folder["draggedTiles"].length - 1;

    if (this.dragIndex === -1) {
      this.dragIndex = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
      this.folder["draggedTiles"].splice(this.dragIndex, 0, dragged);
    } else if (this.dragIndex > -1) {
      var fromIdx = this.dragIndex;
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.folder["draggedTiles"], fromIdx, toIdx);
        var move = this.folder["draggedTiles"];
        //this.dragIndex = toIdx;
      }
    }
  };

  /* Duplicating the already available tile */
  replicateTile(obj: any) {
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile") ? obj["tile"] : {};
    var replicatedTile = this.setDefaultDraggedTile(replicateTile);
    this.folder["draggedTiles"].push(replicatedTile);
  };

  /* Move the dragged tile up and down position */
  moveUpDown(move: string, idx: number) {
    var totalIdx = this.folder["draggedTiles"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.folder["draggedTiles"], fromIdx, toIdx);
  };

  /* Deleting the dragged tile */
  deleteDraggedTile(idx: number) {
    this.droppedTile = {};
    var totalIdx = this.folder["draggedTiles"].length - 1;
    var currIdx = totalIdx - idx;
    this.droppedTile = {};
    var tile = this.folder["draggedTiles"][currIdx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.folder["draggedTiles"].splice(currIdx, 1);
  };

  resetFolderContents() {
    this.organizations = [];
    this.oid = "";
    this.folders = [];
    this.groupType = "list";
    this.resetFolder();

    this.folderFilter = {
      "folderSearch": "",
      "sort": {
        "selected": "date_desc", "isAsc": false, "fieldNames": {
          "date": ["dateUpdated", "dateCreated"],
          "name": ["name"]
        }
      }
    };
  };

  resetFolder(mergeReset?: string) {
    this.dragIndex = -1;
    this.draggedTiles = [];
    this.tileDropped = {};
    this.tilesToUpdate = [];
    this.isMerge = {};
    this.droppedTile = {};
    this.folder = {};

    this.folderName = "";
    this.availableStart = "";
    this.availableEnd = "";
    this.art = "";

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }
  };

  newFolder(e: any) {
    e.preventDefault();
    e.stopPropagation();

    this.resetFolder("reset");
  };

  saveFolder(e: any, showMessage?: boolean, isDuplicate?: boolean) {
    var self = this;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    var folderObj = this.folder.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.folder["obj"]) ? this.folder["obj"] : {};
    var foldId = folderObj.hasOwnProperty("_id") ? this.folder["obj"]["_id"] : "-1";
    var tilist = {};

    if (foldId !== "-1" && !isDuplicate) {
      tilist["_id"] = foldId;
    }

    tilist["dateCreated"] = foldId !== "-1" && folderObj.hasOwnProperty("dateCreated") ? folderObj["dateCreated"] : (new Date()).toUTCString();
    tilist["dateUpdated"] = (new Date()).toUTCString();

    if (folderObj.hasOwnProperty("notification")) {
      tilist["notification"] = folderObj["notification"];
    }

    if (folderObj.hasOwnProperty("smart")) {
      tilist["notification"] = folderObj["smart"];
    }

    tilist["name"] = this.folderName;
    tilist["type"] = 'list';
    tilist["art"] = this.art;
    tilist["availableStart"] = this.utils.toUTCDateTime(this.availableStart);
    tilist["availableEnd"] = this.utils.toUTCDateTime(this.availableEnd);
    tilist["organizationId"] = this.oid;
    /* tilist.background_landscape = $('.background_landscape').val();
     tilist.background_portrait = $('.background_portrait').val();
     tilist.background = $('.background').val();
     tilist.timelineBackgroundColor = $('.timeline-bg-color').val();
     tilist.timelineFontColor = $('.timeline-font-color').val();
     tilist.titleFontColor = $('.title-font-color').val();
     tilist.descFontColor = $('.desc-font-color').val(); */

    var current = new Date();
    current.setFullYear(current.getFullYear() + 10);

    if (this.utils.isNullOrEmpty(tilist["name"])) {
      alert("You must at least enter a Folder name");
      return false;
    }

    if (isDuplicate) {
      tilist["name"] = "Copy of " + tilist["name"];
    }

    if (this.utils.isNullOrEmpty(tilist["availableStart"])) {
      alert("Folder available start is empty");
    }

    if (this.utils.isNullOrEmpty(tilist["availableEnd"])) {
      alert("Folder available end is empty");
    }

    tilist["tiles"] = this.getDraggedTiles();

    var isDatesCheck = this.foldercheckDates();

    if (!isDatesCheck) {
      return false;
    }

    this.folderService.saveFolder(tilist)
      .then(folderResObj => {
        var isNew = tilist.hasOwnProperty("_id") && !self.utils.isNullOrEmpty(tilist["_id"]) ? false : true;

        if (showMessage) {
          var alertMessage = isNew ? "Folder Created" : "Folder Updated";
          alertMessage = isDuplicate ? "Duplicate Folder Created" : alertMessage;
          alert(alertMessage);
        }

        if (!isNew) {
          var foldIndex = this.folders.map(function (fold) { return fold['_id']; }).indexOf(folderResObj["_id"]);

          if (foldIndex !== -1) {
            this.folders[foldIndex] = tilist;
          }
        } else if (folderResObj.hasOwnProperty("_id") && !self.utils.isNullOrEmpty(folderResObj["_id"])) {
          tilist["_id"] = folderResObj["_id"];
          this.folders.push(tilist);
        }

        var isSelect = isDuplicate ? true : false;
        this.setFolderData(isSelect, tilist);
      });
  };

  getDraggedTiles(isSave?: boolean) {
    var drgTiles = this.folder.hasOwnProperty("draggedTiles") && this.folder["draggedTiles"].length > 0 ? this.folder["draggedTiles"] : [];
    var tiles = [];

    for (let i = drgTiles.length - 1; 0 <= i; i--) {
      var tile = {};
      var dragTileObj = drgTiles[i];

      if (!dragTileObj.hasOwnProperty["folderDragContainer"] && ((isSave && dragTileObj.hasOwnProperty("tile") && dragTileObj["tile"].hasOwnProperty("_id")) || !isSave)) {
        tile["_id"] = dragTileObj["tile"]["_id"];
        tile["showName"] = dragTileObj["showName"];
        tiles.push(tile);
      }
    }

    return tiles;
  };

  foldercheckDates() {
    var result = true;
    var availableStart = !this.utils.isNullOrEmpty(this.availableStart) ? (new Date(this.availableStart)) : "";
    var untilDate = !this.utils.isNullOrEmpty(this.availableEnd) ? (new Date(this.availableEnd)) : "";

    if (!this.utils.isNullOrEmpty(availableStart) && !this.utils.isNullOrEmpty(untilDate)) {
      if (availableStart > untilDate) {
        alert('The Until date date must be greater than the start date');
        result = false;
      } else if (untilDate < availableStart) {
        alert('The Start date must be lesser than until date');
        result = false;
      }
    }

    return result;
  };

  updateOrganizationIdsTile() {
    this.tilesToUpdate = [];
    var draggedTiles = this.folder.hasOwnProperty("draggedTiles") && this.folder["draggedTiles"].length > 0 ? this.folder["draggedTiles"] : [];

    for (let i = 0; i < draggedTiles.length; i++) {
      var dragTileObj = draggedTiles[i];

      if (!dragTileObj.hasOwnProperty["folderDragContainer"]) {
        if (dragTileObj.hasOwnProperty("tile")) {
          this.tilesToUpdate.push(dragTileObj["tile"]);
        }
      }
    }
  };

  duplicateFolder(e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (this.folder.hasOwnProperty("obj") && this.folder["obj"].hasOwnProperty("_id")) {
      this.saveFolder("", true, true);
    } else {
      alert("Folder not selected");
    }
  };

  deleteFolder(e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (this.folder.hasOwnProperty("obj") && this.folder["obj"].hasOwnProperty("_id")) {
      var r = confirm("Are you sure want to delete this Folder?");

      if (r) {
        var folderId = this.folder["obj"]["_id"];

        this.folderService.removeFolder(folderId).then(deleteRes => {
          if (!this.utils.isEmptyObject(deleteRes) && deleteRes.hasOwnProperty("deleted") && deleteRes["deleted"]) {
            var foldIndex = this.folders.map(function (evtCat) { return evtCat['_id']; }).indexOf(folderId);
            this.folders.splice(foldIndex, 1);

            this.folder = {};
            this.resetFolder("reset");
            alert("Folder Removed");
          }
        });
      }
    } else {
      alert("Folder not selected");
    }
  };

  /* Select Folder */
  selectFolder(e: any, obj: any) {
    e.preventDefault();
    e.stopPropagation();

    var self = this;
    //this.selectedEvent = obj;
    //this.renderer.setElementClass(elem.target, 'selected', true);
    //this.renderer.setElementClass(elem.srcElement, 'selected', true);
    ///var drgTiles = [];
    var foldExists = false;

    if (!this.utils.isEmptyObject(this.folder) && this.folder.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.folder["obj"])) {
      if (this.folder["obj"].hasOwnProperty("_id") && !this.utils.isNullOrEmpty(this.folder["obj"]["_id"])) {
        foldExists = this.folder["obj"]["_id"] === obj["_id"] ? true : false;
      }
    }

    if (!foldExists) {
      this.setFolderData(true, obj);
    }
  };

  setFolderData(isSelect: boolean, obj: any) {
    if (isSelect) {
      //this.draggedTiles = [];
      this.resetFolder();

      if (obj && obj.hasOwnProperty("tiles")) {
        for (let i = 0; i < obj.tiles.length; i++) {
          this.draggedTiles.push(obj.tiles[i]["_id"]);
        }
      }
    }

    this.folderService.folderByTiles(obj._id)
      .then(foldObj => {
        if (foldObj && foldObj[0]) {
          this.assignFolderDatas(foldObj[0]);
        }
      });
  };

  /* Assign folder datas to the selected folder */
  assignFolderDatas(objFolder: Object) {
    this.folder["obj"] = objFolder;
    this.draggedTiles = [];

    if (!this.utils.isEmptyObject(objFolder)) {
      this.folderName = objFolder.hasOwnProperty("name") ? objFolder["name"] : "";
      this.availableStart = objFolder.hasOwnProperty("availableStart") ? this.utils.toLocalDateTime(objFolder["availableStart"]) : "";
      this.availableEnd = objFolder.hasOwnProperty("availableEnd") ? this.utils.toLocalDateTime(objFolder["availableEnd"]) : "";
      this.art = objFolder.hasOwnProperty("art") && !this.utils.isNullOrEmpty(objFolder["art"]) ? objFolder["art"] : "";

      this.folder["draggedTiles"] = [];

      if (objFolder.hasOwnProperty("tiles") && objFolder["tiles"].length > 0) {
        var currTiles = objFolder["tiles"];

        for (let i = currTiles.length - 1; 0 <= i; i--) {
          if (currTiles[i].hasOwnProperty("_id")) {
            this.draggedTiles.push(currTiles[i]["_id"]);
            this.assignDragged(currTiles[i]);
          }
        }
      }
    }
  };

  assignDragged(currTile: any) {
    var draggedTile = this.setSelectedDraggedTile(currTile);

    if (this.folder.hasOwnProperty("draggedTiles")) {
      this.folder["draggedTiles"].push(draggedTile);
    } else {
      this.folder["draggedTiles"] = [draggedTile];
    }
  };


  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.resetFolderContents();
      this.setScrollList();
      this.oid = Cookie.get('oid');
      this.setOrganizations();
      this.folderList();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
