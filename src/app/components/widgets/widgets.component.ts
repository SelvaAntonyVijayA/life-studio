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
  @Input() ads: BlockItem[];
  currentAddIndex: number = -1;
  @ViewChild(TileBlocksDirective) blockSelected: TileBlocksDirective;
  interval: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  loadWidgets(type: any){
    var ads = this.ads;

    if(type === "notes"){
       this.ads.push(new BlockItem(NotesBlockComponent, {}));
    }

    if(type === "inquiry"){
       ads.push(new BlockItem(InquiryBlockComponent, {})); 
    }

    this.loadComponent();
  }

  ngOnInit() {
   this.ads = [];
    //this.loadComponent();
    //this.getAds();
  }

  loadComponent() {
    this.currentAddIndex = this.currentAddIndex + 1;
    let adItem = this.ads[this.currentAddIndex];

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(adItem.component);

    let viewContainerRef = this.blockSelected.viewContainerRef;
    //viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<BlockComponent>componentRef.instance).block = adItem.block;
  }

  getAds() {
    this.interval = setInterval(() => {
      this.loadComponent();
    }, 3000);
  }
}
