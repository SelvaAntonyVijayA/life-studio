import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Image, PreviewConfig, SlideConfig, AccessibilityConfig, InternalLibImage, Size } from '../../../models/gallery';
import { AccessibleComponent } from '../accessible.component';
import { NEXT, PREV, getIndex } from '../../../helpers/gallery.util';

@Component({
  selector: 'g-previews',
  templateUrl: './previews.component.html',
  styleUrls: ['./previews.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewsComponent extends AccessibleComponent implements OnInit {
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
   * Object of type `SlideConfig` to get `infinite sliding`.
   */
  @Input() slideConfig: SlideConfig;
  /**
   * Object of type `PreviewConfig` to init PreviewsComponent's features.
   * For instance, it contains a param to show/hide this component, sizes.
   */
  @Input() previewConfig: PreviewConfig;
  /**
   * Object of type `AccessibilityConfig` to init custom accessibility features.
   * For instance, it contains titles, alt texts, aria-labels and so on.
   */
  @Input() accessibilityConfig: AccessibilityConfig;
  /**
   * Output to emit the clicked preview. The payload contains the `InternalLibImage` associated to the clicked preview.
   */
  @Output() clickPreview: EventEmitter<InternalLibImage> = new EventEmitter<InternalLibImage>();

  /**
   * Array of `InternalLibImage` exposed to the template. This field is initialized
   * applying transformations, default values and so on to the input of the same type.
   */
  previews: InternalLibImage[] = [];
  /**
   * Object of type `PreviewConfig` exposed to the template. This field is initialized
   * applying transformations, default values and so on to the input of the same type.
   */
  configPreview: PreviewConfig;

  /**
   * Start index of the input images used to display previews.
   */
  start: number;
  /**
   * End index of the input images used to display previews.
   */
  end: number;

  /**
   * Default preview's size object
   */
  private defaultPreviewSize: Size = { height: '50px', width: 'auto' };
  /**
   * Default preview's config object
   */
  private defaultPreviewConfig: PreviewConfig = {
    visible: true,
    number: 3,
    arrows: true,
    clickable: true,
    // alwaysCenter: false, // TODO still not implemented
    size: this.defaultPreviewSize
  };

  /**
   * Method ´ngOnInit´ to build `configPreview` applying a default value and also to
   * init the `previews` array.
   * This is an Angular's lifecycle hook, so its called automatically by Angular itself.
   * In particular, it's called only one time!!!
   */
  ngOnInit() {
    this.configPreview = Object.assign(this.defaultPreviewConfig, this.previewConfig);
    let index: number;
    try {
      index = getIndex(this.currentImage, this.images);
    } catch (err) {
      throw err;
    }
    switch (index) {
      case 0:
        // first image
        this.setBeginningIndexesPreviews();
        break;
      case this.images.length - 1:
        // last image
        this.setEndIndexesPreviews();
        break;
      default:
        // other images
        this.setIndexesPreviews();
        break;
    }
    this.previews = this.images.filter((img: InternalLibImage, i: number) => i >= this.start && i < this.end);
  }

  /**
   * Method to check if an image is active (i.e. a preview image).
   * @param {InternalLibImage} preview is an image to check if it's active or not
   * @returns {boolean} true if is active, false otherwise
   */
  isActive(preview: InternalLibImage): boolean {
    if (!preview || !this.currentImage) {
      return false;
    }
    return preview.id === this.currentImage.id;
  }

  // TODO improve this method to simplify the sourcecode + remove duplicated codelines
  /**
   * Method ´ngOnChanges´ to update `previews` array.
   * Also, both `start` and `end` local variables will be updated accordingly.
   * This is an Angular's lifecycle hook, so its called automatically by Angular itself.
   * In particular, it's called when any data-bound property of a directive changes!!!
   */
  ngOnChanges(changes: SimpleChanges) {
    const simpleChange: SimpleChange = changes.currentImage;
    if (!simpleChange) {
      return;
    }
    const prev: InternalLibImage = simpleChange.previousValue;
    const current: InternalLibImage = simpleChange.currentValue;

    if (prev && current && prev.id !== current.id) {
      // to manage infinite sliding I have to reset both `start` and `end` at the beginning
      // to show again previews from the first image.
      // This happens when you navigate over the last image to return to the first one
      let prevIndex: number;
      let currentIndex: number;
      try {
        prevIndex = getIndex(prev, this.images);
        currentIndex = getIndex(current, this.images);
      } catch (err) {
        console.error('Cannot get previous and current image indexes in previews');
        throw err;
      }
      if (prevIndex === this.images.length - 1 && currentIndex === 0) {
        // first image
        this.setBeginningIndexesPreviews();
        this.previews = this.images.filter((img: InternalLibImage, i: number) => i >= this.start && i < this.end);
        return;
      }
      // the same for the opposite case, when you navigate back from the fist image to go to the last one.
      if (prevIndex === 0 && currentIndex === this.images.length - 1) {
        // last image
        this.setEndIndexesPreviews();
        this.previews = this.images.filter((img: InternalLibImage, i: number) => i >= this.start && i < this.end);
        return;
      }

      // otherwise manage standard scenarios
      if (prevIndex > currentIndex) {
        this.previous();
      } else if (prevIndex < currentIndex) {
        this.next();
      }
    }
  }

  /**
   * Method called by events from both keyboard and mouse on a preview.
   * This will trigger the `clickpreview` output with the input preview as its payload.
   * @param {InternalLibImage} preview that triggered this method
   * @param {KeyboardEvent | MouseEvent} event payload
   */
  onImageEvent(preview: InternalLibImage, event: KeyboardEvent | MouseEvent) {
    if (!this.configPreview || !this.configPreview.clickable) {
      return;
    }
    const result: number = super.handleImageEvent(event);
    if (result === NEXT) {
      this.clickPreview.emit(preview);
    } else if (result === PREV) {
      this.clickPreview.emit(preview);
    }
  }

  /**
   * Method called by events from both keyboard and mouse on a navigation arrow.
   * @param {string} direction of the navigation that can be either 'next' or 'prev'
   * @param {KeyboardEvent | MouseEvent} event payload
   */
  onNavigationEvent(direction: string, event: KeyboardEvent | MouseEvent) {
    const result: number = super.handleNavigationEvent(direction, event);
    if (result === NEXT) {
      this.next();
    } else if (result === PREV) {
      this.previous();
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

  /**
   * Private method to init both `start` and `end` to the beginning.
   */
  private setBeginningIndexesPreviews() {
    this.start = 0;
    this.end = Math.min(<number>this.configPreview.number, this.images.length);
  }

  /**
   * Private method to init both `start` and `end` to the end.
   */
  private setEndIndexesPreviews() {
    this.start = this.images.length - 1 - (<number>this.configPreview.number - 1);
    this.end = this.images.length;
  }

  /**
   * Private method to update both `start` and `end` based on the currentImage.
   */
  private setIndexesPreviews() {
    this.start = getIndex(this.currentImage, this.images) - Math.floor(<number>this.configPreview.number / 2);
    this.end = getIndex(this.currentImage, this.images) + Math.floor(<number>this.configPreview.number / 2) + 1;
  }

  /**
   * Private method to update the visible previews navigating to the right (next).
   */
  private next() {
    // check if nextImage should be blocked
    if (this.isPreventSliding(this.images.length - 1)) {
      return;
    }

    if (this.end === this.images.length) {
      return;
    }

    this.start++;
    this.end = Math.min(this.end + 1, this.images.length);

    this.previews = this.images.filter((img: InternalLibImage, i: number) => i >= this.start && i < this.end);
  }

  /**
   * Private method to update the visible previews navigating to the left (previous).
   */
  private previous() {
    // check if prevImage should be blocked
    if (this.isPreventSliding(0)) {
      return;
    }

    if (this.start === 0) {
      return;
    }

    this.start = Math.max(this.start - 1, 0);
    this.end = Math.min(this.end - 1, this.images.length);

    this.previews = this.images.filter((img: InternalLibImage, i: number) => i >= this.start && i < this.end);
  }

  /**
   * Private method to block/permit sliding between previews.
   * @param {number} boundaryIndex is the first or the last index of `images` input array
   * @returns {boolean} if true block sliding, otherwise not
   */
  private isPreventSliding(boundaryIndex: number): boolean {
    return !!this.slideConfig && this.slideConfig.infinite === false && getIndex(this.currentImage, this.previews) === boundaryIndex;
  }
}