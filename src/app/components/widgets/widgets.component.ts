import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
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

  constructor(private componentFactoryResolver: ComponentFactoryResolver, elemRef: ElementRef) { }


  /* Checking the block by block type */

  loadWidgets(type: any, data: any) {
    var blocks = this.blocks;

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, { "type": "notes", "data": {} }));
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, { "type": "inquiry", "data": { "email": "vijay@g.com", "text": "" } }));
    }

    this.loadComponent();
  }

  ngOnInit() {
    this.blocks = [];
  }

  deleteBlock(view: any) {
    let index = this.blockSelected.viewContainerRef.indexOf(view);
    this.blockSelected.viewContainerRef.remove(index);
    this.blocks.splice(0, 1);

    this.currentAddIndex = this.currentAddIndex - 1;
  }

  saveBlocks(e: any) {


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
    componentRef.instance.blockView.subscribe(view => this.deleteBlock(view));

    (<BlockComponent>componentRef.instance).block = adBlock.block;
  }
}
