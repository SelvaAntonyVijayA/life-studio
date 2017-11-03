import { Output, EventEmitter, Input, HostListener, Directive, ViewChild, HostBinding, ElementRef } from '@angular/core';
import { DragService } from '../services/drag.service';

export interface DropTargetOptions {
  zone?: string;
}

@Directive({
  selector: '[iliDropTarget]'
})
export class DropTargetDirective {
  constructor(private dragService?: DragService, private el?: ElementRef) {

  }  

  @ViewChild('dropTarget') dropTarget:ElementRef;
  
  @Input()
  set iliDropTarget(options: DropTargetOptions) {
    if (options) {
      this.options = options;
    }
  }

  @Output('myDrop') drop = new EventEmitter();
  private options: DropTargetOptions = {};

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  onDragOver(event) {
    const { zone = 'zone' } = this.options;

    if (this.dragService.accepts(zone)) {
      event.preventDefault();
    }
  };

  @HostListener('drop', ['$event'])
  onDrop(event) {
    if(this.el.nativeElement.classList.contains('drop_target')) {
      const data = JSON.parse(event.dataTransfer.getData('Text'));
      this.drop.next(data);
    }
  }
}