import { Component, EventEmitter, OnInit, forwardRef, Input, SkipSelf, ViewContainerRef, PipeTransform, Pipe, ComponentFactoryResolver, ViewChild, ElementRef } from '@angular/core';
import { BlockComponent } from './block-checker';
import { WidgetsComponent } from './widgets.component';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'block-controls',
  outputs: ["blockView"],
  template: `<div style="float:left;" class="drag_cursor"><span class="widgetstext">{{block.blockName}}</span></div>
             <div class="tigger_btn"><span class="glyphicon glyphicon-off"></span></div>
             <div class="tigger_btn" (click)="getBlock(block.view, 'delete')" title="Remove"><span class="glyphicon glyphicon-remove"></span></div>
             <div class="tigger_btn" (click)="getBlock(block.view, 'down')" title="MoveDown"><span class="glyphicon glyphicon-arrow-down"></span></div>
             <div class="tigger_btn" (click)="getBlock(block.view, 'up')" title="MoveUp"><span style="margin-top:-1px;" class="glyphicon glyphicon-arrow-up"></span></div>
             <div style="display:none" id="divRedirectBackToApp" class="redirect-app-submit"><span class="redirect-back-app">Redirect back to app </span></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class BlockControls {
  @Input() block: any;

  blockView = new EventEmitter<any>();
  view: any;

  getBlock(view: any, opt: string) {
    var blk = { "view": view, "opt": opt }
    this.blockView.emit(blk)
  }
};

@Component({
  selector: 'text-block',
  outputs: ["textView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getText($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel text_panel'>
             <div class="row text_main_content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class TextBlockComponent implements BlockComponent {
  @Input() block: any;

  textView = new EventEmitter<any>();

  getText(view: any) {
    this.textView.emit(view);
  };
};

@Component({
  selector: 'video-block',
  outputs: ["videoView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getVideo($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel video_panel'>
             <input [(ngModel)]="block.data.caption" class="form-control input-sm video_caption" type="text" placeholder="Video Caption">
             <button class="btn btn-warning btn-xs btn_video_upload">Upload</button>
             <input [(ngModel)]="block.data.url" class="form-control input-sm video_url" type="text" placeholder="Video URL" [disabled]="checkDisabled()">
             <div *ngIf="block.data?.url" class="row main_video_content">
             <iframe [src]="block.data.url | safe" width="420" height="315" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class VideoBlockComponent implements BlockComponent {
  @Input() block: any;

  constructor(public sanitizer: DomSanitizer) { }

  videoView = new EventEmitter<any>();

  getVideo(view: any) {
    this.videoView.emit(view);
  };

  checkDisabled(e: any) {
    return this.block.data.url !== "" && this.block.data.url !== null && typeof this.block.data.url !== "undefined" ? true : false;
  }
};

@Component({
  selector: 'picture-block',
  outputs: ["pictureView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getPicture($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel picture_panel'>
             <div class="row picture_main_content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PictureBlockComponent implements BlockComponent {
  @Input() block: any;

  pictureView = new EventEmitter<any>();

  getPicture(view: any) {
    this.pictureView.emit(view);
  };
};

@Component({
  selector: 'disqus-block',
  outputs: ["disqusView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getDisqus($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel disqus_panel'>
             <div class="input-group input-group-sm disqus_main_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.disqus" [(ngModel)]="block.data.disqus" type="checkbox"></span>
             <span class="form-control">Enable disqus</span>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class DisqusBlockComponent implements BlockComponent {
  @Input() block: any;

  disqusView = new EventEmitter<any>();

  getDisqus(view: any) {
    this.disqusView.emit(view);
  };
};

@Component({
  selector: 'social-feed-block',
  outputs: ["feedView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getFeed($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel feed_panel'>
             <div class="input-group input-group-sm feed_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.facebook" [(ngModel)]="block.data.facebook" class="facebook" type="checkbox"></span>
             <input [(ngModel)]="block.data.facebookurl" type="text" placeholder="Facebook feed url" class="form-control"></div>
             <div class="input-group input-group-sm feed_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.twitter" [(ngModel)]="block.data.twitter" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.twitterurl" placeholder="Twitter feed url" value="" class="form-control"></div>
             <div class="input-group input-group-sm feed_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.instagram" [(ngModel)]="block.data.instagram" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.instaUserId" placeholder="Instagram User Id" value="" class="form-control">
             <input type="text" [(ngModel)]="block.data.instaAccessToken" placeholder="Instagram Access Token" value="" class="form-control"></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class SocialFeedBlockComponent implements BlockComponent {
  @Input() block: any;

  feedView = new EventEmitter<any>();

  getFeed(view: any) {
    this.feedView.emit(view);
  };
};

@Component({
  selector: 'calendar-block',
  outputs: ["calendarView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getCalendar($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel calendar_panel'>
             <div class="row calendar_main_content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class CalendarBlockComponent implements BlockComponent {
  @Input() block: any;

  calendarView = new EventEmitter<any>();

  getCalendar(view: any) {
    this.calendarView.emit(view);
  };
};

@Component({
  selector: 'share-block',
  outputs: ["shareView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getShare($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel share_panel'>
             <p style="font-size: 11px; margin-left: 9px; float: left;">It is not recommended that Forms be shared.  If shared, forms may be filled from Facebook or Twitter or Email.</p>
             <div class="input-group input-group-sm main_share_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.facebook" [(ngModel)]="block.data.facebook" type="checkbox"></span>
             <span class="form-control"> Facebook </span></div>
             <div class="input-group input-group-sm main_share_content">
             <span class="input-group-addon">
             <input value="true" [checked]="block.data.twitter" [(ngModel)]="block.data.twitter" type="checkbox"></span><span class="form-control"> Twitter </span></div>
             <div class="input-group input-group-sm main_share_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.email" [(ngModel)]="block.data.email" type="checkbox">
             </span><span class="form-control"> Email </span></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ShareBlockComponent implements BlockComponent {
  @Input() block: any;

  shareView = new EventEmitter<any>();

  getShare(view: any) {
    this.shareView.emit(view);
  };
};

@Component({
  selector: 'patients-block',
  outputs: ["patientsView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getPatients($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel patients_panel'>
             <div class="input-group input-group-sm patients_content">
             <span class="input-group-addon">
             <input disabled="true"  value="true" [checked]="block.data.patients" [(ngModel)]="block.data.patients" type="checkbox">
             </span>
             <input type="text" placeholder="Patients" [(ngModel)]="block.data.text" class="form-control"> </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PatientsBlockComponent implements BlockComponent {
  @Input() block: any;

  patientsView = new EventEmitter<any>();

  getPatients(view: any) {
    this.patientsView.emit(view);
  };
};

@Component({
  selector: 'inquiry-block',
  outputs: ["inquiryView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">
             <block-controls (blockView)="getInquiry($event)" [(block)]= "block"></block-controls></div>
             <div class="ili-panel inquiry_panel">
             <span class="txt-email-notes">Separate multiple email addresses with a comma followed by a space</span>
             <div class="confirmation_text_block">
             <input type="text" placeholder="To email address" id="email" [(ngModel)]="block.data.email" class="form-control input-sm url_block_url">
             </div>
             <div class="confirmation_text_block">
             <input [(ngModel)]="block.data.inquiryText" type="text" placeholder="Type your inquiry here" id="inquiry-text" value="" class="form-control input-sm url_block_url">
             </div></div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class InquiryBlockComponent implements BlockComponent {
  @Input() block: any;
  inquiryView = new EventEmitter<any>();

  getInquiry(view: any) {
    this.inquiryView.emit(view);
  };
};

@Component({
  selector: 'survey-block',
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getSurvey($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel survey_panel'>
             <p class='text_header_content'>This widget allows you to add one or multiple questions, with one or more possible replies, with the choice of showing results in the app in real time.
             It can be used for Polls, Surveys, Votes, Requests to volunteer, etc.</p>
             <b style='float: left;margin-left:11px;'>*</b>
             <input value="true" [checked]="block.data.mandatory" [(ngModel)]="block.data.mandatory" style='margin-right:.5%; float:left;' title='Field is mandatory'  class='question-survey-md' type='checkbox'>
             <input type='text' class='form-control input-sm survey_question_text' [(ngModel)]="block.data.questionText" placeholder='Type question or text here '/>
             <div class="row control_survey">
             <span class="decription-survey">User can select</span>
             <div class="survey_controls">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input #ctrlSingle (change)="controlChange(ctrlSingle.value)" value="false" [(ngModel)]="block.data.multiple" type="radio" class="ques-one" name="optradio">One Answer</label>
             <label style="font-size: 11px;" class="radio-inline"><input #ctrlMultiple (change)="controlChange(ctrlMultiple.value)" value="true" [(ngModel)]="block.data.multiple" type="radio" class="ques-multiple" name="optradio">Multiple Answers</label></form>
             </div>
             <div *ngIf="block.data!.multiple && block.data.multiple === 'false'" class="survey-opts">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="radio" [(ngModel)]="block.data.controls" type="radio" class="ques-radio" name="optradio">Radio Button</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="dropdown" [(ngModel)]="block.data.controls" type="radio" class="ques-dropdown" name="optradio">Dropdown</label></form>
             </div>
             <div class="row control-app"><label style="font-size: 11px;" class="checkbox-inline">
             <input value="true" [checked]="block.data.showInApp" [(ngModel)]="block.data.showInApp" class="chk-results" type="checkbox">Show results in app</label>
             <label style="font-size: 11px;" class="checkbox-inline">
             <input value="true" [checked]="block.data.isNote" [(ngModel)]="block.data.isNote" class="enable-note" type="checkbox">Take Notes</label>
             </div></div>
             <div class="survey-option-btn">
             <button (click)="addOption($event)" class="btn btn-questionnaire btn-info btn-xs btn-add-text-box">Add Option</button>
             </div>
             <div *ngFor="let question of block.data.questions; let i = index; trackBy:trackByIndex" class="row survey_text_row">
             <span class="options-count">{{i + 1}}.</span>
             <input [(ngModel)]="block.data.questions[i]" type="text" class="form-control input-sm survey_option_box"  placeholder="Type option here" />
             <img class="delete-quest-option" (click)="removeOption(question)" src="/img/close_bg.png">
             </div>
             </div>
             <div class="row survey_add_alert">
             <button (click)="addConfirm($event)" class="btn btn-info btn-xs survey-confirmation" style="display: block;">Add Confirmation</button>
             <button (click)="addAlert($event)" class="btn btn-ques-alert btn-info btn-xs">Add Alert</button>
             <button (click)="addPopup($event)" class="btn btn-popup-alert btn-info btn-xs">Pop Up</button>
             </div>
             <div *ngIf="block.data.alerts.length > 0" class="ili-panel survey_panel">
             <div  *ngFor="let alrt of block.data.alerts; let i = index; trackBy:trackByIndex" class="row ques_alert_row">
             <span class="ques-alert-count">{{i + 1}}.</span>
             <input type="text" [(ngModel)]="block.data.alerts[i]" class="form-control input-sm ques_alert_box" placeholder="Type email address to receive an alert when corresponding option is selected"></div>
             </div>
             <span *ngIf="block.data.popup.length > 0" class="txt-email-notes txt-popup">PopUp note for Selected Option</span>
             <div  *ngFor="let pp of block.data.popup; let i = index; trackBy:trackByIndex" style="margin-top: 8px;" class="row">
             <div style="width:98%; margin-top: 7px;" class="col-md-11">
             <div style="float:left; width:2.2%;">{{i + 1}}.</div>
             <div style="float: left; width: 97.5%;"><ckeditor [(ngModel)]="block.data.popup[i]"></ckeditor></div>
             </div>
             </div>
             <span *ngIf="block.data.confirmation.length > 0" class="txt-email-notes txt-popup">Confirmation for Selected Option</span>
             <div *ngFor="let cc of block.data.confirmation; let i = index; trackBy:trackByIndex" style="margin-top: 8px;" class="row">
             <div style="width:98%; margin-top: 7px;" class="col-md-11">
             <div style="float:left; width:2.2%;">{{i + 1}}.</div>
             <div style="float: left; width: 97.5%;"><ckeditor [(ngModel)]="block.data.confirmation[i]"></ckeditor></div>
             </div>
             </div>
             </div>`,
  outputs: ["surveyView"],
  styleUrls: ['./tileblocks.component.css']
})

export class SurveyBlockComponent implements BlockComponent {
  @Input() block: any;

  surveyView = new EventEmitter<any>();

  addOption(e: any) {
    this.block.data.questions.push("");

    var popLength = this.block.data.popup.length;
    var alertsLength = this.block.data.alerts.length;
    var confirmLength = this.block.data.confirmation.length;

    if (popLength > 0) {
      this.addPopup("");
    }

    if (alertsLength > 0) {
      this.addAlert("");
    }

    if (confirmLength > 0) {
      this.addConfirm("");
    }
  };

  controlChange(isMultiple: any) {
    if (isMultiple == "true") {
      this.block.data.showInApp = false;
      this.block.data.isNote = false;
    }
  };

  addPopup(e: any) {
    var quesLength = this.block.data.questions.length;
    var popLength = this.block.data.popup.length;


    if (quesLength > popLength) {
      var popToAppend = quesLength - popLength;
      var contentValue = new String("");

      for (let i = 1; i <= popToAppend; i++) {
        this.block.data.popup.push(contentValue);
      }
    }
  };

  addAlert(e: any) {
    var quesLength = this.block.data.questions.length;
    var alertsLength = this.block.data.alerts.length;

    if (quesLength > alertsLength) {
      var alertsToAppend = quesLength - alertsLength;

      for (let i = 1; i <= alertsToAppend; i++) {
        this.block.data.alerts.push("");
      }
    }
  };

  addConfirm(e: any) {
    var quesLength = this.block.data.questions.length;
    var confirmLength = this.block.data.confirmation.length;

    if (quesLength > confirmLength) {
      var confirmToAppend = quesLength - confirmLength;

      for (let i = 1; i <= confirmToAppend; i++) {
        this.block.data.confirmation.push("content");
      }
    }
  };

  removeOption(opt: any) {
    let index: number = this.block.data.questions.indexOf(opt);

    if (index !== -1 && this.block.data.questions.length > 1) {
      this.block.data.questions.splice(index, 1);
      this.block.data.popup.splice(index, 1);
      this.block.data.alerts.splice(index, 1);
      this.block.data.confirmation.splice(index, 1);
    }
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  getSurvey(view: any) {
    this.surveyView.emit(view);
  };
};

@Component({
  selector: 'questionnaire-block',
  outputs: ["questionnaireView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getQuestionnaire($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel cc_ques_panel'>
             <p class="cc_text_header_content">This widget allows you to add one or multiple questions, with one or more possible replies, with the choice of showing results in the app in real time. It can be used for Polls, Surveys, Votes, Requests to volunteer, etc.</p>
             <div class="cc-questions-block">
             <b style="float: left;margin-left:11px;">*</b>
             <input value="true" [checked]="block.data.mandatory" [(ngModel)]="block.data.mandatory" title="Field is mandatory" class="cc-question-survey-md" type="checkbox">
             <input type="text" [(ngModel)]="block.data.questionText" class="form-control input-sm cc_questionare_text" value="" placeholder="Type question or text here ">
             <button (click)="addOption($event)" class="btn btn-info btn-xs cc-btn-add-text-box">Add Option</button></div>
             <div class="row cc-questionare-row">
             <span class="cc-decription-questionare">User can select</span>
             <div class="cc_questionnaire_controls">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="single" [(ngModel)]="block.data.questionType" type="radio" class="cc-ques-one" name="optradio">One Answer</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="multiple" [(ngModel)]="block.data.questionType" type="radio" class="cc-ques-multiple" name="optradio">Multiple Answers</label></form>
             </div>
             <input title="Take Notes when filling forms in the studio" type="checkbox" class="checkbox cc-chk-enable-note">
             <span title="Take Notes when filling forms in the studio" class="cc-take-notes">Take Notes</span>
             <div *ngIf="block.data.questionType.indexOf('single') !== -1" class="cc-ques-opts">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="radio" [(ngModel)]="block.data.inputControlType" type="radio" class="cc-ques-radio" name="optradio">Radio Button</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="dropdown" [(ngModel)]="block.data.inputControlType" type="radio" class="cc-ques-dropdown" name="optradio">Dropdown</label></form>
             </div>
             </div>
             <div *ngFor="let opt of block.data.options; let i = index; trackBy:trackByIndex" class="row cc-options-main-row">
             <div class="cc-options-row">
             <span class="options-count">{{i + 1}}.</span>
             <input type="text" [(ngModel)]="block.data.options[i].option" class="form-control input-sm cc_survey_option_box" value="" placeholder="Type option here">
             <img (click)="removeOption(opt)"  class="cc-delete-quest-option" src="/img/close_bg.png">
             <img width="19" title="Add Question" (click)="addSubOption(opt)" class="cc-delete-quest-option" src="/img/add_sub_questionnaire.png">
             <img width="19" title="Add Textbox" class="cc-delete-quest-option" src="/img/add_sub_entry.png"></div>
             <questionnaire-sub-option [questionWidth]="499" [optionWidth]="486" [isLevel]="true" (removeSubLevel)="deleteLevel($event)" [levelIndex]="1" [currentIndex]="subIndex" [parentIndex]="i" [subOption]="subOpt" *ngFor="let subOpt of opt?.subQuestions; let subIndex = index"> 
             </questionnaire-sub-option>
             </div>
             </div>
             <div class="row cc_ques_add_alert">
             <button (click)="addConfirm($event)" class="btn btn-info btn-xs survey-confirmation" style="display: block;">Add Confirmation</button>
             <button (click)="addAlert($event)" class="btn btn-ques-alert btn-info btn-xs">Add Alert</button>
             <button (click)="addPopup($event)" class="btn btn-popup-alert btn-info btn-xs">Pop Up</button>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class QuestionnaireBlockComponent implements BlockComponent {
  @Input() block: any;
  questionnaireView = new EventEmitter<any>();

  getQuestionnaire(view: any) {
    this.questionnaireView.emit(view);
  };

  addOption(e: any) {
    var optData = {
      "option": "",
      "alert": "",
      "confirmation": "",
      "popup": ""
    };

    this.block.data.options.push(optData);
  };

  addSubOption(data: any) {
    if (!data.hasOwnProperty("subQuestions")) {
      data["subQuestions"] = [];
    }

    data["subQuestions"].push({
      "type": "questions",
      "questionText": "",
      "questionType": "single",
      "inputControlType": "radio",
      "options": [{ "option": "" }, { "option": "" }]
    });
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  deleteLevel(level: any) {
    this.block.data.options[level.parentIndex].subQuestions.splice(level.currentIndex, 1);
  };

  removeOption(option: any) {
    let index: number = this.block.data.options.indexOf(option);

    if (index !== -1 && this.block.data.options.length >= 2) {
      this.block.data.options.splice(index, 1);
    }
  };
};

@Component({
  selector: 'questionnaire-sub-option',
  outputs: ["removeSubLevel"],
  template: `<div class="row cc-options-sub-row">
             <div class="cc-options-sub-questionaire">
             <span class="cc-sub-question-no">{{getLevelIndex()}}.{{getAlphaLetter(currentIndex)}}</span>
             <input [style.width]="questionWidth + 'px'" type="text" [(ngModel)]="subOption.questionText" class="form-control input-sm cc-sub-questionaire" placeholder="Type question or text here ">
             <button (click)="addOption($event)" class="btn btn-info btn-xs cc-sub-add-options">Add Option</button>
             <img (click)="deleteSubLevel($event)" class="cc-delete-quest-option" src="/img/close_bg.png">
             <div class="cc-sub-questionare-options">
             <span class="cc-sub-questionare-decription">User can select</span>
             <div class="cc_sub_questionnaire_controls">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="single" [(ngModel)]="subOption.questionType" type="radio" class="cc-ques-one" name="optradio">One Answer</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="multiple" [(ngModel)]="subOption.questionType"  type="radio" class="cc-ques-multiple" name="optradio">Multiple Answers</label></form>
             </div>
             <div class="cc-sub-ques-opts">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="radio" [(ngModel)]="subOption.inputControlType" type="radio" class="cc-ques-radio" name="optradio">Radio Button</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="dropdown" [(ngModel)]="subOption.inputControlType" type="radio" class="cc-ques-dropdown" name="optradio">Dropdown</label></form>
             </div>
             </div>
             <div *ngFor="let subMain of subOption.options; let opI = index; trackBy:trackByIndex" class="row cc-sub-questions-row">
             <div class="cc-sub-ques-list-input">
             <input [style.width]="optionWidth + 'px'" [(ngModel)]="subOption.options[opI]!.option" type="text" class="form-control input-sm cc_ques_option_box" placeholder="Type option here"> 
             <img (click)="removeOption(subMain)" class="cc-delete-quest-option" src="/img/close_bg.png">
             <img *ngIf="isLevel" width="19" title="Add Question" (click)="addSubOption(subMain)" class="cc-delete-quest-option" src="/img/add_sub_questionnaire.png">
             <img *ngIf="isLevel" width="19" title="Add Textbox" class="cc-delete-quest-option" src="/img/add_sub_entry.png"></div>
             <questionnaire-sub-option [questionWidth]="461" [optionWidth]="460" [isLevel]="false" (removeSubLevel)="deleteLevel($event)" [levelIndex]="2" [currentIndex]="subIndex" [parentIndex]="opI" [subOption]="subOpt" *ngFor="let subOpt of subOption.options[opI]?.subQuestions; let subIndex = index"> 
             </questionnaire-sub-option>
             </div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class QuestionnaireSubOptionComponent implements BlockComponent {
  @Input() block: any;
  @Input('subOption') subOption: any;
  @Input('parentIndex') parentIndex: number;
  @Input('currentIndex') currentIndex: number;
  @Input('questionWidth') questionWidth: any;
  @Input('optionWidth') optionWidth: any;
  @Input('levelIndex') levelIndex: number;
  @Input('isLevel') isLevel: boolean;
  removeSubLevel = new EventEmitter<any>();

  getAlphaLetter(i: number) {
    return (i >= 26 ? this.getAlphaLetter((i / 26 >> 0) - 1) : '') + 'abcdefghijklmnopqrstuvwxyz'[i % 26 >> 0];
  };

  addOption(e: any) {
    var optionObj = { "option": "" };
    this.subOption.options.push(optionObj);
  };

  addSubOption(option: any) {
    if (!option.hasOwnProperty("subQuestions")) {
      option["subQuestions"] = [];
    }

    option["subQuestions"].push({
      "type": "questions",
      "questionText": "",
      "questionType": "single",
      "inputControlType": "radio",
      "options": [{ "option": "" }, { "option": "" }]
    });
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  getLevelIndex() {
    var idx = "i";

    if (this.levelIndex == 2) {
      idx = idx + "i";
    }

    return idx;
  };

  deleteSubLevel() {
    var level = { "parentIndex": this.parentIndex, "currentIndex": this.currentIndex };
    this.removeSubLevel.emit(level);
  };

  deleteLevel(level: any) {
    this.subOption.options[level.parentIndex].subQuestions.splice(level.currentIndex, 1);
  };

  removeOption(option: any) {
    let index: number = this.subOption.options.indexOf(option);

    if (index !== -1 && this.subOption.options.length >= 2) {
      this.subOption.options.splice(index, 1);
    }
  };
};

@Component({
  selector: 'startWrapper-block',
  outputs: ["startWrapperView"],
  template: `<div class="page_block tile_block wrapper_block">
             <div class="row wrapper_row content_buttons wrapper-row-refresh">
             <block-controls (blockView)="getStartWrapper($event)" [(block)]= "block"></block-controls>
             <div class="refresh-assign-group">
             <label class="lbl-txt-clear-fields">Clear Fields after each submit</label>
             <input value="true" [checked]="block.data.refresh" [(ngModel)]="block.data.refresh" class="refresh_form" style="margin-top:1px;" type="checkbox" title="Check this box if this form should be cleared every time the end-user enters this tile.">
             </div>
             <div class="refresh-assign-group">
             <label class="lbl-txt-clear-fields">Clear and Close the Form</label>
             <input  value="true" [checked]="block.data.close" [(ngModel)]="block.data.close" class="close_form" type="checkbox" title="Check this box if this form should be cleared every time the end-user enters this tile and it will close the form.">
             </div>
             <div class="main-wrapper-text">
             <label class="wrapper_start">Start wrapping Form Widgets in one form</label></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class StartWrapperBlockComponent implements BlockComponent {
  @Input() block: any;

  startWrapperView = new EventEmitter<any>();

  getStartWrapper(view: any) {
    this.startWrapperView.emit(view);
  };
};

@Component({
  selector: 'formTitle-block',
  outputs: ["formTitleView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getFormTitle($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel form_title_panel">
             <div class="row text_row">
             <div class="input-group input-group-sm"><span class="input-group-addon">
             <input value="true" [checked]="block.data.title" [(ngModel)]="block.data.title" class="title" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.titletext" placeholder="Title" value="" class="form-control"></div></div>
             </div>
             <p class="form_title_text">Check the box to make the Title clickable to the form.</p>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class FormTitleBlockComponent implements BlockComponent {
  @Input() block: any;

  formTitleView = new EventEmitter<any>();

  getFormTitle(view: any) {
    this.formTitleView.emit(view);
  };
};

@Component({
  selector: 'questions-block',
  outputs: ["questionsView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getQuestions($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel questions_panel">
             <p class="text_header_content">This widget allows you to add one or multiple questions, each with a text box with answers. It can be used for collecting contact info, feedback, etc.</p>
             <div *ngFor="let ques of block.data.questions; let i = index; trackBy:trackByIndex" class="row qus_text_row"><b style="float:left;">*</b>
             <input value="true" [checked]="block.data.mandatory[i]" [(ngModel)]="block.data.mandatory[i]" title="Field is mandatory" class="ques-blk-mandate" type="checkbox">
             <input [(ngModel)]="block.data.questions[i]" type="text" class="form-control input-sm ques-block-text" value="" placeholder="Type question here">
             <span class="answer-type">Answer Type :</span>
             <select [(ngModel)]="block.data.answerTypes[i]" class="form-control input-sm qus_select">
             <option *ngFor="let ansType of answerTypes; let ansI = index" [ngValue]="ansType.value" >{{ansType.text}}</option>
             </select>
             <input value="true" [checked]="block.data.notes[i]" [(ngModel)]="block.data.notes[i]" title="Take Notes when filling forms in the studio" type="checkbox" class="checkbox chk-ques-enable-note">
             <span title="Take Notes when filling forms in the studio" class="qus-notes">Take Notes</span>
             <button *ngIf="i === 0" (click)="addQuestions($event)" class="btn btn-info btn-xs btn-add-ques-ans">+ Text Box</button>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class QuestionsBlockComponent implements BlockComponent {
  @Input() block: any;

  answerTypes: any[] = [{ "text": "Text", "value": "text" },
  { "text": "Text with Unknown", "value": "text_na" },
  { "text": "Text with N/A", "value": "text_nil" },
  { "text": "textarea", "value": "Text Area" },
  { "text": "Text Area with Unknown", "value": "textarea_na" },
  { "text": "Text Area with N/A", "value": "textarea_nil" },
  { "text": "Date", "value": "date" },
  { "text": "Date with Unknown", "value": "date_na" },
  { "text": "Date with N/A", "value": "date_nil" },
  { "text": "Date with approximate", "value": "date_approximate" },
  { "text": "Date and Time", "value": "datetime-local" },
  { "text": "Date and Time with Unknown", "value": "datetime-local_na" },
  { "text": "Date and Time with N/A", "value": "datetime-local_nil" },
  { "text": "Date and Time with approximate", "value": "datetime-local_approximate" },
  { "text": "Time Only", "value": "time" },
  { "text": "Time Only with Unknown", "value": "time_na" },
  { "text": "Time Only with N/A", "value": "time_nil" },
  { "text": "Time Only with approximate", "value": "time_approximate" },
  { "text": "Number", "value": "number" },
  { "text": "Number with Unknown", "value": "number_na" },
  { "text": "Number with N/A", "value": "number_nil" }]

  questionsView = new EventEmitter<any>();

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  addQuestions(e: any) {
    this.block.data.notes.push(false);
    this.block.data.answerTypes.push("text");
    this.block.data.mandatory.push(false);
    this.block.data.questions.push("");
  };

  getQuestions(view: any) {
    this.questionsView.emit(view);
  };
};

@Component({
  selector: 'attendance-block',
  outputs: ["attendanceView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getAttendance($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel attendance_panel">
             <div class="row attendance_title_row">
             <input type="text" [(ngModel)]="block.data.title" class="form-control input-sm" value="Today i will be Attending" placeholder="Today i will be Attending">
             </div>
             <div class="row attendance_text_row">
             <span class="attendance-inapp-text">In app possible replies:</span>
             <button (click)="addOption($event)" class="btn-info btn-xs btn-option-box">+ Add Option</button><br/>
             <span>
             <input value="true" [checked]="block.data.person" [(ngModel)]="block.data.person" class="chk-attendance-in-person" type="checkbox">
             <div class="attendance-main-text-in-person">In-person</div></span>
             <span class="attendance-online">
             <input value="true" [checked]="block.data.online" [(ngModel)]="block.data.online" class="chk-attendance-online" type="checkbox">
             <div class="attendance-main-text-online">Online</div></span>
             <div *ngFor="let opt of block.data.options; let i = index; trackBy:trackByIndex" class="row attendance_options_row">
             <input type="text" [(ngModel)]="block.data.options[i]" class="form-control input-sm" placeholder="Type option here"></div>
             </div>
             <div class="row attendance_member_row">
             <div class="input-group input-group-sm">
             <span class="input-group-addon">
             <input value="true" [checked]="block.data.addMember" [(ngModel)]="block.data.addMember" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.addQuestion" class="form-control"> 
             </div></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class AttendanceBlockComponent implements BlockComponent {
  @Input() block: any;

  addOption(e: any) {
    this.block.data.options.push("");
  };

  attendanceView = new EventEmitter<any>();

  getAttendance(view: any) {
    this.attendanceView.emit(view);
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };
};

@Component({
  selector: 'confirmation-block',
  outputs: ["confirmationView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getConfirmation($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel confirmation_panel">
             <p class="confirm_header_text">This page appears at the end of a form, and is used for Submit confirmation or a Thank You note</p>
             <div class="confirmation_text_block"> 
             <div class="submit_row">
             <div class="input-group input-group-sm confirm_submit_text">
             <span class="input-group-addon">Submit button text:</span>
             <input [(ngModel)]="block.data.submittext" type="text" placeholder="Submit text" value="" class="form-control"> 
             </div>
             <span class="confirmation_text"><p>Confirmation Format:</p></span>
             <div class="row main_confirm_content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ConfirmationBlockComponent implements BlockComponent {
  @Input() block: any;

  confirmationView = new EventEmitter<any>();

  getConfirmation(view: any) {
    this.confirmationView.emit(view);
  };
};

@Component({
  selector: 'password-block',
  outputs: ["passwordView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getPassword($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel password_panel">
             <div class="input-group input-group-sm password_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.password" [(ngModel)]="block.data.password" type="checkbox"></span>
             <span class="form-control">Enable Password Reset</span></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PasswordBlockComponent implements BlockComponent {
  @Input() block: any;

  passwordView = new EventEmitter<any>();

  getPassword(view: any) {
    this.passwordView.emit(view);
  };
};

@Component({
  selector: 'next-block',
  outputs: ["nextView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockViews)="getNext($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel next_panel">
             <div style="margin-left: 2px;" class="row">
             <span class="next-label">Type</span>
             <label class="radio-inline"> 
             <input type="radio" value="tile" [checked]="block.data.type" [(ngModel)]="block.data.type" class="next-tile"><span class="next-options">Tile</span></label> 
             </div>
             <p class="header-next-block">This widget appears at the end of a form, and is used for Submit confirmation</p>
             <div class="tile_link_block">
             <div class="next_tile_submit_row">
             <div class="input-group input-group-sm">
             <span class="input-group-addon">Redirect button text:</span>
             <input type="text" [(ngModel)]="block.data.text" placeholder="Submit text" value="" class="form-control"> 
             </div></div><button class="btn btn-tile-link btn-info btn-xs">Link Tile</button></div>
             </div>
             <p>Tile Title: {{ block.data.tileTile }} </p>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class NextBlockComponent implements BlockComponent {
  @Input() block: any;

  nextView = new EventEmitter<any>();

  getNext(view: any) {
    this.nextView.emit(view);
  };
};

@Component({
  selector: 'formPhoto-block',
  outputs: ["formPhotoView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getFormPhoto($event)" [(block)]= "block"> </block-controls></div>
             <div class="row form_media_main_content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class FormPhotoComponent implements BlockComponent {
  @Input() block: any;

  formPhotoView = new EventEmitter<any>();

  getFormPhoto(view: any) {
    this.formPhotoView.emit(view);
  };
};

@Component({
  selector: 'painLevel-block',
  outputs: ["painLevelView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getPainLevel($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel pain_level_panel">
             <div class="input-group input-group-sm pain_level_content">
             <span class="input-group-addon"><b style="margin-right:2%">*</b>
             <input value="true" [checked]="block.data.mandatory" [(ngModel)]="block.data.question" title="Field is mandatory" type="checkbox"></span>
             <input [(ngModel)]="block.data.question" type="text" placeholder="Enter Question here" value="" class="form-control"></div>
             <div class="input-group input-group-sm pain_level_content">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input style="margin-top: 1px;" value="image" [checked]="block.data.level" [(ngModel)]="block.data.level" type="radio" name="optradio">Numeric Rating Scale with Emoticons</label>
             <label style="font-size: 11px;" class="radio-inline"><input style="margin-top: 1px;" value="numeric" [checked]="block.data.level" [(ngModel)]="block.data.level" type="radio" name="optradio">Numeric Rating Scale</label></form>
             </div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PainLevelComponent implements BlockComponent {
  @Input() block: any;

  painLevelView = new EventEmitter<any>();

  getPainLevel(view: any) {
    this.painLevelView.emit(view);
  };
};

@Component({
  selector: 'drawTool-block',
  outputs: ["drawToolView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getDrawTool($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel draw_tool_panel">
             <div class="input-group input-group-sm draw_tool_content">
             <span class="input-group-addon"><input checked="true" disabled="true" class="drawtool" type="checkbox">
             </span><input type="text" placeholder="Draw Image" [(ngModel)]="block.data.question" class="form-control"></div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class DrawToolBlockComponent implements BlockComponent {
  @Input() block: any;

  drawToolView = new EventEmitter<any>();

  getDrawTool(view: any) {
    this.drawToolView.emit(view);
  };
};

@Component({
  selector: 'physician-block',
  outputs: ["physicianView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getPhysician($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel physician_panel">
             <div class="input-group input-group-sm physician_content">
             <span class="input-group-addon"><b style="margin-right:2%">*</b>
             <input value="true" [checked]="block.data.mandatory" [(ngModel)]="block.data.mandatory" style="margin-right:24%;" title="Field is mandatory" type="checkbox">
             <input disabled="true" checked="true" title="Physician list appears in the app" type="checkbox"></span>
             <input [(ngModel)]="block.data.text" type="text" class="form-control"></div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PhysicianBlockComponent implements BlockComponent {
  @Input() block: any;

  physicianView = new EventEmitter<any>();

  getPhysician(view: any) {
    this.physicianView.emit(view);
  };
};

@Component({
  selector: 'endWrapper-block',
  outputs: ["endWrapperView"],
  template: `<div class="page_block tile_block wrapper_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getEndWrapper($event)" [(block)]= "block"> </block-controls>
             <label class="lbl-disable-confirm">Disable pop-up</label>
             <input value="true" [checked]="block.data.submitConfirmation" [(ngModel)]="block.data.submitConfirmation" class="end_wrapper_disable" type="checkbox" title="Disable confirmation popup after submit">
             <input [(ngModel)]="block.data.text" placeholder=" Submit Text " class="end-wrapper-submit-text" type="text">
             <label class="wrapper_end">End Wrapping Form Widgets in one form</label>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class EndWrapperBlockComponent implements BlockComponent {
  @Input() block: any;

  endWrapperView = new EventEmitter<any>();

  getEndWrapper(view: any) {
    this.endWrapperView.emit(view);
  };
};

@Component({
  selector: 'fill-block',
  outputs: ["fillView"],
  template: `<div class="page_block tile_block wrapper_block">
             <div class="content_buttons">            
             <block-controls (blockView)="getFill($event)" [(block)]= "block"> </block-controls></div>
             <div class="ili-panel fill_in_panel">
             <p style="font-size: 12px;">To create a fill-in form, add 3 underlines where you want users to fill-in the blanks within your text. THE FILL-IN WILL AUTO EXPAND on the mobile device. User may email the form to themselves or any other email address.</p>
             <div class="row fill_in_main_content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class FillBlockComponent implements BlockComponent {
  @Input() block: any;

  fillView = new EventEmitter<any>();

  getFill(view: any) {
    this.fillView.emit(view);
  };
};

@Component({
  selector: 'notes-block',
  outputs: ["notesView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getNotes($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel notes_panel'>
             <div class="row contents_input_account">
             <div class="input-group input-group-sm">
             <span class="input-group-addon">
             <input value="true" (change)="notesAssign($event, 'notes')" [checked]="block.data.notes" [(ngModel)]="block.data.notes" type="checkbox"></span>
             <span class="form-control">Notes</span>
             </div></div>
             <div class="row contents_input_account">
             <div class="input-group input-group-sm">
             <span class="input-group-addon">
             <input value="true" (change)="notesAssign($event, 'allnotes')" [checked]="block.data.allNotes" [(ngModel)]="block.data.allNotes" type="checkbox"></span>
             <span class="form-control"> Notes Archive </span>
             </div></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class NotesBlockComponent implements BlockComponent {
  @Input() block: any;

  notesView = new EventEmitter<any>();

  getNotes(view: any) {
    this.notesView.emit(view);
  };

  notesAssign(e: any, type: string) {
    if (type === "allnotes") {
      this.block.data.notes = this.block.data.allNotes ? false : true;
    }

    if (type === "notes") {
      this.block.data.allNotes = this.block.data.notes ? false : true;
    }
  };
};

@Component({
  selector: 'buttons-block',
  outputs: ["buttonsView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getButtons($event)" [(block)]= "block"> </block-controls></div>
             <div *ngFor="let btnData of block.data; let i = index; trackBy:trackByIndex" class='ili-panel buttons_panel'>
             <div class="row button_main_row">
             <input type="text" [(ngModel)]="block.data[i].beforeText" class="form-control input-sm btn_before_text" value="" placeholder="Before Click">
             <button *ngIf="i===0" (click)="addButton($event)" class="btn btn-info btn-xs btn-add-blocks">+ Button</button>
             <input [disabled]="checkDisabled(btnData, 'afterText')" type="text" [(ngModel)]="block.data[i].afterText" class="form-control input-sm btn_after_text" value="" placeholder="After Click">
             <label class="lbl-btn-txt">Or</label>
             <button (click)="addConfirmation(btnData)" [disabled]="checkDisabled(btnData, 'confirm')" class="btn btn-info btn-xs btn-add-confirmation">+ Confirmation</button></div>
             <div *ngIf="block.data[i]!.confirmation" class="row btn_confirm_main_content">
             <ckeditor [(ngModel)]="block.data[i].confirmation"></ckeditor>
             </div> 
             </div>
             <div class="row button_add_alert">
             <button (click)="addAlert($event)" class="btn btn-add-alert btn-info btn-xs btn-added-alert">Add Alert</button></div>
             <div *ngIf="block.alerts.length > 0" class="ili-panel buttons_panel">
             <div *ngFor="let alrtData of block.alerts; let aI = index; trackBy:trackByIndex" class="row btn_alert_row">
             <input type="text" [(ngModel)]="block.alerts[aI]" class="form-control input-sm btn_alert_box" placeholder="Type email address to receive an alert when corresponding option is selected">
             </div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ButtonsBlockComponent implements BlockComponent {
  @Input() block: any;

  buttonsView = new EventEmitter<any>();

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  addButton(e: any) {
    var btnData = { "beforeText": "", "afterText": "" };
    this.block.data.push(btnData);
  };

  addConfirmation(btnData: any) {
    btnData["confirmation"] = new String("");
  };

  checkDisabled(btnData: any, opt: string) {
    var result = false;

    if (opt === "afterText") {
      result = btnData.hasOwnProperty("confirmation") ? true : false;
    } else if (opt === "confirm") {
      result = btnData["afterText"] !== "" ? true : false;
    }

    return result
  };

  addAlert(e: any) {
    var alertsIndx = this.block.data.length;

    for (let i = 1; i <= alertsIndx; i++) {
      this.block.alerts.push("");
    }
  };

  getButtons(view: any) {
    this.buttonsView.emit(view);
  };
};

@Component({
  selector: 'contactus-block',
  outputs: ["contactusView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getContactUs($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel contactus_panel'>
             <span class="txt-email-notes">Separate multiple email addresses with a comma followed by a space</span>
             <div class="confirmation_text_block"><input type="text" [(ngModel)]="block.data.email" placeholder="To email address" class="form-control input-sm url_block_url"></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ContactUsBlockComponent implements BlockComponent {
  @Input() block: any;

  contactusView = new EventEmitter<any>();

  getContactUs(view: any) {
    this.contactusView.emit(view);
  };
};

@Component({
  selector: 'placefull-block',
  outputs: ["placefullView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getPlacefull($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel placefull_panel'>
             <p style="font-size: 11px;">Copy and paste the PlaceFull script and div</p>
             <textarea [(ngModel)]="block.data.text" class="placefull"></textarea>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PlacefullBlockComponent implements BlockComponent {
  @Input() block: any;

  placefullView = new EventEmitter<any>();

  getPlacefull(view: any) {
    this.placefullView.emit(view);
  };
};

@Component({
  selector: 'addtocart-block',
  outputs: ["addToCartView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getAddToCart($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel addtocart_panel'>
             <p class="text_header_content">This widget allows consumers to add items to their car cart using the Cart widget</p>
             <div class="row cart_text_row">
             <input value="true" [checked]="block.data.isProductName" [(ngModel)]="block.data.isProductName" class="cart-product-name-disable" title="Show the product name in the app" type="checkbox">
             <input type="text" [(ngModel)]="block.data.productName" class="form-control input-sm add_cart_product_name" placeholder="Product Name">
             </div>
             <div class="row cart_text_row">
             <input value="true" [checked]="block.data.isProductDescription" [(ngModel)]="block.data.isProductDescription" class="cart-product-desc-disable" title="Show the product description in the app" type="checkbox">
             <input type="text" [(ngModel)]="block.data.description" class="form-control input-sm add_cart_description" placeholder="Description">
             </div>
             <div class="row cart_text_row">
             <input value="true" [checked]="block.data.isProductPrice" [(ngModel)]="block.data.isProductPrice" class="cart-product-price-disable" title="Show the product price in the app" type="checkbox">
             <input type="text" [(ngModel)]="block.data.price" class="form-control input-sm add_cart_price" placeholder="Price">
             <input type="text" [(ngModel)]="block.data.currency" class="form-control input-sm add_cart_currency" placeholder="Currency">
             </div>
             <div class="row cart_text_row">
             <input type="text" [(ngModel)]="block.data.textCartButton" class="form-control input-sm add_cart_btn" placeholder="Add to Cart"></div>
             <div class="row cart_text_row"><input [(ngModel)]="block.data.confirmationMessage" type="text" class="form-control input-sm add_confirm_message" value="" placeholder="Confirmation Message"></div>
             <div class="row cart_text_row">
             <input value="true" [checked]="block.data.isProductImage" [(ngModel)]="block.data.isProductImage" class="cart-product-image-disable" title="Show the product image in the app" type="checkbox">
             <label style="font-size: 12px;">Product Image</label><button class="btn btn-success btn-xs btn-add-cart-picture">+ Add Picture</button></div>
             <div class="row">
             <img [src]="block.data.productImage" class="cart-product-image">
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class AddToCartBlockComponent implements BlockComponent {
  @Input() block: any;

  addToCartView = new EventEmitter<any>();

  getAddToCart(view: any) {
    this.addToCartView.emit(view);
  };
};

@Component({
  selector: 'cart-block',
  outputs: ["cartView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getCart($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel cart_panel'>
             <p style="font-size: 11px; float: left; margin-left: 12px;">This widget allows confirm all your added carts</p>
             <div class="row cart_text_row">
             <input type="text" [(ngModel)]="block.data.productTitle" class="form-control input-sm cart_product_title" value="" placeholder="Cart Title">
             </div>
             <div class="row cart_text_row">
             <input type="text" [(ngModel)]="block.data.notificationEmail" class="form-control input-sm cart_email_notification" value="" placeholder="Notification email address">
             </div>
             <div class="row cart_text_row">
             <input type="text" [(ngModel)]="block.data.textConfirmButton" class="form-control input-sm cart_confirm_order" value="" placeholder="Confirm Order">
             </div>
             <div class="row cart_text_row">
             <input type="text" [(ngModel)]="block.data.confirmationMessage" class="form-control input-sm cart_confirm_msg" value="" placeholder="Confirmation Message">
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class CartBlockComponent implements BlockComponent {
  @Input() block: any;

  cartView = new EventEmitter<any>();

  getCart(view: any) {
    this.cartView.emit(view);
  };
};

@Component({
  selector: 'blanksForm-block',
  outputs: ["blanksFormView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getBlanksForm($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel blanks_form_panel'>
             <p style="font-size: 11px; float: left; margin-left: 6px;">Form will be automatically emailed to the indicated email addresses. Separate multiple email addresses with a comma followed by a space.</p>
             <div class="confirmation_text_block"> 
             <input type="text" [(ngModel)]="block.data.email" placeholder="To email address" class="form-control input-sm url_block_url">
             <input min="0" type="number" [(ngModel)]="block.data.imageLimit" placeholder="Number of picture upload allowed" class="form-control input-sm url_block_url">
             </div>
             <p style="font-size: 11px;">To create a fill-in form, add 3 underlines where you want users to fill-in the blanks within your text. THE FILL-IN WILL AUTO EXPAND on the mobile device.</p>
             <div class="row blank-form-content">
             <ckeditor [(ngModel)]="block.data.text"></ckeditor>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class BlanksFormBlockComponent implements BlockComponent {
  @Input() block: any;

  blanksFormView = new EventEmitter<any>();

  getBlanksForm(view: any) {
    this.blanksFormView.emit(view);
  };
};

@Component({
  selector: 'exclusiveurl-block',
  outputs: ["exclusiveUrlView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getExclusiveUrl($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel exclusive_url_panel'>
             <div class="input-group input-group-sm contents_exclusiveurl">
             <input type="text" [(ngModel)]="block.data.url" placeholder="Enter the url" class="form-control">
             </div>
             <div style="padding-left: 10px; font-size: 12px;" class="checkbox">
             <label><input style="margin-top: 2px;" type="checkbox" value="true" (change)="checkUrlPriority('window')" [(ngModel)]="block.data.window" [checked]="block.data.window">Open in new window for all devices</label>
             </div>
             <div style="padding-left: 10px; font-size: 12px;" class="checkbox">
             <label><input style="margin-top: 2px;" type="checkbox" value="true" (change)="checkUrlPriority('iphonewindow')" [(ngModel)]="block.data.iphonewindow" [checked]="block.data.iphonewindow">Open in new window for iOS devices</label>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ExclusiveUrlBlockComponent implements BlockComponent {
  @Input() block: any;

  exclusiveUrlView = new EventEmitter<any>();

  getExclusiveUrl(view: any) {
    this.exclusiveUrlView.emit(view);
  };

  checkUrlPriority(opt: string) {
    if (opt === "window") {
      this.block.data.iphonewindow = this.block.data.window ? false : true;
    }

    if (opt === "iphonewindow") {
      this.block.data.window = this.block.data.iphonewindow ? false : true;
    }
  };
};

@Component({
  selector: 'fileupload-block',
  outputs: ["fileUploadView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getFileUpload($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel file_upload_panel'>
             <div class="input-group input-group-sm file_upload_content">
             <input type="text" [(ngModel)]="block.data.url" placeholder="Enter the url" class="form-control"></div>
             <div class="row file_upload_wrapper">
             <input style="cursor: pointer;" type="file">
             <span class="button">Browse files</span></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class FileUploadBlockComponent implements BlockComponent {
  @Input() block: any;

  fileUploadView = new EventEmitter<any>();

  getFileUpload(view: any) {
    this.fileUploadView.emit(view);
  };
};

@Component({
  selector: 'pushpay-block',
  outputs: ["pushPayView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getPushPay($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel push_pay_panel'>
             <div class="input-group input-group-sm push_pay_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.pushpay" [(ngModel)]="block.data.pushpay" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.url" placeholder="PushPay Url" value="" class="form-control"></div>
             <div style="padding-left: 10px; font-size: 12px;" class="checkbox">
             <label><input style="margin-top: 2px;" type="checkbox" value="true" (change)="checkPushPayPriority('window')" [(ngModel)]="block.data.window" [checked]="block.data.window">Open in new window for all devices</label>
             </div>
             <div style="padding-left: 10px; font-size: 12px;" class="checkbox">
             <label><input style="margin-top: 2px;" type="checkbox" value="true" (change)="checkPushPayPriority('iphonewindow')" [(ngModel)]="block.data.iphonewindow" [checked]="block.data.iphonewindow">Open in new window for iOS devices</label>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class PushpayBlockComponent implements BlockComponent {
  @Input() block: any;

  pushPayView = new EventEmitter<any>();

  getPushPay(view: any) {
    this.pushPayView.emit(view);
  };

  checkPushPayPriority(opt: string) {
    if (opt === "window") {
      this.block.data.iphonewindow = this.block.data.window ? false : true;
    }

    if (opt === "iphonewindow") {
      this.block.data.window = this.block.data.iphonewindow ? false : true;
    }
  };
};

@Component({
  selector: 'ThreedCart-block',
  outputs: ["threedCartView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getThreedCart($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel threed_cart_panel'>
             <div class="input-group input-group-sm threed_cart_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.cart" [(ngModel)]="block.data.cart" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.url" placeholder="PushPay Url" value="" class="form-control"></div>
             <div style="padding-left: 10px; font-size: 12px;" class="checkbox">
             <label><input style="margin-top: 2px;" type="checkbox" value="true" (change)="checkThreedCartPriority('window')" [(ngModel)]="block.data.window" [checked]="block.data.window">Open in new window for all devices</label>
             </div>
             <div style="padding-left: 10px; font-size: 12px;" class="checkbox">
             <label><input style="margin-top: 2px;" type="checkbox" value="true" (change)="checkThreedCartPriority('iphonewindow')" [(ngModel)]="block.data.iphonewindow" [checked]="block.data.iphonewindow">Open in new window for iOS devices</label>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ThreedCartBlockComponent implements BlockComponent {
  @Input() block: any;

  threedCartView = new EventEmitter<any>();

  getThreedCart(view: any) {
    this.threedCartView.emit(view);
  };

  checkThreedCartPriority(opt: string) {
    if (opt === "window") {
      this.block.data.iphonewindow = this.block.data.window ? false : true;
    }

    if (opt === "iphonewindow") {
      this.block.data.window = this.block.data.iphonewindow ? false : true;
    }
  };
};

@Component({
  selector: 'blogs-block',
  outputs: ["blogsView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getBlogs($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel blogs_panel'>
             <div class="input-group input-group-sm blogs_content">
             <input type="text" [(ngModel)]="block.data.wordPressTitle" placeholder="Word Press Title" value="" class="form-control"></div>
             <div class="input-group input-group-sm contents_input_account">
             <span class="input-group-addon"><input (change)="openWordPress($event)" value="true" [checked]="block.data.wordPressTitle" [(ngModel)]="block.data.wordPressTitle" type="checkbox"></span>
             <input type="text" [(ngModel)]="block.data.wordPressUrl" placeholder="Word Press Feed Url" value="" class="form-control"></div>
             <div class="row blogs_main_content">
             <ckeditor [(ngModel)]="block.data.wordPressContent"></ckeditor>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class BlogsBlockComponent implements BlockComponent {
  @Input() block: any;

  blogsView = new EventEmitter<any>();

  getBlogs(view: any) {
    this.blogsView.emit(view);
  };

  openWordPress(e: any) {
  };
};

@Component({
  selector: 'chat-block',
  outputs: ["chatView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getChat($event)" [(block)]= "block"></block-controls></div>
             <div class='ili-panel chat_panel'>
             <div class="input-group input-group-sm chat_enable_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.chat" [(ngModel)]="block.data.chat" disabled="true" type="checkbox">
             </span><span class="form-control">Enable chat</span></div>
             <div class="input-group input-group-sm chat_enable_content">
             <span class="input-group-addon"><input value="true" [checked]="block.data.isPrivate" [(ngModel)]="block.data.isPrivate" type="checkbox">
             </span><span class="form-control">Private chat</span></div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ChatBlockComponent implements BlockComponent {
  @Input() block: any;

  chatView = new EventEmitter<any>();

  getChat(view: any) {
    this.chatView.emit(view);
  };
};

@Component({
  selector: 'account-block',
  outputs: ["accountView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getAccount($event)" [(block)]= "block"></block-controls></div>
             <div class='ili-panel account_panel'>
             <div *ngFor="let connCard of block.data.connectionCard; let i = index; trackBy:trackByIndex" class='input-group input-group-sm contents_input_account'>
             <span class="input-group-addon">
             <b *ngIf="connCard!.tag !== 'addMember'" style="margin-right:2%">*</b>
             <input *ngIf="connCard!.tag !== 'addMember'" value="true" [checked]="connCard!.required" [(ngModel)]="connCard!.required" style="margin-right: 4%;" title="Field is mandatory" class="mandatory" type="checkbox">
             <input value="true" (change)="connCard!.tag === 'addMember'? addSubMember($event, -1, 'main') : false" [checked]="connCard!.assigned" [(ngModel)]="connCard!.assigned" class="profile-assigned account-main " title="Field appears in the app" type="checkbox">
             </span>
             <span type="text" class="form-control profile-name">{{connCard!.name}}</span>
             </div>
             </div>
             <div *ngFor="let sbMem of block.data.submember; let mIdx = index; trackBy:trackByIndex" class='ili-panel account_panel'>
             <div *ngFor="let sM of sbMem; let sIdx = index; trackBy:trackByIndex" class='input-group input-group-sm contents_input_account'>
             <span class="input-group-addon">
             <b *ngIf="sM!.tag !== 'addMember'"style="margin-right:2%">*</b>
             <input *ngIf="sM!.tag !== 'addMember'" value="true" [checked]="sM!.required" [(ngModel)]="sM!.required" style="margin-right: 4%;" title="Field is mandatory" class="mandatory" type="checkbox">
             <input value="true" (change)="sM!.tag === 'addMember'? addSubMember($event, mIdx, 'sub') : false" [checked]="sM!.assigned" [(ngModel)]="sM!.assigned" class="profile-assigned account-main " title="Field appears in the app" type="checkbox">
             </span>
             <span type="text" class="form-control profile-name">{{sM!.name}}</span>
             </div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class AccountBlockComponent implements BlockComponent, OnInit {
  @Input() block: any;
  accountView = new EventEmitter<any>();

  getAccount(view: any) {
    this.accountView.emit(view);
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  addSubMember(e: any, idx: number, memFrom: string) {
    if (e.target.checked) {
      var subMemData = this.connectData();

      if (subMemData.length > 0) {
        this.block.data.submember.push(subMemData)
      }
    } else {
      if (memFrom === "sub") {
        var currIdx = idx + 1;
        var subMemLength = this.block.data.submember.length;

        if (currIdx < subMemLength) {
          this.block.data.submember.length = currIdx;
        }
      } else if (memFrom === "main") {
        this.block.data.submember = [];
      }
    }
  };

  connectData() {
    var profileData = this.block.profileData.length > 0 ? this.block.profileData.map(x => Object.assign({}, x)) : [];

    profileData.push({
      required: false,
      assigned: false,
      name: "Add Family Member ?",
      tag: "addMember",
      type: "addMember"
    });

    if (profileData.length > 0) {
      for (let i = 0; i < profileData.length; i++) {
        var currData = profileData[i];
        profileData[i]["assigned"] = currData.hasOwnProperty("required") && currData.required ? true : false;
      }
    }

    return profileData;
  };

  ngOnInit() {

  }
};

@Component({
  selector: 'profile-block',
  outputs: ["profileView"],
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (blockView)="getProfile($event)" [(block)]= "block"></block-controls></div>
             <div class='ili-panel profile_panel'>
             <div *ngFor="let prof of block.data.profile; let i = index; trackBy:trackByIndex"  class='input-group input-group-sm contents_input_account'>
             <span class="input-group-addon">
             <b style="margin-right:2%">*</b>
             <input [checked]="prof!.required" [(ngModel)]="prof!.required" style="margin-right: 4%;" title="Field is mandatory" class="mandatory" type="checkbox">
             <input [checked]="prof!.assigned" [(ngModel)]="prof!.assigned" class="profile-assigned account-main " title="Field appears in the app" type="checkbox">
             </span>
             <span type="text" class="form-control profile-name">{{prof!.name}}</span>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ProfileBlockComponent implements BlockComponent {
  @Input() block: any;

  profileView = new EventEmitter<any>();

  getProfile(view: any) {
    this.profileView.emit(view);
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };
};

export const TileBlocksComponents = [
  TextBlockComponent, VideoBlockComponent, PictureBlockComponent, DisqusBlockComponent,
  SocialFeedBlockComponent, CalendarBlockComponent, ShareBlockComponent, PatientsBlockComponent,
  InquiryBlockComponent, NotesBlockComponent, BlockControls, SurveyBlockComponent,
  QuestionnaireBlockComponent, FormTitleBlockComponent, QuestionnaireSubOptionComponent,
  StartWrapperBlockComponent, QuestionsBlockComponent, AttendanceBlockComponent,
  ConfirmationBlockComponent, PasswordBlockComponent, NextBlockComponent, FormPhotoComponent,
  PainLevelComponent, DrawToolBlockComponent, PhysicianBlockComponent, EndWrapperBlockComponent,
  FillBlockComponent, ButtonsBlockComponent, ContactUsBlockComponent, PlacefullBlockComponent,
  AddToCartBlockComponent, CartBlockComponent, BlanksFormBlockComponent, ExclusiveUrlBlockComponent,
  FileUploadBlockComponent, PushpayBlockComponent, ThreedCartBlockComponent, BlogsBlockComponent,
  ChatBlockComponent, AccountBlockComponent, ProfileBlockComponent
];


