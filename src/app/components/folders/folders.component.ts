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
    private renderer: Renderer) {
    this.utils = Utils;
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
  utils: any;
  dragIndex: number = -1;

  /* Setting for default dragged tile */
  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(), "tile": {}, "showName": false
    };

    if (tile && !this.utils.isEmptyObject(tile)) {
      var currTile = {
        "_id": tile.hasOwnProperty("_id") ? tile["_id"] : "-1",
        "title": tile.hasOwnProperty("title") && !this.utils.isNullOrEmpty(tile["title"]) ? tile["title"] : "",
        "art": tile.hasOwnProperty("art") && !this.utils.isNullOrEmpty(tile["art"]) ? tile["art"] : "",
        "categoryName": tile.hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(tile["categoryName"]) ? tile["categoryName"] : ""
      }

      dragged["tile"] = currTile;
    }

    return dragged;
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

  /*Event Notification Icon Check Conditions */
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

    var tile = this.folder["draggedTiles"][currIdx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.folder["draggedTiles"].splice(currIdx, 1);
  };

  resetFolderContents() {
    this.dragIndex = -1;
    this.organizations = [];
    this.oid = "";
    this.draggedTiles = [];
    this.tileDropped = {};
    this.tilesToUpdate = [];
    this.isMerge = {};
    this.droppedTile = {};
    this.folders = [];
    this.groupType = "list";
    this.folder = {};

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
