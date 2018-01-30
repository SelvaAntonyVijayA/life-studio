import { Image } from '../models/gallery';

/**
 * Keycode of the keyboard's key `space`
 */
export const SPACE_KEY = 32;
/**
 * Keycode of the keyboard's key `enter`
 */
export const ENTER_KEY = 13;
/**
 * Keycode of the main mouse button
 */
export const MOUSE_MAIN_BUTTON_CLICK = 0;

/**
 * Const NEXT
 */
export const NEXT = 1;
/**
 * Const PREV
 */
export const PREV = -1;
/**
 * Const NOTHING to represents a situation when it isn't both NEXT and PREV
 */
export const NOTHING = 0;

/**
 * Const to represent the right direction
 */
export const DIRECTION_RIGHT = 'right';
/**
 * Const to represent the left direction
 */
export const DIRECTION_LEFT = 'left';

/**
 * Utility function to get the index of the input `image` from `arrayOfImages`
 * @param {Image} image to get the index. The image 'id' must be a number >= 0
 * @param {Image[]} arrayOfImages to search the image within it
 * @returns {number} the index of the image. -1 if not found.
 * @throws an Error if either image or arrayOfImages are not valid,
 *  or if the input image doesn't contain an 'id', or the 'id' is < 0
 */
export function getIndex(image: Image, arrayOfImages: Image[]): number {
    if (!image) {
        throw new Error('image must be a valid Image object');
    }

    if (!arrayOfImages) {
        throw new Error('arrayOfImages must be a valid Image[]');
    }

    if (!image.id && image.id !== 0) {
        // id = 0 is admitted
        throw new Error(`A numeric Image 'id' is mandatory`);
    }

    if (image.id < 0) {
        throw new Error(`Image 'id' must be >= 0`);
    }

    return arrayOfImages.findIndex((val: Image) => val.id === image.id);
}