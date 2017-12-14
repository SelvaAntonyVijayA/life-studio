import { Component, OnInit, Input, Renderer, EventEmitter, ElementRef, ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Tile } from '../../models/tile';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { CommonService } from '../../services/common.service';
//import { ISlimScrollOptions } from 'ng2-slimscroll';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

@Component({
  selector: 'tiles-list',
  outputs: ["tileContent"],
  templateUrl: './tiles-list.component.html',
  styleUrls: ['./tiles-list.component.css']
})

export class TilesListComponent {
  tiles: Tile[] = [];
  //opts: ISlimScrollOptions;
  @Input('page') page: string;
  @Input('organizations') organizations: any[];
  @Input('droppedTile') droppedTile: Object;
  @Input('draggedTiles') draggedTiles: any[];
  @Input('isMerge') isMerge: Object;
  @Input('tilesToUpdate') tilesToUpdate: any[];
  tileContent = new EventEmitter<any>();
  //private organizations: any[] = [];
  tileCategories: any[] = [];
  tileSearchText: string = "";
  defaultSelected = "-1";
  selectedOrg: string = "-1";
  selectedCategory: string = "-1";
  listTiles: any[] = [];
  oid: string = "";
  listType: string = "list";
  draggedSeparatedTiles: Object = {};
  sortOpt: Object = {
    "selectedOpt": "date", "isAsc": true, "values": {
      "date": ["lastUpdatedOn", "dateCreated"],
      "title": ["title"],
      "category": ["categoryName"],
      "author": ["userName"]
    }
  };

  private orgChangeDetect: any;
  protected loading: boolean;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  utils: any;

  constructor(private tileService: TileService,
    private route: ActivatedRoute,
    private cms: CommonService,
    private e1: ElementRef,
    private renderer: Renderer,
    private mScrollbarService: MalihuScrollbarService,
  ) {

    this.utils = Utils;
    this.oid = Cookie.get('oid');
  }

  orgChange(orgId: string) {
    this.resetTiles();
    this.selectedOrg = orgId;
    this.setTileListData();
    this.tileContent.emit({ "orgId": orgId });
  };

  sortChange(sortVal: string) {
    this.sortOpt["selectedOpt"] = sortVal;
  };

  categoryChange(catId: string) {
    this.selectedCategory = catId;
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  doSort(isVal: boolean) {
    this.sortOpt["isAsc"] = isVal;
  };

  getTileData(data: any) {
    if (data.hasOwnProperty("dropped")) {
      this.releaseDrop(data["dropped"]);
    } else {
      this.tileContent.emit(data);
    }
  };

  emitCategories(categories: any[]) {
    this.tileContent.emit({ "tileCategories": categories });
  };

  updateTileData(tileObjData: string[]) {
    if (tileObjData && tileObjData.length > 0) {
      for (let i = 0; i < tileObjData.length; i++) {
        var currTileObj = tileObjData[i];
        var currTileId = currTileObj["_id"];
        let index = this.tiles.map(function (t) { return t['_id']; }).indexOf(currTileId);
        var updateResult = index !== -1 ? true : this.draggedSeparatedTiles.hasOwnProperty(currTileId) ? true : false;

        if (!updateResult) {
          var tileObj = index !== -1 ? this.tiles[index] : this.draggedSeparatedTiles[currTileId];
          var orgs = typeof tileObj.organizationId !== "object" ? tileObj.organizationId.split(',') : tileObj.organizationId;
          var id = tileObj._id;
          var catName = !this.utils.isEmptyObject(currTileObj) && currTileObj.hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(currTileObj["categoryName"]) ? currTileObj["categoryName"] : "";

          if (orgs.indexOf(this.oid) === -1) {
            this.searchAssignCategories(catName);
            var data = {};
            orgs.push(this.oid);
            data["organizationId"] = orgs;
            tileObj["organizationId"] = orgs;
            this.tileService.tileUpdate(currTileId, data);
          }
        }
      }
    }
  };

  searchAssignCategories(categoryName: string) {
    var catName = !this.utils.isNullOrEmpty(categoryName) ? this.utils.trim(categoryName) : "";
    catName = !this.utils.isNullOrEmpty(catName) ? catName.toLowerCase() : "";
    var tileCatIdExist = "";

    for (let i = 0; i < this["tileCategories"].length; i++) {
      var name = this["tileCategories"][i].hasOwnProperty("name") ? this.utils.trim(this["tileCategories"][i]["name"]) : "";
      name = !this.utils.isNullOrEmpty(name) ? name.toLowerCase() : "";

      if (name === catName) {
        tileCatIdExist = this["tileCategories"][i]["_id"];
      }
    }

    if (this.utils.isNullOrEmpty(tileCatIdExist) && !this.utils.isNullOrEmpty(categoryName)) {
      var category = {};
      category["name"] = this.utils.trim(categoryName);
      category["organizationId"] = this.oid;
      category["color"] = this.getDynamicDarkColor();
      this.saveTileCategory(category);
    }
  };

  getDynamicDarkColor() {
    var chk = 0;
    var color = 'rgb(' + (Math.floor((256 - 432) * Math.random()) + 230) + ',' + (Math.floor((256 - 449) * Math.random()) + 230) + ',' + (Math.floor((256 - 426) * Math.random()) + 230) + ')';

    if (this["tileCategories"].length === 0) {
      return color;
    }

    for (let i = 0; i < this["tileCategories"].length; i++) {
      var currColor = this["tileCategories"][i].hasOwnProperty("color") && !this.utils.isNullOrEmpty(this["tileCategories"][i]["color"]) ? this["tileCategories"][i]["color"] : "";

      if (currColor == color) {
        chk = 1;
        break;
      }
    }

    if (chk == 1) {
      this.getDynamicDarkColor();

    } else {
      return color;
    }
  };

  saveTileCategory(tileCatObj: any) {
    if (!this.utils.isEmptyObject(tileCatObj)) {
      this.tileService.saveTileCategory(tileCatObj)
        .then(resTileCat => {
          if (!this.utils.isEmptyObject(resTileCat) && resTileCat.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(resTileCat["_id"])) {
            tileCatObj["_id"] = resTileCat["_id"];

            this.tileCategories.push(tileCatObj);
          }
        });
    }
  };

  changeTileView(view: string) {
    this.listType = view;

    if (view === "details") {
      var slimScrollGrid = this.e1.nativeElement.querySelectorAll('.tiles_list_show_tiles .slimscroll-wrapper .slimscroll-grid');

      if (slimScrollGrid && slimScrollGrid[0]) {
        slimScrollGrid[0].style.display = "block";
      }
    }
    //this.tiles = tileCloneData;
  };

  /* Tile Categories based on organization*/
  getTilesCategories() {
    this.tileService.getTilesCategories(this.selectedOrg).subscribe(tileCat => {
      this.tileCategories = tileCat[0];
      this.tiles = tileCat[1];
      this.emitCategories(this.tileCategories);
      this.setTileSearch();
    });
  };

  /* Resetting the datas for the component*/
  resetTiles() {
    this.tiles = [];
    this.sortOpt["selectedOpt"] = "date";
    this.sortOpt["isAsc"] = false;
    //this.selectedOrg = "-1";
    this.selectedCategory = "-1"
  };

  setTileSearch() {
    var tilesData = this.tiles;

    if (this.utils.isArray(tilesData) && tilesData.length > 0) {
      for (let i = 0; i < tilesData.length; i++) {
        var category = this.getCategoryName(tilesData[i]["category"]);
        var categoryName = category[0] && category[0].hasOwnProperty("name") ? category[0]["name"] : "";
        tilesData[i]["search"] = this.utils.htmlEncode(tilesData[i].title) + " " + tilesData["title"];
        tilesData[i]["categoryName"] = categoryName;
      }
    }
  };

  getCategoryName(id: string) {
    return this.tileCategories.filter(function (cat) {
      return cat["_id"] === id;
    });
  };

  /*setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };*/

  /* Intilalize scroll for the component */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#main-tiles-container", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-tiles-container");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-tiles-container"];
    }
  };

  /*Destroy scroll for the component*/
  destroyScroll() {
    this.cms.destroyScroll(["#main-tiles-container"]);
  };

  setTileListData() {
    if (this.organizations.length > 0) {
      this.draggedSeparatedTiles = {};
      this.getTilesCategories();
    }
  };

  private releaseDrop(currTile: any) {

    if (currTile && !this.utils.isEmptyObject(currTile) && currTile.hasOwnProperty("_id")) {
      let index = this.tiles.map(function (t) { return t['_id']; }).indexOf(currTile._id);

      if (index >= 0) {
        var tileToPush = this.tiles[index];
        this.deletePushDraggedTiles(false, tileToPush);
        this.tiles.splice(index, 1);
      } else if (this.draggedSeparatedTiles.hasOwnProperty(currTile._id)) {
        var tileObj = this.draggedSeparatedTiles[currTile._id];
        this.tiles.push(tileObj);
        this.deletePushDraggedTiles(true, tileObj);
      }
    }
  };

  /*getDraggedTiles(tileIds) {
    var tileIndexes = [];
    var tileDatas = this.tiles.filter(function (currTile) {
      var tIndex = tileIds.indexOf(currTile["_id"]);

      if (tIndex > -1) {
        tileIndexes.push(tIndex);
      }
      return currTile && tileIds.indexOf(currTile["_id"]) > -1;
    });

    if (tileIndexes.length > 0) {
      for (let i = 0; i < tileIndexes.length; i++) {
        this.tiles.splice(tileIndexes[i], 1);
      }
    }

    if (tileDatas.length > 0) {
      this.tileContent.emit({ "draggedTiles": tileDatas });
    }
  };*/

  deletePushDraggedTiles(isDelete: boolean, currTile: Object) {
    if (!this.utils.isEmptyObject(this.draggedSeparatedTiles)) {
      var tileId = !this.utils.isEmptyObject(currTile) && currTile.hasOwnProperty("_id") ? currTile["_id"] : "-1";

      if (isDelete && tileId !== "-1") {
        delete this.draggedSeparatedTiles[tileId]
      } else if (tileId !== "-1") {
        if (!this.draggedSeparatedTiles.hasOwnProperty(tileId)) {
          this.draggedSeparatedTiles[tileId] = currTile;
        }
      }
    }
  };

  separateDraggedTiles(tileIds) {
    this.mergeSeparatedTiles();
    var self = this;

    if (tileIds && tileIds.length > 0) {
      var matchedTileIds = [];

      var tileDatas = this.tiles.filter(function (currTile, idx) {
        if (tileIds.indexOf(currTile["_id"]) > -1) {
          matchedTileIds.push(currTile["_id"]);
        }

        return currTile && !self.draggedSeparatedTiles.hasOwnProperty(currTile["_id"]) && tileIds.indexOf(currTile["_id"]) > -1;
      });

      if (matchedTileIds.length > 0) {
        for (let i = 0; i < matchedTileIds.length; i++) {
          let index = this.tiles.map(function (t) { return t['_id']; }).indexOf(matchedTileIds[i]);
          this.tiles.splice(index, 1);
        }

        for (let j = 0; j < tileDatas.length; j++) {
          this.draggedSeparatedTiles[tileDatas[j]["_id"]] = tileDatas[j];
        }
      }
    };
  };

  mergeSeparatedTiles() {
    if (!this.utils.isEmptyObject(this.draggedSeparatedTiles)) {
      for (let tileId in this.draggedSeparatedTiles) {
        var currTile = this.draggedSeparatedTiles[tileId];
        this.tiles.push(currTile);
      }

      this.draggedSeparatedTiles = {};
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      //this.setOrganizations();
      this.setScrollList();
      this.oid = Cookie.get('oid');
      this.selectedOrg = this.oid;
      this.resetTiles();
      this.setTileListData();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("organizations") && cHObj["organizations"]["currentValue"].length > 0) {
      if (!cHObj["organizations"]["firstChange"] && this.utils.isArray(cHObj["organizations"]["previousValue"]) && cHObj["organizations"]["previousValue"].length == 0) {
        this.setTileListData();
      }
    }

    if (cHObj.hasOwnProperty("droppedTile") && !this.utils.isEmptyObject(cHObj["droppedTile"]["currentValue"])) {
      this.releaseDrop(cHObj["droppedTile"]["currentValue"]);
    }

    if (cHObj.hasOwnProperty("draggedTiles") && cHObj["draggedTiles"]["currentValue"].length > 0) {
      this.separateDraggedTiles(cHObj["draggedTiles"]["currentValue"]);
    }

    if (cHObj.hasOwnProperty("isMerge") && !this.utils.isEmptyObject(cHObj["isMerge"]["currentValue"])) {
      if (cHObj["isMerge"]["currentValue"]["status"] === "merge") {
        this.mergeSeparatedTiles();
      }
    }

    if (cHObj.hasOwnProperty("tilesToUpdate") && cHObj["tilesToUpdate"]["currentValue"].length > 0) {
      this.updateTileData(cHObj["tilesToUpdate"]["currentValue"]);
    }
  };
}

@Component({
  selector: 'tiles',
  outputs: ["tileData"],
  template: `<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet" />
             <link rel="stylesheet" type="text/css" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
             <link rel="stylesheet" href="/css/ti_icons.css">
             <div [iliDraggable]="{data: tile, page: page}" [style.cursor]="cursor" class="main_tile_block tiles_list_single"> 
             <img [ngClass]="listType === 'list'? 'tile_list_art tile-content-img' : 'tile_list_art tile-details-img'" [src]="tile?.art | safe">
             <div class="tile_list_title tile-content-title">{{tile?.title}}</div>
             <div class="tile_icons">
             <span [title]="symbols!.tileApps" [style.display]="symbols!.isWeight" class="step weight"></span>
             <span [title]="symbols!.tileHealthStatusRules" [style.display]="symbols!.isRules" class="step smart smarticon report-rule-tile"> <i class="icon ion-heart"></i> </span>
             <span [title]="symbols!.tileProcedure" [style.display]="symbols!.isProcedure" class="step smart smarticon smarticon-tile"> <i class="icon ion-medkit"></i> </span>
             <span [title]="symbols!.tileSmart" [style.display]="symbols!.isSmart" class="step smart smarticon smarticon-tile"> <i class="icon ion-lightbulb"></i> </span>
             <span [title]="symbols!.tileNotifications" [style.display]="symbols!.isNotification" class="step smart noteicon smarticon-tile"  style="display: block;" aria-hidden="true"><i class="icon ion-android-notifications-none"></i></span>
             <span [title]="symbols!.tileApps" [style.display]="symbols!.isRole" class="step smart smarticon smarticon-tile"> <i class="icon ion-android-person"></i> </span>
             </div>
             </div>`,
  styleUrls: ['./tiles-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class TilesComponent implements OnInit {
  @Input() tile: any;
  @Input('page') page: string;
  @Input('listType') listType: string;
  tileData = new EventEmitter<any>();
  dropped = new EventEmitter<any>();
  @ViewChild(this, { read: ViewContainerRef }) tileListSingle;

  emptyString: string = "";
  symbols = {};
  tileSelect: Function;
  cursor: string = "crosshair";

  constructor(private e1: ElementRef,
    private renderer: Renderer,
    private tileService: TileService,
    private viewContainerRef: ViewContainerRef,
    private resolver: ComponentFactoryResolver) {

  }

  ngOnInit() {
    this.showSymbols();

    if (this.page === "tiles") {
      this.cursor = "pointer";
      this.tileSelect = this.renderer.listen(this.e1.nativeElement, 'click', (event) => {
        var blocksIds = this.tile.blocks;

        this.tileService.getTileBlocks(blocksIds)
          .then(blocks => this.assignTileData(blocks));
      });
    }
  };

  assignTileData(blocks: any[]) {
    var data = { "tile": this.tile, "blocks": blocks };
    this.tileData.emit(data);
  };

  ngOnDestroy() {
    if (this.page === "tiles") {
      this.tileSelect();
    }
  };

  showSymbols() {
    var tileNotifications = "";
    var tileSmart = "";
    var pageApps = "";
    var tileProcedure = "";
    var tileRules = this.emptyString;

    if (this.tile.hasOwnProperty("notification") && this.tile.notification.hasOwnProperty("apps") && this.tile.notification.apps.length > 0) {
      for (let i = 0; i < this.tile.notification.apps.length; i++) {
        var app = this.tile.notification.apps[i];

        if (i === 0) {
          tileNotifications += app.name;
        } else {
          tileNotifications += ", " + app.name;
        }
      }

      this.symbols["isNotification"] = "block";
    } else {
      this.symbols["isNotification"] = "none";
    }

    if (this.tile.hasOwnProperty("smart") && this.tile.smart.hasOwnProperty("apps") && this.tile.smart.apps.length > 0) {
      for (let i = 0; i < this.tile.smart.apps.length; i++) {
        var smartApp = this.tile.smart.apps[i];

        if (i == 0) {
          tileSmart += smartApp.name;
        } else {
          tileSmart += ", " + smartApp.name;
        }
      }

      this.symbols["isSmart"] = "block";
    } else {
      this.symbols["isSmart"] = "none";
    }

    if (this.tile.hasOwnProperty("Apps") && this.tile.Apps.length > 0) {
      for (let i = 0; i < this.tile.Apps.length; i++) {
        var app = this.tile.Apps[i];

        if (i === 0) {
          pageApps += app.appName;
        } else {
          pageApps += ", " + app.appName;
        }
      }
    }

    if (this.tile.hasOwnProperty("Procedure") && this.tile.Procedure.length > 0) {
      for (let i = 0; i < this.tile.Procedure.length; i++) {
        var procedure = this.tile.Procedure[i];

        if (i === 0) {
          tileProcedure += procedure.name;
        } else {
          tileProcedure += ", " + procedure.name;
        }
      }

      this.symbols["isProcedure"] = "block";
    } else {
      this.symbols["isProcedure"] = "none";
    }

    if (this.tile.hasOwnProperty("hsrRuleEngine") && this.tile.hsrRuleEngine.length > 0) {
      for (let i = 0; i < this.tile.hsrRuleEngine.length; i++) {
        var hsr = this.tile.hsrRuleEngine[i];

        if (i == 0) {
          tileRules += hsr.ruleName;
        } else {
          tileRules += ", " + hsr.ruleName;
        }
      }

      this.symbols["isRules"] = "block";
    } else {
      this.symbols["isRules"] = "none";
    }

    this.symbols["isWeight"] = this.tile.hasOwnProperty("isWeight") && this.tile.isWeight ? "block" : "none";
    this.symbols["isRole"] = this.tile.hasOwnProperty("isRoleBased") && this.tile.isRoleBased ? "block" : "none";
    this.symbols["tileNotifications"] = tileNotifications;
    this.symbols["tileSmart"] = tileSmart;
    this.symbols["tileApps"] = pageApps;
    this.symbols["tileProcedure"] = tileProcedure;
    this.symbols["tileHealthStatusRules"] = tileRules;
  };
}
