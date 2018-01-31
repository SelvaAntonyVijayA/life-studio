import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AccessibilityConfig } from '../../../models/gallery';

@Component({
  selector: 'g-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundComponent {

  /**
   * Boolean that it is true if the modal gallery is visible,
   * so also this component should be visible.
   */
  @Input() isOpen: boolean;
  /**
   * Object of type `AccessibilityConfig` to init custom accessibility features.
   * For instance, it contains titles, alt texts, aria-labels and so on.
   */
  @Input() accessibilityConfig: AccessibilityConfig;
}
