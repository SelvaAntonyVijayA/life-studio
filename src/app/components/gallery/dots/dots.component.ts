import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NEXT, getIndex } from '../../../helpers/gallery.util';
import { AccessibleComponent } from '../accessible.component';
import { Image, AccessibilityConfig, DotsConfig, InternalLibImage } from '../../../models/gallery';

@Component({
  selector: 'g-dots',
  templateUrl: './dots.component.html',
  styleUrls: ['./dots.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DotsComponent extends AccessibleComponent implements OnInit {
  /**
   * Object of type `InternalLibImage` that represent the visible image.
   */
  @Input() currentImage: InternalLibImage;
  /**
   * Array of `InternalLibImage` that represent the model of this library with all images,
   * thumbs and so on.
   */
  @Input() images: InternalLibImage[];
  /**
   * Object of type `DotsConfig` to init DotsComponent's features.
   * For instance, it contains a param to show/hide this component.
   */
  @Input() dotsConfig: DotsConfig = { visible: true };
  /**
   * Object of type `AccessibilityConfig` to init custom accessibility features.
   * For instance, it contains titles, alt texts, aria-labels and so on.
   */
  @Input() accessibilityConfig: AccessibilityConfig;
  /**
   * Output to emit clicks on dots. The payload contains a number that represent
   * the index of the clicked dot.
   */
  @Output() clickDot: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Object of type `DotsConfig` exposed to the template. This field is initialized
   * applying transformations, default values and so on to the input of the same type.
   */
  configDots: DotsConfig;

  /**
   * Method ´ngOnInit´ to build `configDots` applying a default value.
   * This is an Angular's lifecycle hook, so its called automatically by Angular itself.
   * In particular, it's called only one time!!!
   */
  ngOnInit() {
    const defaultConfig: DotsConfig = { visible: true };
    this.configDots = Object.assign(defaultConfig, this.dotsConfig);
  }

  /**
   * Method to check if an image is active (i.e. the current image).
   * It checks currentImage and images to prevent errors.
   * @param {number} index of the image to check if it's active or not
   * @returns {boolean} true if is active (and input params are valid), false otherwise
   */
  isActive(index: number): boolean {
    if (!this.currentImage || !this.images || this.images.length === 0) {
      return false;
    }
    let imageIndex: number;
    try {
      imageIndex = getIndex(this.currentImage, this.images);
    } catch (err) {
      console.error(`Internal error while trying to show the active 'dot'`, err);
      return false;
    }
    return index === imageIndex;
  }

  /**
   * Method called by events from keyboard and mouse.
   * @param {number} index of the dot
   * @param {KeyboardEvent | MouseEvent} event payload
   */
  onDotEvent(index: number, event: KeyboardEvent | MouseEvent) {
    const result: number = super.handleImageEvent(event);
    if (result === NEXT) {
      this.clickDot.emit(index);
    }
  }

  /**
   * Method used in the template to track ids in ngFor.
   * @param {number} index of the array
   * @param {Image} item of the array
   * @returns {number} the id of the item
   */
  trackById(index: number, item: Image): number {
    return item.id;
  }
}