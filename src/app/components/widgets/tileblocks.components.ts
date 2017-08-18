import { Component, EventEmitter, Input } from '@angular/core';
import { BlockComponent } from './block.component';
import { WidgetsComponent } from './widgets.component';

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
             <div class="survey-opts">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="radio" [(ngModel)]="block.data.controls" type="radio" class="ques-radio" name="optradio">Radio Button</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="dropdown" [(ngModel)]="block.data.controls" type="radio" class="ques-dropdown" name="optradio">Dropdown</label></form></div>
             <div class="survey_controls">
             <form>
             <label style="font-size: 11px;" class="radio-inline"><input value="false" [(ngModel)]="block.data.multiple" type="radio" class="ques-one" name="optradio">One Answer</label>
             <label style="font-size: 11px;" class="radio-inline"><input value="true" [(ngModel)]="block.data.multiple" type="radio" class="ques-multiple" name="optradio">Multiple Answers</label></form>
             </div>
             <div class="row control-app"><label style="font-size: 11px;" class="checkbox-inline">
             <input class="chk-results" type="checkbox">Show results in app</label>
             <label style="font-size: 11px;" class="checkbox-inline"><input class="enable-note" type="checkbox">Take Notes</label>
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
             <button class="btn btn-info btn-xs survey-confirmation" style="display: block;">Add Confirmation</button>
             <button class="btn btn-ques-alert btn-info btn-xs">Add Alert</button>
             <button  class="btn btn-popup-alert btn-info btn-xs">Pop Up</button>
             </div>
             <div style="margin-top: 8px;" class="row">
              <div style="width:98%; margin-top: 7px;" class="col-md-11">
                 <ng2-summernote [(ngModel)]="data2"></ng2-summernote>
               </div>
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class SurveyBlockComponent implements BlockComponent {
  @Input() block: any;

  surveyView = new EventEmitter<any>();

  data2 = '<font style="background-color: rgb(239, 198, 49);" color="#0000ff">Dev Test</font>';

  addOption(e: any){
    this.block.data.questions.push("");
  }

  removeOption(opt: any){
    opt.remove();
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  deleteSurvey(view: any) {
    this.surveyView.emit(view);
  };
}

export const TileBlocksComponents = [InquiryBlockComponent, NotesBlockComponent, BlockControls, SurveyBlockComponent];


