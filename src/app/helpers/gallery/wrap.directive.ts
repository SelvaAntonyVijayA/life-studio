import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

/**
 * Directive to change the flex-wrap css property of an element.
 */
@Directive({
  selector: '[ksWrap]'
})
export class WrapDirective implements OnInit, OnChanges {
  /**
   * Boolean input that it's true to add 'flex-wrap: wrap', 'flex-wrap: nowrap' otherwise.
   */
  @Input() wrap: boolean;
  /**
   * String input to force the width of the element to be able to see wrapping.
   */
  @Input() width: string;

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
   * Private method to change both widht and flex-wrap css properties.
   */
  private applyStyle() {
    // TODO is this right???? If wrap os false I cannot apply width and flex-wrap
    if (!this.wrap) {
      return;
    }
    this.renderer.setStyle(this.el.nativeElement, 'width', this.width);
    this.renderer.setStyle(this.el.nativeElement, 'flex-wrap', this.wrap ? 'wrap' : 'nowrap');
  }
}