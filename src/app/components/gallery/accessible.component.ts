
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DIRECTION_RIGHT, ENTER_KEY, MOUSE_MAIN_BUTTON_CLICK, NEXT, NOTHING, PREV, SPACE_KEY } from '../../helpers/gallery.util';

/**
 * Provides some useful methods to add accessibility features to subclasses.
 * In particular, it exposes a method to handle navigation event with both Keyboard and Mouse
 * and another with also the direction (right or left).
 */
@Component({
  selector: 'g-accessible',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibleComponent {
  /**
    * Method to handle navigation events with both Keyboard and Mouse.
    * @param {string} direction of the navigation that can be either 'next' or 'prev'
    * @param {KeyboardEvent | MouseEvent} event payload
    * @returns {number} -1 for PREV, 1 for NEXT and 0 for NOTHING
    */
  handleNavigationEvent(direction: string, event: KeyboardEvent | MouseEvent): number {
    if (!event) {
      return NOTHING;
    }
    if (event instanceof KeyboardEvent) {
      return this.handleKeyboardNavigationEvent(direction, event);
    } else if (event instanceof MouseEvent) {
      return this.handleMouseNavigationEvent(direction, event);
    }
    return NOTHING;
  }

  /**
   * Method to handle events over an image, for instance a keypress with the Keyboard or a Mouse click.
   * @param {KeyboardEvent | MouseEvent} event payload
   * @returns {number} 1 for NEXT and 0 for NOTHING
   */
  handleImageEvent(event: KeyboardEvent | MouseEvent): number {
    if (!event) {
      return NOTHING;
    }
    if (event instanceof KeyboardEvent) {
      return this.handleImageKeyboardEvent(event);
    } else if (event instanceof MouseEvent) {
      return this.handleImageMouseEvent(event);
    }
    return NOTHING;
  }

  /**
   * Private method to handle keyboard events over an image.
   * @param {KeyboardEvent} event payload
   * @returns {number} 1 for NEXT and 0 for NOTHING
   */
  private handleImageKeyboardEvent(event: KeyboardEvent): number {
    const key: number = event.keyCode;
    if (key === SPACE_KEY || key === ENTER_KEY) {
      return NEXT;
    }
    return NOTHING;
  }

  /**
   * Private method to handle mouse events over an image.
   * @param {MouseEvent} event payload
   * @returns {number} 1 for NEXT and 0 for NOTHING
   */
  private handleImageMouseEvent(event: MouseEvent): number {
    const mouseBtn: number = event.button;
    if (mouseBtn === MOUSE_MAIN_BUTTON_CLICK) {
      return NEXT;
    }
    return NOTHING;
  }

  /**
   * Method to handle events over an image, for instance a keypress with the Keyboard or a Mouse click.
   * @param {string} direction of the navigation that can be either 'next' or 'prev'
   * @param {KeyboardEvent} event payload
   * @returns {number} -1 for PREV, 1 for NEXT and 0 for NOTHING
   */
  private handleKeyboardNavigationEvent(direction: string, event: KeyboardEvent): number {
    const key: number = event.keyCode;
    if (key === SPACE_KEY || key === ENTER_KEY) {
      return direction === DIRECTION_RIGHT ? NEXT : PREV;
    }
    return NOTHING;
  }

  /**
   * Method to handle events over an image, for instance a keypress with the Keyboard or a Mouse click.
   * @param {string} direction of the navigation that can be either 'next' or 'prev'
   * @param {MouseEvent} event payload
   * @returns {number} -1 for PREV, 1 for NEXT and 0 for NOTHING
   */
  private handleMouseNavigationEvent(direction: string, event: MouseEvent): number {
    const mouseBtn: number = event.button;
    if (mouseBtn === MOUSE_MAIN_BUTTON_CLICK) {
      return direction === DIRECTION_RIGHT ? NEXT : PREV;
    }
    return NOTHING;
  }
}
