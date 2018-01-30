import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Directive to close the modal gallery clicking on the semi-transparent background.
 * In fact, it listens for a click on all elements that aren't 'inside' and it emits
 * an event using `@Output clickOutside`.
 */
@Directive({
  selector: '[ksClickOutside]'
})
export class ClickOutsideDirective {
  /**
   * Boolean to enable this directive.
   */
  @Input() clickOutsideEnable: boolean;
  /**
   * Output to emit an event if the clicked element class doesn't contain 'inside' or it is 'hidden'. The payload is a boolean.
   */
  @Output() clickOutside: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Method called by Angular itself every click thanks to `@HostListener`.
   * @param {MouseEvent} event payload received evey click
   */
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.stopPropagation();

    const targetElement: any = event.target;

    if (!this.clickOutsideEnable || !targetElement) {
      return;
    }

    const isInside = targetElement.className && targetElement.className.startsWith('inside');
    const isHidden = targetElement.className.includes('hidden');

    // if inside => don't close modal gallery
    // if hidden => close modal gallery
    /*
        i i' h | close
        0 1  0 |   1 => close modal gallery
        0 1  1 |   1 => close modal gallery
        1 0  0 |   0
        1 0  1 |   1 => close modal gallery
     */
    if (!isInside || isHidden) {
      // close modal gallery
      this.clickOutside.emit(true);
    }
  }
}