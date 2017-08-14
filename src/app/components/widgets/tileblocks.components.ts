import { Component, EventEmitter, Input } from '@angular/core';
import { BlockComponent } from './block.component';
import { WidgetsComponent } from './widgets.component';

@Component({
  selector: 'block-controls',
  outputs: ["removeBlock"],
  template: `<div class="content_buttons">
             <div style="float:left;" class="drag_cursor"><span class="widgetstext">{{block!.data!.email}}</span></div>
             <div class="tigger_btn"><span class="glyphicon glyphicon-off"></span></div>
             <div class="tigger_btn" (click)="clearBlock(block['view'])" title="Remove"><span class="glyphicon glyphicon-remove"></span></div>
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
    var nous = this.block;
    this.removeBlock.emit(view)
  }
}

@Component({
  selector: 'inquiry-block',
  outputs: ["blockView"],
  template: `<div (compo)="block" version="" value="" isForm=true class="page_block tile_block">
             <block-controls (removeBlock)="deleteBlock($event)" [(block)]= "block"></block-controls>
             <span class="txt-email-notes">Separate multiple email addresses with a comma followed by a space</span>
             <div class="confirmation_text_block">
             <input type="text" placeholder="To email address" id="email" [(ngModel)]="block!.data!.email" value="" class="form-control input-sm url_block_url">
             </div>
             <div class="confirmation_text_block">
             <input [(ngModel)]="block!.data!.text" type="text" placeholder="Type your inquiry here" id="inquiry-text" value="" class="form-control input-sm url_block_url">
             </div>
             </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class InquiryBlockComponent implements BlockComponent {
  @Input() block: any;
  blockView = new EventEmitter<any>();

  deleteBlock(view: any) {
    this.blockView.emit(view);
  };
}

@Component({
  selector: 'notes-block',
  template: `<div blockType="notes" version="" value="" isForm=true class='page_block tile_block'>
             <block-controls> </block-controls>
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


}

export const TileBlocksComponents = [InquiryBlockComponent, NotesBlockComponent, BlockControls];


