import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockItem } from './block-item';
import { BlockComponent } from './block.component';
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
  BlogsBlockComponent, ChatBlockComponent
} from './tileblocks.components';

import { ISlimScrollOptions } from 'ng2-slimscroll';

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
  opts: ISlimScrollOptions;
  tileBlocks: any[] = [];
  selectedTile: Object = {};

  constructor(private componentFactoryResolver: ComponentFactoryResolver, elemRef: ElementRef) { }

  /* Set Scroll Options */

  setScrollOptions() {
    this.opts = {
      position: 'right',
      barBackground: '#8A8A8A',
      gridBackground: '#D9D9D9',
      barBorderRadius: '10',
      barWidth: '2',
      gridWidth: '1'
    };
  }

  /* Checking the block by block type */

  loadWidgets(type: any, blockData: any) {
    var blocks = this.blocks;
    var viewName = "";

    if (type === "text") {
      blocks.push(new BlockItem(TextBlockComponent, {
        "type": type,
        "blockName": "Editor",
        "data": blockData.hasOwnProperty("data")? blockData.data : { "text": new String("")}
      }));

      viewName = "textView";
    }

    if (type === "video") {
      blocks.push(new BlockItem(VideoBlockComponent, {
        "type": type,
        "blockName": "Upload Video",
        "data": blockData.hasOwnProperty("data")? blockData.data :{
          "caption": "",
          "url": "",
          "videoid": ""
        }
      }));

      viewName = "videoView";
    }

    if (type === "picture") {
      blocks.push(new BlockItem(PictureBlockComponent, {
        "type": type,
        "blockName": "Event Media",
        "data": blockData.hasOwnProperty("data")? blockData.data : {
          "text": new String(""),
          "moderated": "false",
          "rate": "false",
          "vote": "false"
        }
      }));

      viewName = "pictureView";
    }

    if (type === "disqus") {
      blocks.push(new BlockItem(DisqusBlockComponent, {
        "type": type,
        "blockName": "Disqus",
        "data": blockData.hasOwnProperty("data")? blockData.data : {
          "disqus": false
        }
      }));

      viewName = "disqusView";
    }

    if (type === "feed") {
      blocks.push(new BlockItem(SocialFeedBlockComponent, {
        "type": type,
        "blockName": "Social Feed",
        "data": blockData.hasOwnProperty("data")? blockData.data : {
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
      blocks.push(new BlockItem(CalendarBlockComponent, {
        "type": type,
        "blockName": "Calendar",
        "data": blockData.hasOwnProperty("data")? blockData.data : {
          "text": new String("")
        }
      }));

      viewName = "calendarView";
    }

    if (type === "share") {
      blocks.push(new BlockItem(ShareBlockComponent, {
        "type": type,
        "blockName": "Facebook, Twitter & Email Sharing",
        "data": blockData.hasOwnProperty("data")? blockData.data : {
          "facebook": false,
          "twitter": false,
          "email": false
        }
      }));

      viewName = "shareView";
    }

    if (type === "patients") {
      blocks.push(new BlockItem(PatientsBlockComponent, {
        "type": type,
        "blockName": "Patients",
        "data": blockData.hasOwnProperty("data")? blockData.data :{
          "patients": true,
          "text": "Patients"
        }
      }));

      viewName = "patientsView";
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, {
        "type": type,
        "blockName": "Inquiry",
        "data": blockData.hasOwnProperty("data")? blockData.data :{ "email": "", "inquiryText": "" }
      }));
      viewName = "inquiryView";
    }

    if (type === "survey") {
      blocks.push(new BlockItem(SurveyBlockComponent, {
        "type": type, "blockName": "Questionnaire", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "controls": "radio", "multiple": "false", "showInApp": false, "isNote": false, "questions": [""],
          "confirmation": [], "popup": [], "alerts": []
        }
      }));
      viewName = "surveyView";
    }

    if (type === "questionnaire") {
      blocks.push(new BlockItem(QuestionnaireBlockComponent, {
        "type": type, "blockName": "Cascading Questionnaire", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "mandatory": false,
          "questionText": "",
          "inputControlType": "radio",
          "questionType": "single",
          "isNote": false,
          "options": [{
            "option": "",
            "alert": "",
            "confirmation": "",
            "popup": "",
            "subQuestions": []
          }],
          "confirmation": blockData.hasOwnProperty("confirmation")? blockData.confirmation : [],
          "popup": blockData.hasOwnProperty("popup")? blockData.popup : [],
          "alerts": blockData.hasOwnProperty("alerts")? blockData.alerts : []
        }
      }));

      viewName = "questionnaireView";
    }

    if (type === "startwrapper") {
      blocks.push(new BlockItem(StartWrapperBlockComponent, {
        "type": type, "blockName": "Start Wrapper", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "refresh": false, "close": false, "redirectApp": false
        }
      }));

      viewName = "startWrapperView";
    }

    if (type === "title") {
      blocks.push(new BlockItem(FormTitleBlockComponent, {
        "type": type, "blockName": "Form Title", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "titletext": "", "title": false
        }
      }));

      viewName = "formTitleView";
    }

    if (type === "questions") {
      blocks.push(new BlockItem(QuestionsBlockComponent, {
        "type": type, "blockName": "Questions & Answers", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "questions": [""], "mandatory": [false], "answerTypes": ["text"], "notes": [false],
          "category": "", "categoryName": "", "redirectApp": false
        }
      }));

      viewName = "questionsView";
    }

    if (type === "attendance") {
      blocks.push(new BlockItem(AttendanceBlockComponent, {
        "type": type, "blockName": "Attendance", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "title": "", "person": false, "online": false,
          "addMember": false, "addQuestion": "Additional Family members attending (not added from another app)", "options": [], "redirectApp": false
        }
      }));

      viewName = "attendanceView";
    }

    if (type === "confirmation") {
      blocks.push(new BlockItem(ConfirmationBlockComponent, {
        "type": type, "blockName": "Confirmation", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "text": new String(""), "submittext": ""
        }
      }));

      viewName = "confirmationView";
    }

    if (type === "password") {
      blocks.push(new BlockItem(PasswordBlockComponent, {
        "type": type, "blockName": "Password", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "password": false
        }
      }));

      viewName = "passwordView";
    }

    if (type === "next") {
      blocks.push(new BlockItem(NextBlockComponent, {
        "type": type, "blockName": "Next", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "text": "", "tileId": "", "tileTile": "", "type": "tile"
        }
      }));

      viewName = "nextView";
    }

    if (type === "formphoto") {
      blocks.push(new BlockItem(FormPhotoComponent, {
        "type": type, "blockName": "Form Media", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "text": new String(""), "isVideo": false
        }
      }));

      viewName = "formPhotoView";
    }

    if (type === "painlevel") {
      blocks.push(new BlockItem(PainLevelComponent, {
        "type": type, "blockName": "Pain Level", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "painlevel": true, "question": "", "mandatory": false, "level": "image"
        }
      }));

      viewName = "painLevelView";
    }

    if (type === "drawtool") {
      blocks.push(new BlockItem(DrawToolBlockComponent, {
        "type": type, "blockName": "Draw tool", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "drawtool": true, "text": ""
        }
      }));

      viewName = "drawToolView";
    }

    if (type === "physician") {
      blocks.push(new BlockItem(PhysicianBlockComponent, {
        "type": type, "blockName": "Physician", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "isPhysician": true, "mandatory": false, "text": "Physician"
        }
      }));

      viewName = "physicianView";
    }

    if (type === "endwrapper") {
      blocks.push(new BlockItem(EndWrapperBlockComponent, {
        "type": type, "blockName": "End Wrapper", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "text": "", "submitConfirmation": false
        }
      }));

      viewName = "endWrapperView";
    }

    if (type === "fill") {
      blocks.push(new BlockItem(FillBlockComponent, {
        "type": type, "blockName": "Fill-in the blanks", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "text": new String(""),
        }
      }));

      viewName = "fillView";
    }

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, {
        "type": type, "blockName": "Notes", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "notes": true, "allNotes": false
        }
      }));

      viewName = "notesView";
    }

    if (type === "buttons") {
      this.blocks.push(new BlockItem(ButtonsBlockComponent, {
        "type": type, "blockName": "Buttons", "data": blockData.hasOwnProperty("data")? blockData.data : [{ "beforeText": "", "afterText": "" }],
        "alerts": blockData.hasOwnProperty("alerts")? blockData.alerts : []
      }));

      viewName = "buttonsView";
    }

    if (type === "contactus") {
      this.blocks.push(new BlockItem(ContactUsBlockComponent, {
        "type": type, "blockName": "ContactUs", "data": blockData.hasOwnProperty("data")? blockData.data : { "email": "" }
      }));

      viewName = "contactusView";
    }

    if (type === "placefull") {
      this.blocks.push(new BlockItem(PlacefullBlockComponent, {
        "type": type, "blockName": "PlaceFull", "data": blockData.hasOwnProperty("data")? blockData.data : { "text": "" }
      }));

      viewName = "placefullView";
    }

    if (type === "addtocart") {
      this.blocks.push(new BlockItem(AddToCartBlockComponent, {
        "type": type, "blockName": "Add To Cart", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "productName": "", "description": "", "price": "", "currency": "", "textCartButton": "",
          "confirmationMessage": "", "productImage": "", "isProductName": true, "isProductDescription": true,
          "isProductImage": true, "isProductPrice": true
        }
      }));

      viewName = "addToCartView";
    }

    if (type === "cart") {
      this.blocks.push(new BlockItem(CartBlockComponent, {
        "type": type, "blockName": "Cart", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "productTitle": "", "notificationEmail": "", "textConfirmButton": "", "confirmationMessage": ""
        }
      }));

      viewName = "cartView";
    }

    if (type === "blanksform") {
      this.blocks.push(new BlockItem(BlanksFormBlockComponent, {
        "type": type, "blockName": "Blanks Form", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "email": "", "text": new String(""),
          "imageLimit": "", "redirectApp": false
        }
      }));

      viewName = "blanksFormView";
    }

    if (type === "exclusiveurl") {
      this.blocks.push(new BlockItem(ExclusiveUrlBlockComponent, {
        "type": type, "blockName": "URL", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "url": "", "window": false, "iphonewindow": false
        }
      }));

      viewName = "exclusiveUrlView";
    }

    if (type === "fileupload") {
      this.blocks.push(new BlockItem(FileUploadBlockComponent, {
        "type": type, "blockName": "File Upload", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "url": ""
        }
      }));

      viewName = "fileUploadView";
    }

    if (type === "pushpay") {
      this.blocks.push(new BlockItem(PushpayBlockComponent, {
        "type": type, "blockName": "PushPay", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "pushpay": false,
          "url": "",
          "window": false,
          "iphonewindow": false
        }
      }));

      viewName = "pushPayView";
    }

    if (type === "threedcart") {
      this.blocks.push(new BlockItem(ThreedCartBlockComponent, {
        "type": type, "blockName": "3dCart", "data": blockData.hasOwnProperty("data")? blockData.data : {
          "cart": false, "url": "", "window": false, "iphonewindow": false
        }
      }));

      viewName = "threedCartView";
    }

    if (type === "blogs") {
      this.blocks.push(new BlockItem(BlogsBlockComponent, {
        "type": type, "blockName": "Blogs", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "wordPress": false, "wordPressUrl": "",
          "wordPressTitle": "", "wordPressContent": new String("")
        }
      }));

      viewName = "blogsView";
    }

    if (type === "chat") {
      this.blocks.push(new BlockItem(ChatBlockComponent, {
        "type": type, "blockName": "Blogs", "data": blockData.hasOwnProperty("data")? blockData.data :{
          "chat": true, "isPrivate": false
        }
      }));

      viewName = "chatView";
    }

    this.loadComponent(viewName);
  }

  ngOnInit() {
    this.blocks = [];
    this.setScrollOptions();
  }

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
  }

  resetTile(e: any) {
    if (this.blocks.length > 0) {
      let viewContainerRef = this.blockSelected.viewContainerRef;
      viewContainerRef.clear();
      this.blocks = [];
      this.currentAddIndex = -1;
    }
  }

  saveBlocks(e: any) {
    var result = this.blocks;
  };

  getTileContent(tileObj: any) {
    this.resetTile("");
    this.tileBlocks = tileObj.blocks;
    this.selectedTile = tileObj.tile;

    if(this.tileBlocks.length > 0){
      for (let i = 0; i < this.tileBlocks.length; i++) {
        var currentBlock = this.tileBlocks[i];
        var type = this.tileBlocks[i].hasOwnProperty("type")? this.tileBlocks[i].type : ""; 
        this.loadWidgets(type, currentBlock);
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
  }
}
