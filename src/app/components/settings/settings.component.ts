import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { PageService } from '../../services/page.service';
import { PageSettingsService } from '../../services/pagesettings.service';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [PageService, PageSettingsService]
})
export class SettingsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private tileService: TileService,
    private pageService: PageService,
    private pagesettings: PageSettingsService,
    private loaderShared: LoaderSharedService,
    private mScrollbarService: MalihuScrollbarService,
    public utils: Utils) { }

  private orgChangeDetect: any;
  oid: string = "";
  appList: any[] = [];
  locationList: any[] = [];
  organizations: any[] = [];
  selectedApp: string = "";
  selectedLocation: string = "";
  draggedTiles: any[] = [];
  droppedTile: Object = {};
  xsettings: object = {};
  dragIndex: number = -1;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  isImageLibrary: string = "none";
  imglibData: object = {};

  getTileContent(tileObj: any) {
    if (!this.utils.isEmptyObject(tileObj) && tileObj.hasOwnProperty("isSpinner")) {
      this.loaderShared.showSpinner(false);
    }
  };

  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  appChange(appId: string) {
    this.selectedApp = appId;
    this.getLocations(appId, true);
  };

  locationChange(locationId: string, isSpinner?: boolean) {
    this.selectedLocation = locationId;
    this.getSettings(true);
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {

          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];

            if (!this.utils.isNullOrEmpty(this.selectedApp)) {
              this.getLocations(this.selectedApp);
            }
          }
        });
    }
  };

  getLocations(appId: string, isSpinner?: boolean) {
    if (this.locationList.length > 0) {
      this.locationList = [];
      this.selectedLocation = "";
    }

    this.pageService.getLocations(appId)
      .then(locs => {
        if (this.utils.isArray(locs) && locs.length > 0) {
          this.locationList = locs;
          this.selectedLocation = this.locationList[0]["_id"];
        }

        this.getSettings(isSpinner);
      });
  };

  getSettings(isSpinner?: boolean) {
    this.pagesettings.get(this.oid, this.selectedApp, this.selectedLocation).then(xlist => {

      if (!this.utils.isEmptyObject(xlist)) {
        this.xsettings = xlist[0];

        var settingMenuTiles = this.xsettings["menuTiles"];

        if (!this.utils.isEmptyObject(settingMenuTiles)) {
          for (let i = 0; i < settingMenuTiles.length; i++) {
            var xTile = settingMenuTiles[i];

            if (!this.utils.isEmptyObject(xTile) && !this.utils.isNullOrEmpty(xTile["linkTo"]) && xTile["linkTo"] === "tile") {
              this.draggedTiles.push(xTile["linkId"]);
            }
          }
        }

        if (this.draggedTiles.length > 0) {
          this.pageService.getPageTiles(this.draggedTiles)
            .then(objTiles => {

              if (this.utils.isArray(objTiles) && objTiles.length > 0) {
                for (let i = 0; i < settingMenuTiles.length; i++) {

                  var tileIndex = objTiles.map(t => { return t['_id']; }).indexOf(settingMenuTiles[i]["linkId"]);
                  settingMenuTiles[i].tile = this.getCurrentTileObj(objTiles[tileIndex]);
                }

                this.xsettings["menuTiles"] = settingMenuTiles;
              }

              if (isSpinner) {
                this.loaderShared.showSpinner(false);
              }
            });

        } else {
          this.xsettings["menuTiles"] = [];

          if (isSpinner) {
            this.loaderShared.showSpinner(false);
          }
        }

      } else {
        this.xsettings = {};
        this.xsettings["showBalancePage"] = false;
        this.xsettings["menuTiles"] = [];

        if (isSpinner) {
          this.loaderShared.showSpinner(false);
        }
      }
    });
  };

  saveSettings(e: any) {
    this.loaderShared.showSpinner(true);

    if (this.utils.isNullOrEmpty(this.xsettings["_id"])) {
      this.xsettings["title"] = "Settings";
      this.xsettings["appId"] = this.selectedApp;
      this.xsettings["organizationId"] = this.oid;
      this.xsettings["locationId"] = this.selectedLocation;
    }

    let saveObj = Object.assign({}, this.xsettings);
    saveObj["menuTiles"] = saveObj["menuTiles"].map(x => Object.assign({}, x));

    for (let i = 0; i < saveObj["menuTiles"].length; i++) {
      delete saveObj["menuTiles"][i]["tile"];
    }

    this.pagesettings.save(saveObj)
      .then(res => {
        this.xsettings["_id"] = res._id;
        this.loaderShared.showSpinner(false);
        this.utils.iAlert('success', '', 'Saved Successfully');
      });
  };

  deleteSettings(e: any) {
    this.loaderShared.showSpinner(true);

    this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure?", "Yes", "No", (res) => {

      if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
        this.pagesettings.remove(this.xsettings["_id"])
          .then(res => {
            this.xsettings = {};
            this.loaderShared.showSpinner(false);
            this.utils.iAlert('success', '', 'Deleted Successfully');
          });
      } else {
        this.loaderShared.showSpinner(false);
      }
    });
  };

  setDragIndex(idx: number, obj: any) {
    if (this.dragIndex !== -1 && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("xsettingsDragContainer")) {
      var totalIdx = this.xsettings["menuTiles"].length - 1;

      this.dragIndex = !idx ? -1 : totalIdx - idx;
    }
  };

  setScrollList() {
    this.mScrollbarService.initScrollbar(".app_settings_drag_block", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push(".app_settings_drag_block");

    } else {
      this.cms["appDatas"]["scrollList"] = [".app_settings_drag_block"];
    }
  };

  destroyScroll() {
    this.cms.destroyScroll([".app_settings_drag_block"]);
  };

  private onDrop(drpTile: any, isDynamic?: boolean) {
    var draggedTile = this.setDefaultDraggedTile(drpTile);

    if (this.xsettings.hasOwnProperty("menuTiles")) {
      if (this.dragIndex === -1) {
        this.xsettings["menuTiles"].push(draggedTile);

      } else {
        var currIdx = this.dragIndex;

        if (!isDynamic) {
          this.xsettings["menuTiles"].splice(currIdx, 1);

        } else {
          this.xsettings["menuTiles"][currIdx] = draggedTile;
        }

        this.dragIndex = -1;
      }

    } else {
      this.xsettings["menuTiles"] = [draggedTile];
    }

    this.droppedTile = drpTile;
  };

  setDefaultDraggedTile(tile: any) {
    var dragged = {};

    if (!this.utils.isEmptyObject(tile)) {
      tile = this.getCurrentTileObj(tile);

      dragged = {
        "name": tile.title,
        "linkTo": "tile",
        "linkId": tile._id,
        "imageUrl": tile.art,
        "showOnReg": false,
        "skipAlreadyAnswered": false,
        "navBarButton": false,
        "tile": tile
      };
    }

    return dragged;
  };

  getCurrentTileObj(tile: Object) {
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

  /* Getting unique Id */
  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  addDraggable(idx: number) {
    var dragged = { "uniqueId": this.getUniqueId(), "xsettingsDragContainer": true };
    var totalIdx = this.xsettings["menuTiles"].length - 1;

    if (this.dragIndex === -1) {
      this.dragIndex = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
      this.xsettings["menuTiles"].splice(this.dragIndex, 0, dragged);

    } else if (this.dragIndex > -1) {
      var fromIdx = this.dragIndex;
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.xsettings["menuTiles"], fromIdx, toIdx);
        var move = this.xsettings["menuTiles"];
        //this.dragIndex = toIdx;
      }
    }
  };

  /* Duplicating the already available tile */
  replicateTile(obj: any) {
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile") ? obj["tile"] : {};
    var replicatedTile = this.setDefaultDraggedTile(replicateTile);
    this.xsettings["menuTiles"].push(replicatedTile);
  };

  /* Move the dragged tile up and down position */
  moveUpDown(move: string, idx: number) {
    var totalIdx = this.xsettings["menuTiles"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.xsettings["menuTiles"], fromIdx, toIdx);
  };

  /* Deleting the dragged tile */
  deleteDraggedTile(idx: number) {
    this.droppedTile = {};
    var totalIdx = this.xsettings["menuTiles"].length - 1;
    var currIdx = totalIdx - idx;
    this.droppedTile = {};
    var tile = this.xsettings["menuTiles"][currIdx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.xsettings["menuTiles"].splice(currIdx, 1);
  };

  addIcon(tileIndex: number) {
    var totalIdx = this.xsettings["menuTiles"].length - 1;
    tileIndex = totalIdx - tileIndex;

    this.isImageLibrary = 'block';
    this.imglibData = {
      index: tileIndex
    }
  };

  onImageLibraryClose(imglib: object) {
    this.isImageLibrary = 'none';
    this.xsettings["menuTiles"][imglib["data"]["index"]]["imageUrl"] = imglib["url"];
  }

  onImageLibraryResult(imglib: object) {
    this.isImageLibrary = 'none';
    this.xsettings["menuTiles"][imglib["data"]["index"]]["imageUrl"] = imglib["url"];
  }

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.oid = Cookie.get('oid');
      this.setOrganizations();
      this.getApps();
      this.setScrollList();
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };

}
