import { Input, HostListener, Output, EventEmitter, Directive, HostBinding, ElementRef } from '@angular/core';
import { DragService } from '../services/drag.service';

export interface DraggableOptions {
  zone?: string;
  data?: any;
  page?: string;
}

@Directive({
  selector: '[iliDraggable]'
})
export class DraggableDirective {
  constructor(private dragService?: DragService, private el?: ElementRef) {
  }

  private options: DraggableOptions = {};

  @HostBinding('draggable')
  get draggable() {
    var isDraggable = this.options.page != "tiles" && this.options["data"].hasOwnProperty("_id") ? true : false;
    return isDraggable;
  };

  @Input()
  set iliDraggable(options: DraggableOptions) {
    if (options) {
      this.options = options;
    }
  };

  @HostListener('dragstart', ['$event'])
  onDragStart(event) {
    const { zone = 'zone', data = {} } = this.options;
    this.dragService.startDrag(zone);
    event.dataTransfer.setData('Text', JSON.stringify(data));
  };

  /*@HostListener('mouseover', ['$event'])
  onMouseOver(event) {
    this.el.nativeElement.style.backgroundColor = '#F2F2F2';
    this.el.nativeElement.style.border = "2px outset #999999";
  };

  @HostListener('mouseout', ['$event'])
  onMouseOut(event) {
    this.el.nativeElement.style.backgroundColor = '#FFFFFF';
    this.el.nativeElement.style.border = "2px outset rgba(255, 255, 255, .5)";
  };*/
}