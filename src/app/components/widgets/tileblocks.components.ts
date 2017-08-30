import { Component, EventEmitter, forwardRef, Input, SkipSelf, ViewContainerRef, ComponentFactoryResolver, ViewChild, ElementRef } from '@angular/core';
import { BlockComponent } from './block.component';
import { WidgetsComponent } from './widgets.component';

@Component({
  selector: 'block-controls',
  outputs: ["removeBlock"],
  template: `<div style="float:left;" class="drag_cursor"><span class="widgetstext">{{block.blockName}}</span></div>
             <div class="tigger_btn"><span class="glyphicon glyphicon-off"></span></div>
             <div class="tigger_btn" (click)="clearBlock(block.view)" title="Remove"><span class="glyphicon glyphicon-remove"></span></div>
             <div class="tigger_btn" title="MoveDown"><span class="glyphicon glyphicon-arrow-down"></span></div>
             <div class="tigger_btn" title="MoveUp"><span style="margin-top:-1px;" class="glyphicon glyphicon-arrow-up"></span></div>
             <div style="display:none" id="divRedirectBackToApp" class="redirect-app-submit"><span class="redirect-back-app">Redirect back to app </span></div>`,
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
             <div class="content_buttons">
             <block-controls (removeBlock)="deleteInquiry($event)" [(block)]= "block"></block-controls></div>
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

  deleteInquiry(view: any) {
    this.inquiryView.emit(view);
  };
}

@Component({
  selector: 'notes-block',
  template: `<div class='page_block tile_block'>
             <div class="content_buttons">
             <block-controls (removeBlock)="deleteNotes($event)" [(block)]= "block"> </block-controls></div>
             <div class='ili-panel notes_panel'>
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
             <div class="content_buttons">
             <block-controls (removeBlock)="deleteSurvey($event)" [(block)]= "block"> </block-controls></div>
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
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteQuestionnaire($event)" [(block)]= "block"> </block-controls></div>
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
             <img (click)="removeOption(opt)"  class="cc-delete-quest-option" src="assets/img/close_bg.png">
             <img width="19" title="Add Question" (click)="addSubOption(opt)" class="cc-delete-quest-option" src="assets/img/add_sub_questionnaire.png">
             <img width="19" title="Add Textbox" class="cc-delete-quest-option" src="assets/img/add_sub_entry.png"></div>
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
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  deleteLevel(level: any) {
    this.block.data.options[level.parentIndex].subQuestions.splice(level.currentIndex, 1);
  }

  removeOption(option: any) {
    let index: number = this.block.data.options.indexOf(option);

    if (index !== -1 && this.block.data.options.length >= 2) {
      this.block.data.options.splice(index, 1);
    }
  }
}

@Component({
  selector: 'questionnaire-sub-option',
  outputs: ["removeSubLevel"],
  template: `<div class="row cc-options-sub-row">
             <div class="cc-options-sub-questionaire">
             <span class="cc-sub-question-no">{{getLevelIndex()}}.{{getAlphaLetter(currentIndex)}}</span>
             <input [style.width]="questionWidth + 'px'" type="text" [(ngModel)]="subOption.questionText" class="form-control input-sm cc-sub-questionaire" placeholder="Type question or text here ">
             <button (click)="addOption($event)" class="btn btn-info btn-xs cc-sub-add-options">Add Option</button>
             <img (click)="deleteSubLevel($event)" class="cc-delete-quest-option" src="assets/img/close_bg.png">
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
             <img (click)="removeOption(subMain)" class="cc-delete-quest-option" src="assets/img/close_bg.png">
             <img *ngIf="isLevel" width="19" title="Add Question" (click)="addSubOption(subMain)" class="cc-delete-quest-option" src="assets/img/add_sub_questionnaire.png">
             <img *ngIf="isLevel" width="19" title="Add Textbox" class="cc-delete-quest-option" src="assets/img/add_sub_entry.png"></div>
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
  }

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
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  getLevelIndex() {
    var idx = "i";

    if (this.levelIndex == 2) {
      idx = idx + "i";
    }

    return idx;
  }

  deleteSubLevel() {
    var level = { "parentIndex": this.parentIndex, "currentIndex": this.currentIndex };
    this.removeSubLevel.emit(level);
  }

  deleteLevel(level: any) {
    this.subOption.options[level.parentIndex].subQuestions.splice(level.currentIndex, 1);
  }

  removeOption(option: any) {
    let index: number = this.subOption.options.indexOf(option);

    if (index !== -1 && this.subOption.options.length >= 2) {
      this.subOption.options.splice(index, 1);
    }
  }
}

@Component({
  selector: 'startWrapper-block',
  outputs: ["startWrapperView"],
  template: `<div class="page_block tile_block wrapper_block">
             <div class="row wrapper_row content_buttons wrapper-row-refresh">
             <block-controls (removeBlock)="deleteStartWrapper($event)" [(block)]= "block"></block-controls>
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

  deleteStartWrapper(view: any) {
    this.startWrapperView.emit(view);
  };
}

@Component({
  selector: 'formTitle-block',
  outputs: ["formTitleView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteFormTitle($event)" [(block)]= "block"> </block-controls></div>
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

  deleteFormTitle(view: any) {
    this.formTitleView.emit(view);
  };
}

@Component({
  selector: 'questions-block',
  outputs: ["questionsView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteQuestions($event)" [(block)]= "block"> </block-controls></div>
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
  }

  addQuestions(e: any) {
    this.block.data.notes.push(false);
    this.block.data.answerTypes.push("text");
    this.block.data.mandatory.push(false);
    this.block.data.questions.push("");
  }

  deleteQuestions(view: any) {
    this.questionsView.emit(view);
  };
}

@Component({
  selector: 'attendance-block',
  outputs: ["attendanceView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteAttendance($event)" [(block)]= "block"> </block-controls></div>
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
  }

  attendanceView = new EventEmitter<any>();

  deleteAttendance(view: any) {
    this.attendanceView.emit(view);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}

@Component({
  selector: 'confirmation-block',
  outputs: ["confirmationView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteConfirmation($event)" [(block)]= "block"> </block-controls></div>
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
             <ng2-summernote [(ngModel)]="block.data.text"></ng2-summernote>
             </div>
             </div>
             </div>
             </div></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class ConfirmationBlockComponent implements BlockComponent {
  @Input() block: any;

  confirmationView = new EventEmitter<any>();

  deleteConfirmation(view: any) {
    this.confirmationView.emit(view);
  }
}

@Component({
  selector: 'password-block',
  outputs: ["passwordView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deletePassword($event)" [(block)]= "block"> </block-controls></div>
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

  deletePassword(view: any) {
    this.passwordView.emit(view);
  }
}

@Component({
  selector: 'next-block',
  outputs: ["nextView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteNext($event)" [(block)]= "block"> </block-controls></div>
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

  deleteNext(view: any) {
    this.nextView.emit(view);
  }
}

@Component({
  selector: 'formPhoto-block',
  outputs: ["formPhotoView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteFormPhoto($event)" [(block)]= "block"> </block-controls></div>
             <div class="row form_media_main_content">
             <ng2-summernote [(ngModel)]="block.data.text"></ng2-summernote>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class FormPhotoComponent implements BlockComponent {
  @Input() block: any;

  formPhotoView = new EventEmitter<any>();

  deleteFormPhoto(view: any) {
    this.formPhotoView.emit(view);
  }
}

@Component({
  selector: 'painLevel-block',
  outputs: ["painLevelView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deletePainLevel($event)" [(block)]= "block"> </block-controls></div>
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

  deletePainLevel(view: any) {
    this.painLevelView.emit(view);
  }
}

@Component({
  selector: 'drawTool-block',
  outputs: ["drawToolView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteDrawTool($event)" [(block)]= "block"> </block-controls></div>
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

  deleteDrawTool(view: any) {
    this.drawToolView.emit(view);
  }
}

@Component({
  selector: 'physician-block',
  outputs: ["physicianView"],
  template: `<div class="page_block tile_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deletePhysician($event)" [(block)]= "block"> </block-controls></div>
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

  deletePhysician(view: any) {
    this.physicianView.emit(view);
  }
}

@Component({
  selector: 'endWrapper-block',
  outputs: ["endWrapperView"],
  template: `<div class="page_block tile_block wrapper_block">
             <div class="content_buttons">            
             <block-controls (removeBlock)="deleteEndWrapper($event)" [(block)]= "block"> </block-controls>
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

  deleteEndWrapper(view: any) {
    this.endWrapperView.emit(view);
  }
}

export const TileBlocksComponents = [
  InquiryBlockComponent, NotesBlockComponent, BlockControls, SurveyBlockComponent, 
  QuestionnaireBlockComponent,FormTitleBlockComponent, QuestionnaireSubOptionComponent, 
  StartWrapperBlockComponent, QuestionsBlockComponent, AttendanceBlockComponent, 
  ConfirmationBlockComponent, PasswordBlockComponent, NextBlockComponent, FormPhotoComponent, PainLevelComponent,
  DrawToolBlockComponent, PhysicianBlockComponent, EndWrapperBlockComponent
];


