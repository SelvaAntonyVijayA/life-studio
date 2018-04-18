import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Utils } from '../../helpers/utils';
import { CommonService } from '../../services/common.service';
import { PageService } from '../../services/page.service';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { TileService } from '../../services/tile.service';
import { MediaService } from "../../services/media.service";

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css'],
  providers: [PageService, MediaService]
})
export class PhotosComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private pageService: PageService,
    private tileService: TileService,
    private mediaService: MediaService,
    private loaderShared: LoaderSharedService,
    public utils: Utils
  ) { }

  private orgChangeDetect: any;
  oid: string = "";
  appList: any[] = [];
  selectedApp: string = "";
  tiles: any[] = [];
  setTileHtml: any[] = [];
  organizations: any[] = [];
  moderatorList: boolean = true;
  selectedTileId: string = "";
  selectedTileIndex: number = -1;
  selectedTileTitle: string = "";
  mediaList: any[] = [];

  getTiles() {
    this.tileService.getTileBlockByType(this.oid, 'picture')
      .then(res => {

        this.tiles = res;
        this.tilesList();
      });
  };

  tilesList() {
    for (var i = 0; i < this.tiles.length; i++) {
      var tileObject = this.tiles[i];
      var blocks = typeof tileObject.blocksData != 'undefined' ? tileObject.blocksData : []
      var isModeratedTile = false;

      // var pictureBlocks = blocks.find(ct => (ct.hasOwnProperty("type") && ct.type == 'picture'));

      for (var j = 0; j < blocks.length; j++) {
        var ct = blocks[j];

        if (ct.hasOwnProperty("type") && ct.type == 'picture' && this._getMediaPictureCheck(ct)) {

          if (isModeratedTile == false) {
            isModeratedTile = true;
          }
        }
      }

      if (isModeratedTile) {
        var lastUpdatedUser = tileObject.lastUpdatedUser ? tileObject.lastUpdatedUser : tileObject.userName;
        var lastUpdatedOn = tileObject.lastUpdatedOn ? tileObject.lastUpdatedOn : tileObject.dateCreated;
        var orgObject = this.organizations.find(orgs => orgs['_id'] === this.oid);

        var tileToolTip = "Organization : " + orgObject.name + "&#013;Category : " + tileObject.categoryName + "&#013;";
        tileToolTip += "Last updated by : " + lastUpdatedUser + "&#013;";
        tileToolTip += "Last updated on : " + this.utils.toLocalDateTime(lastUpdatedOn) + "&#013;";
        tileToolTip += "Created by : " + tileObject.userName + "&#013;";
        tileToolTip += "Created on : " + this.utils.toLocalDateTime(tileObject.dateCreated);

        tileObject.tileToolTip = tileToolTip;

        this.setTileHtml.push(tileObject);
      }
    }

    this.loaderShared.showSpinner(false);
  };

  _getMediaPictureCheck(block) {
    var text = block && typeof block.data.text != 'undefined' ? block.data.text : "";
    var result = false;

    if (text != "") {
      if ($(text).find('a[type=eventPhoto]').attr('moderated') == "true") {
        result = true;
      }
    }

    return result;
  };

  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  getOrganizationName(orgs: string[], currentOrg?: string) {
    var orgNames = [];

    for (let i = 0; i < this.organizations.length; i++) {
      var currOrg = this.organizations[i];
      var orgId = currOrg["_id"];
      var orgIdx = orgs.indexOf(orgId);

      if (orgIdx !== -1 && (this.utils.isNullOrEmpty(currentOrg) || (currOrg._id !== currentOrg))) {
        orgNames.push(currOrg["name"]);
      }
    }

    return orgNames.join(",");
  };

  toHTML(input): any {
    return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
  }

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {

          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];
          }
        });
    }
  };

  appChange(appId: string) {
    this.selectedApp = appId;
    this.showModeratorPhotos(this.selectedTileId, this.selectedTileTitle, this.selectedTileIndex);
  };

  showModeratorPhotos(tileId: string, tileTitle: string, index: number) {
    this.moderatorList = false;
    this.selectedTileId = tileId;
    this.selectedTileIndex = index;
    this.selectedTileTitle = tileTitle;

    this.mediaService.list(this.selectedApp, this.selectedTileId, 'eventphoto')
      .then(res => {

        this.mediaList = res;
      });

  }

  backToList() {
    this.moderatorList = true;
  }

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);

        this.oid = Cookie.get('oid');
        this.setOrganizations();
        this.getApps();
        this.getTiles();
      }
    });
  }

}
