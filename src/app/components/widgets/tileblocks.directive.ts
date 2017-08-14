import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[block-selected]',
})

export class TileBlocksDirective {
  constructor(public viewContainerRef: ViewContainerRef) { 
    
  }
}