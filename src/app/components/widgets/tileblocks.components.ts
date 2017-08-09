import { Component, Input } from '@angular/core';
import { BlockComponent } from './block.component';

@Component({
  template: `<div blockType="block.type" version="" value="" isForm=true class="page_block tile_block">
              <span class="txt-email-notes">Separate multiple email addresses with a comma followed by a space</span>
              <div class="confirmation_text_block">
              <input type="text" placeholder="To email address" id="email" value="" class="form-control input-sm url_block_url">
              </div>
              <div class="confirmation_text_block">
              <input type="text" placeholder="Type your inquiry here" id="inquiry-text" value="" class="form-control input-sm url_block_url">
              </div>
              </div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class InquiryBlockComponent implements BlockComponent {
  @Input() block: any;
}

@Component({
  template: `<div blockType="notes" version="" value="" isForm=true class="notes-block content_notes_block tile_block tile_blocks_widgets page_block"></div>`,
  styleUrls: ['./tileblocks.component.css']
})

export class NotesBlockComponent implements BlockComponent {
  @Input() block: any;
}

export const TileBlocksComponents = [InquiryBlockComponent, NotesBlockComponent];


