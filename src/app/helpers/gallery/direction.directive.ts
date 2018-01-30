import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

/**
 * Directive to change the flex-direction of an element, based on two inputs (`direction` and `justify`).
 */
@Directive({
  selector: '[ksDirection]'
})
export class DirectionDirective implements OnInit, OnChanges {
  /**
   * String input to set the css flex-direction of an element.
   */
  @Input() direction: string;
  /**
   * String input to set the css justify-content of an element.
   */
  @Input() justify: string;

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
   * Private method to change both direction and justify of an element.
   */
  private applyStyle() {
    if (!this.direction || !this.justify) {
      return;
    }
    this.renderer.setStyle(this.el.nativeElement, 'flex-direction', this.direction);
    this.renderer.setStyle(this.el.nativeElement, 'justify-content', this.justify);
  }
}
