import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockItem } from './block-item';
import { BlockComponent } from './block.component';
import { InquiryBlockComponent } from './tileblocks.components';
import { NotesBlockComponent } from './tileblocks.components';

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

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  
  /* Checking the block by block type */

  loadWidgets(type: any, data: any) {
    var blocks = this.blocks;

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, {"type": "notes", "data":{}}));
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, {"type": "inquiry", "data":{"email": "", "text": ""}}));
    }

    this.loadComponent();
  }

  ngOnInit() {
    this.blocks = [];
  }

  saveBlocks(e: any){
   var currentBlock = this.blocks[0];
   let index = this.blockSelected.viewContainerRef.indexOf(currentBlock.block["view"]);
   this.blockSelected.viewContainerRef.remove(index);
   this.blocks.splice(0, 1);
  };

  /* Loading the block components */

  loadComponent() {
    this.currentAddIndex = this.currentAddIndex + 1;
    let adBlock = this.blocks[this.currentAddIndex];

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(adBlock.component);

    let viewContainerRef = this.blockSelected.viewContainerRef;
    //viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    adBlock.block["view"] = componentRef.hostView;

    (<BlockComponent>componentRef.instance).block = adBlock.block;
  }
}
