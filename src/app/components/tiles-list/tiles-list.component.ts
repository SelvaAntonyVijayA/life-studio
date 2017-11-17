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
  tileContent = new EventEmitter<any>();
  //private organizations: any[] = [];
  tileCategories: any[] = [];
  tileSearchText: string = "";
  defaultSelected = "-1";
  selectedOrg: string = "-1";
  selectedCategory: string = "-1";
  oid: string = "";
  listType: string = "list";
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
      this.getTilesCategories();
    }
  };

  private releaseDrop(currTile) {
    let index = this.tiles.map(function (t) { return t['_id']; }).indexOf(currTile._id);

    if (index >= 0) {
      this.tiles.splice(index, 1);
    } else {
      this.tiles.push(currTile);
    }
  }

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
