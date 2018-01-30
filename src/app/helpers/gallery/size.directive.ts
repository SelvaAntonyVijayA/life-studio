import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { Size } from '../../models/gallery';

/**
 * Directive to change the size of an element.
 */
@Directive({
  selector: '[ksSize]'
})
export class SizeDirective implements OnInit, OnChanges {
  /**
   * Object of type `Size` to resize the element.
   */
  @Input() sizeConfig: Size;

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  /**
   * Method ´ngOnInit´ to apply the style of this directive.
   * This is an Angular's lifecycle hook, so its called automatically by Angular itself.
   * In particular, it's called only one time!!!
   */
  ngOnInit() {
    this.applyStyle();
  }

  /**
   * Method ´ngOnChanges´ to apply the style of this directive.
   * This is an Angular's lifecycle hook, so its called automatically by Angular itself.
   * In particular, it's called when any data-bound property of a directive changes!!!
   */
  ngOnChanges() {
    this.applyStyle();
  }

  /**
   * Private method to change both width and height of an element.
   */
  private applyStyle() {
    if (!this.sizeConfig) {
      return;
    }
    // apply [style.width]
    this.renderer.setStyle(this.el.nativeElement, 'width', this.sizeConfig.width);
    this.renderer.setStyle(this.el.nativeElement, 'height', this.sizeConfig.height);
  }
}