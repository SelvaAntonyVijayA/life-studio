import { Action } from './action.enum';
import { Size } from './size.interface';

/**
 * Class `Image` that represents an image with both `modal` and `plain` configurations.
 * Both image `id` and `modal` are mandatory, instead `plain` is optional.
 */
export class Image {
  id: number;

  modal: ModalImage;
  plain?: PlainImage;

  constructor(id: number, modal: ModalImage, plain?: PlainImage) {
    this.id = id;
    this.modal = modal;
    this.plain = plain;
  }
}

/**
 * Interface `ImageData` to configure an image, but it isn't used directly.
 * Please, refers to `PlainImage` or `ModalImage`.
 */
export interface ImageData {
  img: string;
  description?: string;
  extUrl?: string;
  title?: string;
  alt?: string;
  ariaLabel?: string;
  size?: Size;
}

/**
 * Interface `ModalImage` to configure the modal image.
 */
export interface ModalImage extends ImageData { }

/**
 * Interface `PlainImage` to configure the plain image.
 */
export interface PlainImage extends ImageData { }

/**
 * Class `ImageModalEvent` that represents the event payload with the result and the triggered action.
 */
export class ImageModalEvent {
  action: Action;
  result: number | boolean;

  constructor(action: Action, result: number | boolean) {
    this.action = action;
    this.result = result;
  }
}