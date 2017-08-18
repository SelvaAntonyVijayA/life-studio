import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockItem } from './block-item';
import { BlockComponent } from './block.component';
import { InquiryBlockComponent, NotesBlockComponent, SurveyBlockComponent} from './tileblocks.components';
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

  constructor(private componentFactoryResolver: ComponentFactoryResolver, elemRef: ElementRef) { }


  /* Checking the block by block type */

  loadWidgets(type: any, data: any) {
    var blocks = this.blocks;
    var viewName = "";

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, {"type": "notes", "blockName": "Notes"}));
      viewName = "notesView"
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, {"type": "inquiry", "blockName": "Inquiry" , "data": {"email": "", "inquiryText": ""}}));
      viewName = "inquiryView"
    }

    if (type === "survey") {
      blocks.push(new BlockItem(SurveyBlockComponent, {"type": "survey", "blockName": "Questionnaire", "data":{"controls": "radio", "multiple": "true"}}));
      viewName = "surveyView"
    }

    this.loadComponent(viewName);
  }

  ngOnInit() {
    this.blocks = [];

    this.opts = {
      position: 'right',
      barBackground: '#8A8A8A',
      barWidth: "4",
      gridWidth: "2"
    };
  }

  deleteBlock(view: any) {
    let index = this.blockSelected.viewContainerRef.indexOf(view);
    this.blockSelected.viewContainerRef.remove(index);
    this.blocks.splice(0, 1);

    this.currentAddIndex = this.currentAddIndex - 1;
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


  /* Loading the block components */

  loadComponent(viewName: string) {
    this.currentAddIndex = this.currentAddIndex + 1;
    let adBlock = this.blocks[this.currentAddIndex];

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(adBlock.component);

    let viewContainerRef = this.blockSelected.viewContainerRef;
    //viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    adBlock.block["view"] = componentRef.hostView;
    componentRef.instance[viewName].subscribe(view => this.deleteBlock(view));

    (<BlockComponent>componentRef.instance).block = adBlock.block;
  }
}
