import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[ksKeyboardNavigation]'
})
export class KeyboardNavigationDirective {
  @Input() isOpen: boolean;

  @Output() keyPress: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Listener to catch keyboard's events and call the right method based on the key.
   * For instance, pressing esc, this will call `closeGallery(Action.KEYBOARD)` and so on.
   * If you passed a valid `keyboardConfig` esc, right and left buttons will be customized based on your data.
   * @param e KeyboardEvent caught by the listener.
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isOpen) {
      return;
    }
    this.keyPress.emit(e.keyCode);
  }
}