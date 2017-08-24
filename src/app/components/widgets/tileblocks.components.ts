import { Component, EventEmitter, forwardRef, Input, SkipSelf, ViewContainerRef, ComponentFactoryResolver, ViewChild, ElementRef } from '@angular/core';
import { BlockComponent } from './block.component';
import { WidgetsComponent } from './widgets.component';


export abstract class Parent { name: string; }

const DifferentParent = Parent;

const provideParent =
  (component: any, parentType?: any) => {
    return { provide: parentType || Parent, useExisting: forwardRef(() => component) };
  };

const provideTheParent =
  (component: any) => {
    return { provide: Parent, useExisting: forwardRef(() => component) };
  };

@Component({
  selector: 'block-controls',
  outputs: ["removeBlock"],
  template: `<div class="content_buttons">
             <div style="float:left;" class="drag_cursor"><span class="widgetstext">{{block.blockName}}</span></div>
             <div class="tigger_btn"><span class="glyphicon glyphicon-off"></span></div>
             <div class="tigger_btn" (click)="clearBlock(block.view)" title="Remove"><span class="glyphicon glyphicon-remove"></span></div>
             <div class="tigger_btn" title="MoveDown"><span class="glyphicon glyphicon-arrow-down"></span></div>
             <div class="tigger_btn" title="MoveUp"><span style="margin-top:-1px;" class="glyphicon glyphicon-arrow-up"></span></div>
             <div style="display:none" id="divRedirectBackToApp" class="redirect-app-submit"><span class="redirect-back-app">Redirect back to app </span></div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class BlockControls {
  @Input() block: any;

  removeBlock = new EventEmitter<any>();
  view: any;

  clearBlock(view: any) {
    this.removeBlock.emit(view)
  }
}

@Component({
  selector: 'inquiry-block',
  outputs: ["inquiryView"],
  template: `<div class="page_block tile_block">
             <block-controls (removeBlock)="deleteInquiry($event)" [(block)]= "block"></block-controls>
             <span class="txt-email-notes">Separate multiple email addresses with a comma followed by a space</span>
             <div class="confirmation_text_block">
             <input type="text" placeholder="To email address" id="email" [(ngModel)]="block.data.email" class="form-control input-sm url_block_url">
             </div>
             <div class="confirmation_text_block">
             <input [(ngModel)]="block.data.inquiryText" type="text" placeholder="Type your inquiry here" id="inquiry-text" value="" class="form-control input-sm url_block_url">
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class InquiryBlockComponent implements BlockComponent {
  @Input() block: any;
  inquiryView = new EventEmitter<any>();

  deleteInquiry(view: any) {
    this.inquiryView.emit(view);
  };
}

@Component({
  selector: 'notes-block',
  template: `<div class='page_block tile_block'>
             <block-controls (removeBlock)="deleteNotes($event)" [(block)]= "block"> </block-controls>
             <div class='panel ili-panel ili-border-default panel-default notes_panel'>
             <div class="input-group input-group-sm contents_input_account">
             <span class="input-group-addon"><input class="notes" type="radio"></span>
             <span class="form-control">Notes</span></div>
             <div class="input-group input-group-sm contents_input_account">
             <span class="input-group-addon"><input class="all_notes" type="radio"></span>
             <span class="form-control"> Notes Archive </span></div></div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class NotesBlockComponent implements BlockComponent {
  @Input() block: any;

  notesView = new EventEmitter<any>();

  deleteNotes(view: any) {
    this.notesView.emit(view);
  };
}

@Component({
  selector: 'survey-block',
  template: `<div class='page_block tile_block'>
             <block-controls (removeBlock)="deleteSurvey($event)" [(block)]= "block"> </block-controls>
             <div class='ili-panel survey_panel'>
             <p class='text_header_content'>This widget allows you to add one or multiple questions, with one or more possible replies, with the choice of showing results in the app in real time.
             It can be used for Polls, Surveys, Votes, Requests to volunteer, etc.</p>
             <b style='float: left;margin-left:11px;'>*</b>
             <input style='margin-right:.5%; float:left;' title='Field is mandatory' class='question-survey-md' type='checkbox'>
             <input type='text' class='form-control input-sm survey_question_text' value='' placeholder='Type question or text here '/>
             <div class="row control_survey">
             <span class="decription-survey">User can select</span>
             <div class="survey_controls">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input #ctrlSingle (change)="controlChange(ctrlSingle.value)" value="false" [(ngModel)]="block.data.multiple" type="radio" class="ques-one" name="optradio">One Answer</label>
             <label style="font-size: 11px;" class="radio-inline"><input #ctrlMultiple (change)="controlChange(ctrlMultiple.value)" value="true" [(ngModel)]="block.data.multiple" type="radio" class="ques-multiple" name="optradio">Multiple Answers</label></form>
             </div>
             <div *ngIf="block.data.multiple.indexOf('false') !== -1" class="survey-opts">
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
             <img class="delete-quest-option" (click)="removeOption(question)" src="assets/img/close_bg.png">
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
             <div style="float: left; width: 97.5%;"><ng2-summernote [(ngModel)]="block.data.popup[i]"></ng2-summernote></div>
             </div>
             </div>
             <span *ngIf="block.data.confirmation.length > 0" class="txt-email-notes txt-popup">Confirmation for Selected Option</span>
             <div *ngFor="let cc of block.data.confirmation; let i = index; trackBy:trackByIndex" style="margin-top: 8px;" class="row">
             <div style="width:98%; margin-top: 7px;" class="col-md-11">
             <div style="float:left; width:2.2%;">{{i + 1}}.</div>
             <div style="float: left; width: 97.5%;"><ng2-summernote [(ngModel)]="block.data.confirmation[i]"></ng2-summernote></div>
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
  }

  controlChange(isMultiple: any) {
    if (isMultiple == "true") {
      this.block.data.showInApp = false;
      this.block.data.isNote = false;
    }
  }

  addPopup(e: any) {
    var quesLength = this.block.data.questions.length;
    var popLength = this.block.data.popup.length;

    if (quesLength > popLength) {
      var popToAppend = quesLength - popLength;
      for (let i = 1; i <= popToAppend; i++) {
        this.block.data.popup.push("content");
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
  }

  addConfirm(e: any) {
    var quesLength = this.block.data.questions.length;
    var confirmLength = this.block.data.confirmation.length;

    if (quesLength > confirmLength) {
      var confirmToAppend = quesLength - confirmLength;

      for (let i = 1; i <= confirmToAppend; i++) {
        this.block.data.confirmation.push("content");
      }
    }
  }

  removeOption(opt: any) {
    let index: number = this.block.data.questions.indexOf(opt);

    if (index !== -1 && this.block.data.questions.length > 1) {
      this.block.data.questions.splice(index, 1);
      this.block.data.popup.splice(index, 1);
      this.block.data.alerts.splice(index, 1);
      this.block.data.confirmation.splice(index, 1);
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  deleteSurvey(view: any) {
    this.surveyView.emit(view);
  };
}

@Component({
  selector: 'questionnaire-block',
  outputs: ["questionnaireView"],
  template: `<div class="page_block tile_block">
             <block-controls (removeBlock)="deleteQuestionnaire($event)" [(block)]= "block"> </block-controls>
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
             <img  class="cc-delete-quest-option" src="assets/img/close_bg.png">
             <img width="19" title="Add Question" (click)="addSubOption(opt)" class="cc-delete-quest-option" src="assets/img/add_sub_questionnaire.png">
             <img width="19" title="Add Textbox" class="cc-delete-quest-option" src="assets/img/add_sub_entry.png"></div>
             <questionnaire-sub-option [currentIndex]="subIndex" [parentIndex]="i" [subOption]="subOpt" *ngFor="let subOpt of opt?.subQuestions; let subIndex = index"> 
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

  deleteQuestionnaire(view: any) {
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
  }

  addSubOption(data: any) {

    if(!data.hasOwnProperty("subQuestions")){
      data["subQuestions"] = [];
    }

    data["subQuestions"].push({
      "type": "questions",
      "questionText": "",
      "questionType": "single",
      "inputControlType": "radio",
      "options": []
    });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}

@Component({
  selector: 'questionnaire-sub-option',
  outputs: ["removeBlock"],
  template: `<div class="row cc-options-sub-row">
             <div class="cc-options-sub-questionaire">
             <span class="cc-sub-question-no">{{parentIndex + 1}}.{{getAlphaLetter(currentIndex)}}</span>
             <input type="text" [(ngModel)]="subOption.questionText" class="form-control input-sm cc-sub-questionaire" placeholder="Type question or text here ">
             <button class="btn btn-info btn-xs cc-sub-add-options">Add Option</button>
             <img class="cc-delete-quest-option" src="assets/img/close_bg.png">
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
             <div class="row cc-sub-questions-row">
             <div class="cc-sub-ques-list-input">
             <input type="text" class="form-control input-sm cc_ques_option_box" placeholder="Type option here">
             <img class="cc-delete-quest-option" src="assets/img/close_bg.png">
             <img width="19" title="Add Question" (click)="addSubOption($event)" class="cc-delete-quest-option" src="assets/img/add_sub_questionnaire.png">
             <img width="19" title="Add Textbox" class="cc-delete-quest-option" src="assets/img/add_sub_entry.png"></div>
             <questionnaire-sub-option [currentIndex]="subIndex" [parentIndex]="currentIndex" [subOption]="subOpt" *ngFor="let subOpt of subOption?.subQuestions; let subIndex = index"> 
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


  getAlphaLetter(i: number) {
    return (i >= 26 ? this.getAlphaLetter((i / 26 >> 0) - 1) : '') + 'abcdefghijklmnopqrstuvwxyz'[i % 26 >> 0];
  }

  addSubOption(data: any) {
    if(!this.subOption.hasOwnProperty("subQuestions")){
      this.subOption["subQuestions"] = [];
    }

    this.subOption["subQuestions"].push({
      "type": "questions",
      "questionText": "",
      "questionType": "single",
      "inputControlType": "radio",
      "options": []
    });
  }


  romanize(num: number) {
    if (!+num) {
      return false;
    }

    var digits = String(+num).split(""),
      key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
        "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
      roman = "",
      i = 3;

    while (i--) {
      roman = (key[+digits.pop() + (i * 10)] || "") + roman;
      return Array(+digits.join("") + 1).join("M") + roman;
    }
  }
}


export const TileBlocksComponents = [InquiryBlockComponent,
  NotesBlockComponent, BlockControls,
  SurveyBlockComponent, QuestionnaireBlockComponent, QuestionnaireSubOptionComponent];


