import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockOrganizer, BlockComponent, BlockItem, GetBlocks } from './block-organizer';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { ThemeService } from '../../services/theme.service';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

import {
  TextBlockComponent, VideoBlockComponent, PictureBlockComponent, DisqusBlockComponent,
  SocialFeedBlockComponent, CalendarBlockComponent, ShareBlockComponent, PatientsBlockComponent,
  InquiryBlockComponent, NotesBlockComponent,
  SurveyBlockComponent, QuestionnaireBlockComponent,
  StartWrapperBlockComponent, FormTitleBlockComponent,
  QuestionsBlockComponent, AttendanceBlockComponent, ConfirmationBlockComponent,
  PasswordBlockComponent, NextBlockComponent, FormPhotoComponent, PainLevelComponent,
  DrawToolBlockComponent, PhysicianBlockComponent, EndWrapperBlockComponent,
  FillBlockComponent, ButtonsBlockComponent, ContactUsBlockComponent,
  PlacefullBlockComponent, AddToCartBlockComponent, CartBlockComponent, BlanksFormBlockComponent,
  ExclusiveUrlBlockComponent, FileUploadBlockComponent, PushpayBlockComponent, ThreedCartBlockComponent,
  BlogsBlockComponent, ChatBlockComponent, AccountBlockComponent, ProfileBlockComponent
} from './tileblocks.components';

declare var $: any;

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.css']
})

export class WidgetsComponent implements OnInit {
  @Input() blocks: BlockItem[];
  currentAddIndex: number = -1;
  @ViewChild(TileBlocksDirective) blockSelected: TileBlocksDirective;
  interval: any;
  //opts: ISlimScrollOptions;
  tileBlocks: any[] = [];
  selectedTile: Object = {};
  profileDatas: any[] = [];
  tileCategories: any[] = [];
  //selectedTileCategory: Object = {};
  defaultSelected = -1;
  organizations: any[] = [];
  oid: string = "";
  selectedOrganization: string = "-1";
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  languageList: any[] = [];
  selectedLanguage: string = "en";
  widgetCategories: any[] = [];
  tileTitle: string = "";
  art: string = "/img/tile_default.jpg";
  seletedTileCategory: string = "-1";
  tileNotes: string = "";
  template: string = "-1";
  requiresLogin: boolean = false;
  enableZoom: boolean = false;
  rtl: boolean = false;
  tileIdsUpdate: any[] = [];
  tileIdsDelete: string[] = [];
  tileThemes: any[] = [];
  defaultThemeId: string = "-1";
  private orgChangeDetect: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    elemRef: ElementRef,
    private tileService: TileService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    public utils: Utils
  ) {

    //this.oid = Cookie.get('oid');
  }

  /* Change Tile Category */

  /*tileCategoryChange(tileCat: any) {
    this.selectedTileCategory = tileCat;
  };*/

  /* Set Scroll Options */

  /*setScrollOptions() {
    this.opts = {
      position: 'right',
      barBackground: '#8A8A8A',
      gridBackground: '#D9D9D9',
      barBorderRadius: '10',
      barWidth: '2',
      gridWidth: '1'
    };
  };*/

  /* Checking the block by block type */
  loadWidgets(type: any, blockData: any) {
    var blocks = this.blocks;
    var viewName = "";
    var blkLength = blocks.length;

    if (type === "text") {
      blocks.push(new BlockItem(TextBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "textView";
    }

    if (type === "video") {
      blocks.push(new BlockItem(VideoBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "videoView";
    }

    if (type === "picture") {
      blocks.push(new BlockItem(PictureBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "pictureView";
    }

    if (type === "disqus") {
      blocks.push(new BlockItem(DisqusBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "disqusView";
    }

    if (type === "feed") {
      blocks.push(new BlockItem(SocialFeedBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "feedView";
    }

    if (type === "calendar") {
      blocks.push(new BlockItem(CalendarBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "calendarView";
    }

    if (type === "share") {
      blocks.push(new BlockItem(ShareBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "shareView";
    }

    if (type === "patients") {
      blocks.push(new BlockItem(PatientsBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "patientsView";
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "inquiryView";
    }

    if (type === "survey") {
      blocks.push(new BlockItem(SurveyBlockComponent, new BlockOrganizer(blockData, type, [], this.widgetCategories, this.utils)));
      viewName = "surveyView";
    }

    if (type === "questionnaire") {
      blocks.push(new BlockItem(QuestionnaireBlockComponent, new BlockOrganizer(blockData, type, [], this.widgetCategories, this.utils)));
      viewName = "questionnaireView";
    }

    if (type === "startwrapper") {
      blocks.push(new BlockItem(StartWrapperBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "startWrapperView";
    }

    if (type === "title") {
      blocks.push(new BlockItem(FormTitleBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "formTitleView";
    }

    if (type === "questions") {
      blocks.push(new BlockItem(QuestionsBlockComponent, new BlockOrganizer(blockData, type, [], this.widgetCategories, this.utils)));
      viewName = "questionsView";
    }

    if (type === "attendance") {
      blocks.push(new BlockItem(AttendanceBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "attendanceView";
    }

    if (type === "confirmation") {
      blocks.push(new BlockItem(ConfirmationBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "confirmationView";
    }

    if (type === "password") {
      blocks.push(new BlockItem(PasswordBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "passwordView";
    }

    if (type === "next") {
      blocks.push(new BlockItem(NextBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));

      viewName = "nextView";
    }

    if (type === "formphoto") {
      blocks.push(new BlockItem(FormPhotoComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "formPhotoView";
    }

    if (type === "painlevel") {
      blocks.push(new BlockItem(PainLevelComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "painLevelView";
    }

    if (type === "drawtool") {
      blocks.push(new BlockItem(DrawToolBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "drawToolView";
    }

    if (type === "physician") {
      blocks.push(new BlockItem(PhysicianBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "physicianView";
    }

    if (type === "endwrapper") {
      blocks.push(new BlockItem(EndWrapperBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "endWrapperView";
    }

    if (type === "fill") {
      blocks.push(new BlockItem(FillBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "fillView";
    }

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "notesView";
    }

    if (type === "buttons") {
      this.blocks.push(new BlockItem(ButtonsBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "buttonsView";
    }

    if (type === "contactus") {
      this.blocks.push(new BlockItem(ContactUsBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "contactusView";
    }

    if (type === "placefull") {
      this.blocks.push(new BlockItem(PlacefullBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));

      viewName = "placefullView";
    }

    if (type === "addtocart") {
      this.blocks.push(new BlockItem(AddToCartBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "addToCartView";
    }

    if (type === "cart") {
      this.blocks.push(new BlockItem(CartBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "cartView";
    }

    if (type === "blanksform") {
      this.blocks.push(new BlockItem(BlanksFormBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "blanksFormView";
    }

    if (type === "exclusiveurl") {
      this.blocks.push(new BlockItem(ExclusiveUrlBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "exclusiveUrlView";
    }

    if (type === "fileupload") {
      this.blocks.push(new BlockItem(FileUploadBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "fileUploadView";
    }

    if (type === "pushpay") {
      this.blocks.push(new BlockItem(PushpayBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "pushPayView";
    }

    if (type === "threedcart") {
      this.blocks.push(new BlockItem(ThreedCartBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "threedCartView";
    }

    if (type === "blogs") {
      this.blocks.push(new BlockItem(BlogsBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "blogsView";
    }

    if (type === "chat") {
      this.blocks.push(new BlockItem(ChatBlockComponent, new BlockOrganizer(blockData, type, [], [], this.utils)));
      viewName = "chatView";
    }

    if (type === "account") {
      this.blocks.push(new BlockItem(AccountBlockComponent, new BlockOrganizer(blockData, type, this.profileDatas, [], this.utils)));
      viewName = "accountView";
    }

    if (type === "profile") {
      this.blocks.push(new BlockItem(ProfileBlockComponent, new BlockOrganizer(blockData, type, this.profileDatas, [], this.utils)));
      viewName = "profileView";
    }

    if (blkLength < blocks.length) {
      this.loadComponent(viewName);
    }
  };

  /*languageChange(langCode: string) {
    this.selectedLanguage = langCode;
  };*/

  getViewBlock(view: any, opt: string) {
    let index = this.blockSelected.viewContainerRef.indexOf(view);

    if (opt === "delete") {
      this.blockSelected.viewContainerRef.remove(index);
      this.blocks.splice(0, 1);
      this.currentAddIndex = this.currentAddIndex - 1;

    } else if (opt === "up") {
      var upIdx = index - 1;

      if (upIdx >= 0) {
        this.blockSelected.viewContainerRef.move(view, upIdx);
      }
    } else if (opt === "down") {
      var downIdx = index + 1;

      if (downIdx > 0) {
        this.blockSelected.viewContainerRef.move(view, downIdx);
      }
    }
  };

  resetTile(e: any) {
    if (this.blocks.length > 0) {
      let viewContainerRef = this.blockSelected.viewContainerRef;
      viewContainerRef.clear();
      this.blocks = [];
      this.currentAddIndex = -1;
    }

    this.selectedTile = {};

    if (!this.utils.isNullOrEmpty(e)) {
      this.widgetTileReset(true);
    }
  };

  saveTile(tileObj: Object, deleteId?: string, savedBlocks?: any[]) {
    if (!this.utils.isEmptyObject(tileObj)) {
      this.tileService.saveTile(tileObj)
        .then(resTile => {
          if (!this.utils.isEmptyObject(resTile) && resTile.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(resTile["_id"])) {
            var isNew = tileObj.hasOwnProperty("_id") ? false : true;
            this.tileIdsUpdate = [];
            this.tileIdsDelete = [];
            var obj = {};
            obj[resTile["_id"]] = isNew;
            this.tileIdsUpdate = [obj];

            if (!this.utils.isNullOrEmpty(deleteId) && deleteId !== "-1") {
              this.tileIdsDelete = [deleteId];
            }

            var tileMessage = tileObj.hasOwnProperty("_id") ? "updated" : "saved";
            this.utils.iAlert('success', '', 'Tile ' + tileMessage +' successfully');
            this.assignBlockData(savedBlocks);
          }
        });
    }
  };

  setTile(currTile: Object) {
    if (!this.utils.isEmptyObject(currTile)) {
      this.selectedTile = currTile;
      this.tileTitle = currTile.hasOwnProperty("title") && !this.utils.isNullOrEmpty(currTile["title"]) ? currTile["title"] : "";
      this.tileNotes = currTile.hasOwnProperty("notes") && !this.utils.isNullOrEmpty(currTile["notes"]) ? currTile["notes"] : "";
      this.selectedLanguage = currTile.hasOwnProperty("language") && !this.utils.isNullOrEmpty(currTile["language"]) ? currTile["language"] : "en";
      this.seletedTileCategory = currTile.hasOwnProperty("category") && !this.utils.isNullOrEmpty(currTile["category"]) ? currTile["category"] : "-1";
      this.requiresLogin = currTile.hasOwnProperty("requiresLogin") && !this.utils.isNullOrEmpty(currTile["requiresLogin"]) ? this.utils.convertToBoolean(currTile["requiresLogin"]) : false;
      this.enableZoom = currTile.hasOwnProperty("enableZoom") && !this.utils.isNullOrEmpty(currTile["enableZoom"]) ? this.utils.convertToBoolean(currTile["enableZoom"]) : false;
      this.rtl = currTile.hasOwnProperty("rtl") && !this.utils.isNullOrEmpty(currTile["rtl"]) ? this.utils.convertToBoolean(currTile["rtl"]) : false;
      this.art = currTile.hasOwnProperty("art") && !this.utils.isNullOrEmpty(currTile["art"]) ? currTile["art"] : "/img/tile_default.jpg";
    }
  };

  assignBlockData(savedBlocks: any[]) {
    var currentBlocks = this.blocks;

    for (let i = 0; i < savedBlocks.length; i++) {
      var currSavedBlock = savedBlocks[i];

      if (!this.utils.isEmptyObject(currentBlocks[i]) && currentBlocks[i].hasOwnProperty("block")) {
        currentBlocks[i]["block"]["existingData"] = currSavedBlock;
      }
    }
  };

  /* Arranging the saved tileblocks in order */
  arrangeBlocks(currBlks: any[]) {
    var arrangedBlocks = this.utils.sortArray(currBlks, true, "idx");

    for (let i = 0; i < arrangedBlocks.length; i++) {
      delete arrangedBlocks[i]["idx"];
    }

    return arrangedBlocks;
  };

  getTileObj() {
    var currTileExists = !this.utils.isEmptyObject(this.selectedTile) ? this.selectedTile : {};
    var tile = {};

    if (!this.utils.isEmptyObject(currTileExists)) {
      tile["_id"] = currTileExists["_id"];

      if (currTileExists.hasOwnProperty("notification")) {
        tile["notification"] = currTileExists["notification"];
      }

      if (currTileExists.hasOwnProperty("smart")) {
        tile["smart"] = currTileExists["smart"];
      }
    }

    tile["userId"] = !this.utils.isEmptyObject(currTileExists) && currTileExists.hasOwnProperty("userId") && !this.utils.isNullOrEmpty(currTileExists["userId"]) ? currTileExists["userId"] : "";
    tile["dateCreated"] = !this.utils.isEmptyObject(currTileExists) && currTileExists.hasOwnProperty("dateCreated") ? currTileExists["dateCreated"] : (new Date()).toUTCString();
    tile["title"] = this.tileTitle;
    tile["notes"] = this.tileNotes;
    tile["art"] = this.art;
    tile["organizationId"] = !this.utils.isEmptyObject(currTileExists) && currTileExists.hasOwnProperty("organizationId") ? this.getOrganizationIds(currTileExists["organizationId"]) : [this.selectedOrganization];
    tile["createdOrg"] = !this.utils.isEmptyObject(currTileExists) && currTileExists.hasOwnProperty("createdOrg") ? currTileExists["createdOrg"] : this.selectedOrganization;
    tile["lastUpdatedOn"] = (new Date()).toUTCString();
    tile["type"] = "content";
    tile["template"] = this.template;
    tile["category"] = this.seletedTileCategory;
    var categoryObj = this.seletedTileCategory !== "-1" ? this.getTileCategoryName(this.seletedTileCategory) : "";
    tile["categoryName"] = categoryObj.length > 0 && categoryObj[0].hasOwnProperty("name") ? categoryObj[0]["name"] : "";
    tile["appSettings"] = false;

    tile["requiresLogin"] = this.requiresLogin;
    tile["enableZoom"] = this.enableZoom;
    tile["language"] = this.selectedLanguage;
    tile["rtl"] = this.rtl;

    return tile;
  };

  tileSave(e: any) {
    var tileObj = this.getTileObj();

    if (this.utils.isNullOrEmpty(tileObj["title"])) {
      this.utils.iAlert('error', 'Information', 'You must at least enter a Tile title');
      return false;
    }

    if (tileObj["category"] === "-1") {
      this.utils.iAlert('error', 'Information', 'Please select a category for the Tile');
      return false;
    }

    this.checkTileOrgs(tileObj, (currTileObj, deleteId) => {
      var isBlk = currTileObj.hasOwnProperty("_id") ? false : true;

      this.saveBlocks(isBlk, (blks, isChat) => {
        currTileObj["blocks"] = blks.length > 0 ? blks.map(b => b["_id"]) : [];
        currTileObj["isChat"] = isChat;

        var selectedLanguage = this.selectedLanguage;

        if (currTileObj.hasOwnProperty("_id") && selectedLanguage !== "en") {
          currTileObj[selectedLanguage] = {};
          currTileObj[selectedLanguage]["title"] = this.tileTitle;
          currTileObj[selectedLanguage]["notes"] = this.tileNotes;
          currTileObj[selectedLanguage]["rtl"] = this.rtl;
          delete currTileObj["title"];
          delete currTileObj["notes"];
          delete currTileObj["rtl"];
        }

        this.saveTile(currTileObj, deleteId, blks);
      });
    });
  };

  checkTileOrgs(tile: Object, cb) {
    var deleteId = "-1";

    if (tile.hasOwnProperty("_id")) {
      var id = tile["_id"];
      var orgs = tile["organizationId"];
      var createdOrg = tile["createdOrg"];

      if (orgs.length > 0) {
        this.organizationCheck(createdOrg, orgs, (result1, result2) => {
          if ((result1 === 0 && result2 === 0) || (result1 === 2 && result2 === 2)) {
            var obj2 = !this.utils.isEmptyObject(this.selectedTile) ? this.selectedTile : {};
            var title = this.tileTitle;

            if (title === obj2["title"]) {
              this.utils.iAlert('error', 'Error', 'Please Modify the Tile name');
              return false;
            }

            tile["createdOrg"] = this.selectedOrganization;
            tile["organizationId"] = [this.selectedOrganization];
            delete tile["_id"];

          } else if (result1 === 1 && result2 === 0) {
            var tileId = tile["_id"];
            deleteId = tileId;
            var currOrgs = tile["organizationId"];
            var orgIdx = currOrgs.indexOf(this.selectedOrganization);
            currOrgs.splice(orgIdx, 1);
            var updateData = { "organizationId": currOrgs };
            this.tileService.tileUpdate(tileId, updateData);
            tile["createdOrg"] = this.selectedOrganization;
            tile["organizationId"] = [this.selectedOrganization];
            delete tile["_id"];
          }

          cb(tile, deleteId);
        });
      }
    } else {
      cb(tile, deleteId);
    }
  };

  saveBlocks(isNewBlock: boolean, cb) {
    var currentBlocks = this.blocks;
    var blckObj = new GetBlocks(currentBlocks, this.selectedLanguage, isNewBlock, this.utils);
    var blkDataObjs = blckObj.getBlockDatas();
    var savedBlocks = [];

    if (blkDataObjs["blocks"].length > 0) {
      for (let i = 0; i < blkDataObjs["blocks"].length; i++) {
        var currBlock = blkDataObjs["blocks"][i];

        this.tileService.saveTileBlocks(currBlock, i)
          .then(resBlk => {
            if (!this.utils.isEmptyObject(resBlk) && resBlk.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(resBlk["_id"])) {
              savedBlocks.push(resBlk);

              if (savedBlocks.length === blkDataObjs["blocks"].length) {
                var savedBlks = this.arrangeBlocks(savedBlocks);
                cb(savedBlks, blkDataObjs["isChat"]);
              }
            }
          });
      }
    } else {
      cb([], false);
    }
  };

  getTileCategoryName(id: string) {
    return this.tileCategories.filter(function (cat) {
      return cat["_id"] === id;
    });
  };

  getOrganizationIds(orgId: any) {
    var currOrgIds = this.utils.isArray(orgId) ? orgId : orgId.split(',');
    return currOrgIds;
  };

  /* Getting the tile content datas */
  getTileContent(tileObj: any) {
    if (!this.utils.isEmptyObject(tileObj) && !tileObj.hasOwnProperty("savedUpdated")) {
      this.widgetTileReset();

      if (tileObj.hasOwnProperty("tileCategories")) {
        this.tileCategories = tileObj.tileCategories;
      }

      if (tileObj.hasOwnProperty("orgId")) {
        this.resetWidgetDatas();
        this.selectedOrganization = tileObj.orgId;

        if (this.organizations.length > 0) {
          this.setWidgetDatas();
        }
      }

      if (tileObj.hasOwnProperty("tile")) {
        this.setTile(tileObj.tile);
      }

      if (tileObj.hasOwnProperty("blocks")) {
        this.tileBlocks = tileObj.blocks;

        if (this.tileBlocks.length > 0) {
          for (let i = 0; i < this.tileBlocks.length; i++) {
            var currentBlock = this.tileBlocks[i];
            var type = this.tileBlocks[i].hasOwnProperty("type") ? this.tileBlocks[i].type : "";
            this.loadWidgets(type, currentBlock);
          }
        }
      }
    } else if (!this.utils.isEmptyObject(tileObj) && tileObj.hasOwnProperty("savedUpdated")) {
      this.selectedTile = tileObj.hasOwnProperty("tile") ? tileObj["tile"] : {};
    }
  };

  /* Loading the block components */
  loadComponent(viewName: string) {
    this.currentAddIndex = this.currentAddIndex + 1;
    let adBlock = this.blocks[this.currentAddIndex];

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(adBlock.component);

    let viewContainerRef = this.blockSelected.viewContainerRef;
    //viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    adBlock.block["view"] = componentRef.hostView;
    componentRef.instance[viewName].subscribe(blk => this.getViewBlock(blk.view, blk.opt));

    (<BlockComponent>componentRef.instance).block = adBlock.block;
  };

  /*   Get Organization profile datas    */
  getOrgProfileDatas() {
    this.tileService.getProfileDatas(this.selectedOrganization)
      .then(profOrgDatas => { this.profileDatas = profOrgDatas });
  };

  /* Get widget categories */
  getWidgetCategories() {
    this.tileService.getWidgetCategories(this.oid)
      .then(wdgtCats => { this.widgetCategories = wdgtCats });
  };

  /*   Get Tile Categories datas    */
  /*getTileCategory() {
    this.tileService.getTileCategory(this.selectedOrganization)
      .then(tileCategories => this.tileCategories = tileCategories);
  };*/

  resetWidgetDatas() {
    this.widgetTileReset();
    this.profileDatas = [];
    this.tileCategories = [];
    //this.selectedTileCategory = {};
    this.languageList = [];
    this.widgetCategories = [];
    this.tileThemes = [];
    this.defaultThemeId = "-1";
  };

  widgetTileReset(isNew?: boolean) {
    if (!isNew) {
      this.resetTile("");
    }

    this.tileBlocks = [];
    this.selectedLanguage = "en";
    this.tileTitle = "";
    this.art = "/img/tile_default.jpg";
    this.seletedTileCategory = "-1";
    this.tileNotes = "";
    this.template = this.defaultThemeId;
    this.requiresLogin = false;
    this.enableZoom = false;
    this.rtl = false;
    this.tileIdsUpdate = [];
    this.tileIdsDelete = [];
  };

  setWidgetDatas() {
    this.getOrgProfileDatas();
    this.getWidgetCategories();
    //this.getTileCategory();
  };

  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  getOrganizationName = function (orgs: string[], currentOrg?: string) {
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

  setScrollList() {
    //this.destroyScroll();

    this.mScrollbarService.initScrollbar('#main-widget-container', this.scrollbarOptions);
    this.mScrollbarService.initScrollbar('#main-container-tile-blocks', this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-widget-container");
      this.cms["appDatas"]["scrollList"].push('#main-container-tile-blocks');
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-widget-container", "#main-container-tile-blocks"];
    }
  };

  /*Destroy Scroll for the component elements*/
  destroyScroll() {
    this.cms.destroyScroll(["#main-widget-container", "#main-container-tile-blocks"]);
  };

  getLanguages() {
    if (this.languageList.length === 0) {
      this.tileService.getLanguages()
        .then(langs => {
          this.languageList = langs;
        });
    }
  };

  getThemes(orgId?: string) {
    if (this.tileThemes.length === 0) {
      this.themeService.getThemes("", "", orgId)
        .then(themes => {
          this.tileThemes = themes;
        });
    }
  };

  getWhiteTheme(themeObj: Object) {
    if (!this.utils.isEmptyObject(themeObj)) {
      if (themeObj.hasOwnProperty("name") && !this.utils.isNullOrEmpty(themeObj["name"]) && this.utils.trim(themeObj["name"].toLowerCase()) === "white") {
        this.defaultThemeId = themeObj["_id"];
        this.template = this.defaultThemeId;
      }
    }
  };

  organizationCheck(createdOrg: string, orgs: any[], cb) {
    var orgsMatchChk = orgs.indexOf(this.oid);

    if (orgsMatchChk === -1) {
      var html = '';
      var orgNames = this.getOrganizationName(orgs).split(',');
      html += "<ul style='text-align: left;'>";

      for (let i = 0; i < orgNames.length; i++) {
        html += '<li>' + orgNames[i] + '</li>';
      }

      html += "</ul>";

      this.utils.iQuestions("question", "Warning", "This tile was assigned to the organizations : " + html + ".<br>If you choose to modify it, it will create a new copy in this organization.", "Save as new copy", "Cancel", "", (r) => {
        if (r["resolved"] === 0) {
          cb(0, 0);
        }
      });
    } else if (orgs[0] !== this.selectedOrganization) {
      this.utils.iQuestions("question", "Warning", "This tile was linked originally to <b>" + this.getOrganizationName(orgs[0].split(',')) + "</b>.<br>If you choose to modify it, it will create a new copy.<br>If the original tile is used in one of your Events or Pages, it will be removed. You may use the newly created copy in the Event or page.", "Save and delete original", "Cancel", "", (r) => {
        if (r["resolved"] === 0) {
          cb(1, 0);
        }
      });
    } else if (orgs.length > 1 && orgs[0] === this.selectedOrganization) {
      var html = '';
      var orgNames = this.getOrganizationName(orgs).split(',');
      html += "<ul style='text-align: left;'>";

      for (let i = 0; i < orgNames.length; i++) {
        html += '<li>' + orgNames[i] + '</li>';
      }

      html += "</ul>";

      this.utils.iQuestions("question", "Warning", "Saving this Tile will modify the content in the following organizations:" + html, "Continue", "Cancel", "Save as a copy", (r) => {
        if (r["resolved"] === 0 || r["resolved"] === 2) {
          cb(2, r["resolved"]);
        }
      });
    } else {
      cb(2, 1);
    }
  };

  ngOnInit() {
    //this.setScrollOptions();

    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      if (!this.utils.isArray(this.blocks)) {
        this.blocks = [];
      }

      this.setScrollList();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
      this.selectedOrganization = this.oid;
      this.resetWidgetDatas();
      this.getLanguages();
      this.getThemes(this.selectedOrganization);

      if (this.organizations.length > 0) {
        this.setWidgetDatas();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
