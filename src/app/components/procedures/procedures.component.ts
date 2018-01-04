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
  styleUrls: ['./procedures.component.css']
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

  /* Setting for default dragged tile */
  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(), "tile": {},
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

  };

  languageChange(langId: string) {
    this.selectedLanguage = langId;
  };

  /* Dragged tile on drop */
  private onDrop(currTile, isDynamic) {
    var draggedTile = this.setDefaultDraggedTile(currTile);

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

    this.procedure["obj"] = obj;
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
    var replicatedTile = this.setDefaultDraggedTile(replicateTile);
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
