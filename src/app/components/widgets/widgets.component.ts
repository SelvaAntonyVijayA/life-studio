import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockItem } from './block-item';
import { BlockComponent } from './block.component';
import { BlockChecker } from './block-checker';
import { Utils } from '../../helpers/utils';
import { TileService } from '../../services/tile.service';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
//import { ISlimScrollOptions } from 'ng2-slimscroll';
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
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(TextBlockComponent, {
        "type": type,
        "blockName": "Editor",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : { "text": new String("") }
      }));

      viewName = "textView";
    }

    if (type === "video") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(VideoBlockComponent, {
        "type": type,
        "blockName": "Upload Video",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "caption": "",
          "url": "",
          "videoid": ""
        }
      }));

      viewName = "videoView";
    }

    if (type === "picture") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(PictureBlockComponent, {
        "type": type,
        "blockName": "Event Media",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": new String(""),
          "moderated": "false",
          "rate": "false",
          "vote": "false"
        }
      }));

      viewName = "pictureView";
    }

    if (type === "disqus") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(DisqusBlockComponent, {
        "type": type,
        "blockName": "Disqus",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "disqus": false
        }
      }));

      viewName = "disqusView";
    }

    if (type === "feed") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(SocialFeedBlockComponent, {
        "type": type,
        "blockName": "Social Feed",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "facebook": false,
          "facebookurl": "",
          "twitter": false,
          "twitterurl": "",
          "instagram": false,
          "instaUserId": "",
          "instaAccessToken": ""
        }
      }));

      viewName = "feedView";
    }

    if (type === "calendar") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(CalendarBlockComponent, {
        "type": type,
        "blockName": "Calendar",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": new String("")
        }
      }));

      viewName = "calendarView";
    }

    if (type === "share") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(ShareBlockComponent, {
        "type": type,
        "blockName": "Facebook, Twitter & Email Sharing",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "facebook": false,
          "twitter": false,
          "email": false
        }
      }));

      viewName = "shareView";
    }

    if (type === "patients") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(PatientsBlockComponent, {
        "type": type,
        "blockName": "Patients",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "patients": true,
          "text": "Patients"
        }
      }));

      viewName = "patientsView";
    }

    if (type === "inquiry") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(InquiryBlockComponent, {
        "type": type,
        "blockName": "Inquiry",
        "data": !this.utils.isEmptyObject(blockData) ? blockData.data : { "email": "", "inquiryText": "" }
      }));
      viewName = "inquiryView";
    }

    if (type === "survey") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(SurveyBlockComponent, {
        "type": type, "blockName": "Questionnaire", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "mandatory": false, "questionText": "",
          "controls": "radio", "multiple": "false", "showInApp": false, "isNote": false, "questions": [""],
          "confirmation": [], "popup": [], "alerts": []
        }
      }));
      viewName = "surveyView";
    }

    if (type === "questionnaire") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(QuestionnaireBlockComponent, {
        "type": type, "blockName": "Cascading Questionnaire", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "mandatory": false,
          "questionText": "",
          "inputControlType": "radio",
          "questionType": "single",
          "isNote": false,
          "options": [{
            "option": "",
            "alert": "",
            "confirmation": "",
            "popup": ""
          }],
          "confirmation": blockData.hasOwnProperty("confirmation") ? blockData.confirmation : [],
          "popup": blockData.hasOwnProperty("popup") ? blockData.popup : [],
          "alerts": blockData.hasOwnProperty("alerts") ? blockData.alerts : []
        }
      }));

      viewName = "questionnaireView";
    }

    if (type === "startwrapper") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(StartWrapperBlockComponent, {
        "type": type, "blockName": "Start Wrapper", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "refresh": false, "close": false, "redirectApp": false
        }
      }));

      viewName = "startWrapperView";
    }

    if (type === "title") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(FormTitleBlockComponent, {
        "type": type, "blockName": "Form Title", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "titletext": "", "title": false
        }
      }));

      viewName = "formTitleView";
    }

    if (type === "questions") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(QuestionsBlockComponent, {
        "type": type, "blockName": "Questions & Answers", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "questions": [""], "mandatory": [false], "answerTypes": ["text"], "notes": [false],
          "category": "", "categoryName": "", "redirectApp": false
        }
      }));

      viewName = "questionsView";
    }

    if (type === "attendance") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(AttendanceBlockComponent, {
        "type": type, "blockName": "Attendance", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "title": "", "person": false, "online": false,
          "addMember": false, "addQuestion": "Additional Family members attending (not added from another app)", "options": [], "redirectApp": false
        }
      }));

      viewName = "attendanceView";
    }

    if (type === "confirmation") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(ConfirmationBlockComponent, {
        "type": type, "blockName": "Confirmation", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": new String(""), "submittext": ""
        }
      }));

      viewName = "confirmationView";
    }

    if (type === "password") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(PasswordBlockComponent, {
        "type": type, "blockName": "Password", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "password": false
        }
      }));

      viewName = "passwordView";
    }

    if (type === "next") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(NextBlockComponent, {
        "type": type, "blockName": "Next", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": "", "tileId": "", "tileTile": "", "type": "tile"
        }
      }));

      viewName = "nextView";
    }

    if (type === "formphoto") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(FormPhotoComponent, {
        "type": type, "blockName": "Form Media", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": new String(""), "isVideo": false
        }
      }));

      viewName = "formPhotoView";
    }

    if (type === "painlevel") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(PainLevelComponent, {
        "type": type, "blockName": "Pain Level", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "painlevel": true, "question": "", "mandatory": false, "level": "image"
        }
      }));

      viewName = "painLevelView";
    }

    if (type === "drawtool") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(DrawToolBlockComponent, {
        "type": type, "blockName": "Draw tool", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "drawtool": true, "text": ""
        }
      }));

      viewName = "drawToolView";
    }

    if (type === "physician") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(PhysicianBlockComponent, {
        "type": type, "blockName": "Physician", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "isPhysician": true, "mandatory": false, "text": "Physician"
        }
      }));

      viewName = "physicianView";
    }

    if (type === "endwrapper") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(EndWrapperBlockComponent, {
        "type": type, "blockName": "End Wrapper", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": "", "submitConfirmation": false
        }
      }));

      viewName = "endWrapperView";
    }

    if (type === "fill") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      blocks.push(new BlockItem(FillBlockComponent, {
        "type": type, "blockName": "Fill-in the blanks", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "text": new String(""),
        }
      }));

      viewName = "fillView";
    }

    if (type === "notes") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(NotesBlockComponent, {
        "type": type, "blockName": "Notes", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "notes": true, "allNotes": false
        }
      }));

      viewName = "notesView";
    }

    if (type === "buttons") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(ButtonsBlockComponent, {
        "type": type, "blockName": "Buttons", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : [{ "beforeText": "", "afterText": "" }],
        "alerts": blockData.hasOwnProperty("alerts") ? blockData.alerts : []
      }));

      viewName = "buttonsView";
    }

    if (type === "contactus") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(ContactUsBlockComponent, {
        "type": type, "blockName": "ContactUs", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : { "email": "" }
      }));

      viewName = "contactusView";
    }

    if (type === "placefull") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(PlacefullBlockComponent, {
        "type": type, "blockName": "PlaceFull", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : { "text": "" }
      }));

      viewName = "placefullView";
    }

    if (type === "addtocart") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(AddToCartBlockComponent, {
        "type": type, "blockName": "Add To Cart", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "productName": "", "description": "", "price": "", "currency": "", "textCartButton": "",
          "confirmationMessage": "", "productImage": "", "isProductName": true, "isProductDescription": true,
          "isProductImage": true, "isProductPrice": true
        }
      }));

      viewName = "addToCartView";
    }

    if (type === "cart") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(CartBlockComponent, {
        "type": type, "blockName": "Cart", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "productTitle": "", "notificationEmail": "", "textConfirmButton": "", "confirmationMessage": ""
        }
      }));

      viewName = "cartView";
    }

    if (type === "blanksform") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(BlanksFormBlockComponent, {
        "type": type, "blockName": "Blanks Form", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "email": "", "text": new String(""),
          "imageLimit": "", "redirectApp": false
        }
      }));

      viewName = "blanksFormView";
    }

    if (type === "exclusiveurl") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(ExclusiveUrlBlockComponent, {
        "type": type, "blockName": "URL", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "url": "", "window": false, "iphonewindow": false
        }
      }));

      viewName = "exclusiveUrlView";
    }

    if (type === "fileupload") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(FileUploadBlockComponent, {
        "type": type, "blockName": "File Upload", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "url": ""
        }
      }));

      viewName = "fileUploadView";
    }

    if (type === "pushpay") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(PushpayBlockComponent, {
        "type": type, "blockName": "PushPay", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "pushpay": false,
          "url": "",
          "window": false,
          "iphonewindow": false
        }
      }));

      viewName = "pushPayView";
    }

    if (type === "threedcart") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(ThreedCartBlockComponent, {
        "type": type, "blockName": "3dCart", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "cart": false, "url": "", "window": false, "iphonewindow": false
        }
      }));

      viewName = "threedCartView";
    }

    if (type === "blogs") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(BlogsBlockComponent, {
        "type": type, "blockName": "Blogs", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "wordPress": false, "wordPressUrl": "",
          "wordPressTitle": "", "wordPressContent": new String("")
        }
      }));

      viewName = "blogsView";
    }

    if (type === "chat") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData) : {};

      this.blocks.push(new BlockItem(ChatBlockComponent, {
        "type": type, "blockName": "Blogs", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "chat": true, "isPrivate": false
        }
      }));

      viewName = "chatView";
    }

    if (type === "account") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData, this.profileDatas) : {};

      this.blocks.push(new BlockItem(AccountBlockComponent, {
        "type": type, "blockName": "Connection Card", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "connectionCard": this.connectData("account"), "submember": []
        }, "profileData": this.profileDatas
      }));

      viewName = "accountView";
    }

    if (type === "profile") {
      blockData = this.checkBlockExists(blockData) ? new BlockChecker(blockData, this.profileDatas) : {};

      this.blocks.push(new BlockItem(ProfileBlockComponent, {
        "type": type, "blockName": "Profile", "data": !this.utils.isEmptyObject(blockData) ? blockData.data : {
          "profile": this.connectData("profile")
        }, "profileData": this.profileDatas
      }));

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
  };

  saveBlocks(e: any) {
    var result = this.blocks;
  };

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

  connectData(type: string) {
    var profileData = this.profileDatas.length > 0 ? this.profileDatas.map(x => Object.assign({}, x)) : [];

    if (type === "account") {
      profileData.push({
        required: false,
        assigned: false,
        name: "Add Family Member ?",
        tag: "addMember",
        type: "addMember"
      });
    }

    if (profileData.length > 0) {
      for (let i = 0; i < profileData.length; i++) {
        var currData = profileData[i];
        profileData[i]["assigned"] = currData.hasOwnProperty("required") && currData.required ? true : false;
      }
    }

    return profileData;
  };

  checkBlockExists(blk: any) {
    var blkResult = false;

    if (typeof blk === "object" && blk.hasOwnProperty("data")) {
      blkResult = true;
    }

    return blkResult;
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
      .then(profOrgDatas => this.profileDatas = profOrgDatas);
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
    this.selectedLanguage = "en";
  };

  setWidgetDatas() {
    this.getOrgProfileDatas();
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
