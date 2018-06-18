import { Inject, Injectable, InjectionToken } from '@angular/core';
import { MousetrapInstance, ExtendedKeyboardEvent, Mousetrap } from 'mousetrap';

import { KeyboardServiceConfig } from '../models/gallery';

export const KEYBOARD_CONFIGURATION = new InjectionToken<KeyboardServiceConfig>('KEYBOARD_CONFIGURATION');

/**
 * Service to intercept ctrl+s (or cmd+s on macOS) using a third-party library, called Mousetrap.
 */
@Injectable()
export class KeyboardService {
  /**
   * Private Mousetrap variable to store the instance.
   */
  private mousetrap: MousetrapInstance;
  /**
   * Private variable to store shortcuts as either Array or string.
   */
  private shortcuts: Array<string> | string;

  /**
   * Constructor of `KeyboardService` to init `mousetrap` and `shortcuts` private variables.
   * @param {KeyboardServiceConfig} config object received by the `forRoot()` function to init custom shortcuts
   */
  constructor(@Inject(KEYBOARD_CONFIGURATION) private config: KeyboardServiceConfig) {
    this.shortcuts = this.config && this.config.shortcuts ? this.config.shortcuts : ['ctrl+s', 'meta+s'];
    this.mousetrap = new (<any>Mousetrap)();
  }

  /**
   * Method to add a lister for ctrl+s/cmd+s keyboard events.
   * @param {(e: ExtendedKeyboardEvent, combo: string) => any} onBind callback function to add shortcuts
   */
  add(onBind: (e: ExtendedKeyboardEvent, combo: string) => any) {
    this.mousetrap.bind(this.shortcuts, (event: KeyboardEvent, combo: string) => {
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        // internet explorer
        event.returnValue = false;
      }
      onBind(event, combo);
    });
  }

  /**
   * Method to reset all listeners. Please, call this function when needed
   * to free resources ad prevent leaks.
   */
  reset() {
    this.mousetrap.reset();
  }
}
