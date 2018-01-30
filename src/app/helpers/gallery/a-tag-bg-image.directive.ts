import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { Image } from '../../models/gallery/image.class';

/**
 * Directive to add an image to an `<a>` tag with some additional custom properties.
 */
@Directive({
  selector: '[ksATagBgImage]'
})
export class ATagBgImageDirective implements OnInit, OnChanges {
  /**
   * Object of type `Image` that represents the image to add to the `<a>` tag.
   */
  @Input() image: Image;
  /**
   * Additional style to customize the background attribute.
   * Empty string by default.
   */
  @Input() style: string;

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
   * Private method to add an image as background of an `<a>` tag.
   */
  private applyStyle() {
    if (!this.image || (!this.image.plain && !this.image.modal)) {
      return;
    }

    const imgPath: string = this.image.plain && this.image.plain.img ? this.image.plain.img : this.image.modal.img;
    this.renderer.setStyle(this.el.nativeElement, 'background', `url("${imgPath}") ${this.style}`);
  }
}