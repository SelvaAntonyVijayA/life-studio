import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockOrganizer, BlockComponent, BlockItem } from './block-organizer';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
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
  utils: any;
  profileDatas: any[] = [];
  tileCategories: any[] = [];
  selectedTileCategory: Object = {};
  defaultSelected = -1;
  organizations: any[] = [];
  oid: string = "";
  selectedOrganization: string = "-1";
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  languageList: any[] = [];
  selectedLanguage: string = "en";
  widgetCategories: any[] = [];
  private orgChangeDetect: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    elemRef: ElementRef,
    private tileService: TileService,
    private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService
  ) {
    this.utils = Utils;
    //this.oid = Cookie.get('oid');
  }

  /* Change Tile Category */

  tileCategoryChange(tileCat: any) {
    this.selectedTileCategory = tileCat;
  };

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
      blocks.push(new BlockItem(TextBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "textView";
    }

    if (type === "video") {
      blocks.push(new BlockItem(VideoBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "videoView";
    }

    if (type === "picture") {
      blocks.push(new BlockItem(PictureBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "pictureView";
    }

    if (type === "disqus") {
      blocks.push(new BlockItem(DisqusBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "disqusView";
    }

    if (type === "feed") {
      blocks.push(new BlockItem(SocialFeedBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "feedView";
    }

    if (type === "calendar") {
      blocks.push(new BlockItem(CalendarBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "calendarView";
    }

    if (type === "share") {
      blocks.push(new BlockItem(ShareBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "shareView";
    }

    if (type === "patients") {
      blocks.push(new BlockItem(PatientsBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "patientsView";
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "inquiryView";
    }

    if (type === "survey") {
      blocks.push(new BlockItem(SurveyBlockComponent, new BlockOrganizer(blockData, type, [], this.widgetCategories)));
      viewName = "surveyView";
    }

    if (type === "questionnaire") {
      blocks.push(new BlockItem(QuestionnaireBlockComponent, new BlockOrganizer(blockData, type, [], this.widgetCategories)));
      viewName = "questionnaireView";
    }

    if (type === "startwrapper") {
      blocks.push(new BlockItem(StartWrapperBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "startWrapperView";
    }

    if (type === "title") {
      blocks.push(new BlockItem(FormTitleBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "formTitleView";
    }

    if (type === "questions") {
      blocks.push(new BlockItem(QuestionsBlockComponent, new BlockOrganizer(blockData, type, [], this.widgetCategories)));
      viewName = "questionsView";
    }

    if (type === "attendance") {
      blocks.push(new BlockItem(AttendanceBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "attendanceView";
    }

    if (type === "confirmation") {
      blocks.push(new BlockItem(ConfirmationBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "confirmationView";
    }

    if (type === "password") {
      blocks.push(new BlockItem(PasswordBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "passwordView";
    }

    if (type === "next") {
      blocks.push(new BlockItem(NextBlockComponent, new BlockOrganizer(blockData, type)));

      viewName = "nextView";
    }

    if (type === "formphoto") {
      blocks.push(new BlockItem(FormPhotoComponent, new BlockOrganizer(blockData, type)));
      viewName = "formPhotoView";
    }

    if (type === "painlevel") {
      blocks.push(new BlockItem(PainLevelComponent, new BlockOrganizer(blockData, type)));
      viewName = "painLevelView";
    }

    if (type === "drawtool") {
      blocks.push(new BlockItem(DrawToolBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "drawToolView";
    }

    if (type === "physician") {
      blocks.push(new BlockItem(PhysicianBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "physicianView";
    }

    if (type === "endwrapper") {
      blocks.push(new BlockItem(EndWrapperBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "endWrapperView";
    }

    if (type === "fill") {
      blocks.push(new BlockItem(FillBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "fillView";
    }

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "notesView";
    }

    if (type === "buttons") {
      this.blocks.push(new BlockItem(ButtonsBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "buttonsView";
    }

    if (type === "contactus") {
      this.blocks.push(new BlockItem(ContactUsBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "contactusView";
    }

    if (type === "placefull") {
      this.blocks.push(new BlockItem(PlacefullBlockComponent, new BlockOrganizer(blockData, type)));

      viewName = "placefullView";
    }

    if (type === "addtocart") {
      this.blocks.push(new BlockItem(AddToCartBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "addToCartView";
    }

    if (type === "cart") {
      this.blocks.push(new BlockItem(CartBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "cartView";
    }

    if (type === "blanksform") {
      this.blocks.push(new BlockItem(BlanksFormBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "blanksFormView";
    }

    if (type === "exclusiveurl") {
      this.blocks.push(new BlockItem(ExclusiveUrlBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "exclusiveUrlView";
    }

    if (type === "fileupload") {
      this.blocks.push(new BlockItem(FileUploadBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "fileUploadView";
    }

    if (type === "pushpay") {
      this.blocks.push(new BlockItem(PushpayBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "pushPayView";
    }

    if (type === "threedcart") {
      this.blocks.push(new BlockItem(ThreedCartBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "threedCartView";
    }

    if (type === "blogs") {
      this.blocks.push(new BlockItem(BlogsBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "blogsView";
    }

    if (type === "chat") {
      this.blocks.push(new BlockItem(ChatBlockComponent, new BlockOrganizer(blockData, type)));
      viewName = "chatView";
    }

    if (type === "account") {
      this.blocks.push(new BlockItem(AccountBlockComponent, new BlockOrganizer(blockData, type, this.profileDatas)));
      viewName = "accountView";
    }

    if (type === "profile") {
      this.blocks.push(new BlockItem(ProfileBlockComponent, new BlockOrganizer(blockData, type, this.profileDatas)));
      viewName = "profileView";
    }

    if (blkLength < blocks.length) {
      this.loadComponent(viewName);
    }
  };

  languageChange(langCode: string) {
    this.selectedLanguage = langCode;
  };

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
  };

  saveTile(e: any) {
    var result = this.blocks;
  };

  /* Getting the tile content datas */
  getTileContent(tileObj: any) {
    this.resetTile("");

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
      this.selectedTile = tileObj.tile;
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
    this.resetTile("");
    this.tileBlocks = [];
    this.selectedTile = {};
    this.profileDatas = [];
    this.tileCategories = [];
    this.selectedTileCategory = {};
    this.languageList = [];
    this.widgetCategories = [];
    this.selectedLanguage = "en";
    this.selectedTile = {};
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
