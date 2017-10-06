import { Component, OnInit, Input, Renderer, EventEmitter, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Tile } from '../../models/tile';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { ISlimScrollOptions } from 'ng2-slimscroll';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tiles-list',
  outputs: ["tileContent"],
  templateUrl: './tiles-list.component.html',
  styleUrls: ['./tiles-list.component.css']
})

export class TilesListComponent implements OnInit {
  tiles: Tile[] = [];
  opts: ISlimScrollOptions;
  @Input('page') page: string;
  tileContent = new EventEmitter<any>();
  organziations: any[] = [];
  defaultSelected = "-1";
  selectedOrg: Object = {};
  oid: string = "";
  private orgChangeDetect: any;

  constructor(private tileService: TileService, private route: ActivatedRoute) {
    this.oid = Cookie.get('oid');
  }

  protected loading: boolean;

  orgChange(org: any) {
    this.selectedOrg = org;
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  getTileData(data: any) {
    this.tileContent.emit(data);
  };

  setScrollOptions() {
    this.opts = {
      position: 'right',
      barBackground: '#8A8A8A',
      gridBackground: '#D9D9D9',
      barBorderRadius: '10',
      barWidth: '2',
      gridWidth: '1'
    };
  };


  getTiles() {
    this.tileService.getTiles(this.oid)
      .then(tiles => this.tiles = tiles);
  }

  resetTiles() {
    this.tiles = [];
    this.selectedOrg = {};
  };

  ngOnInit() {
    this.setScrollOptions();

    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.oid = Cookie.get('oid');
      this.resetTiles();
      this.getTiles();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}

@Component({
  selector: 'tiles',
  outputs: ["tileData"],
  template: `<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet" />
             <link rel="stylesheet" type="text/css" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
             <link rel="stylesheet" href="/css/ti_icons.css">
             <div [style.cursor]="cursor" class="main_tile_block tiles_list_single"> 
             <img class="tile_list_art tile-content-img" [src]="tile?.art | safe">
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
  tileData = new EventEmitter<any>();

  emptyString: string = "";
  symbols = {};
  tileSelect: Function;
  cursor: string = "crosshair";

  constructor(private e1: ElementRef, private renderer: Renderer, private tileService: TileService) {
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
  }

  assignTileData(blocks: any[]) {
    var data = { "tile": this.tile, "blocks": blocks };
    this.tileData.emit(data);
  }

  ngOnDestroy() {
    this.tileSelect();
  }

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
  }
}
