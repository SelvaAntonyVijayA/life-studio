import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AccessibilityConfig, LoadingConfig, LoadingType } from '../../../../models/gallery';


/**
 * Component with the loading spinner
 */
@Component({
  selector: 'g-loading-spinner',
  styleUrls: [
    'style-loading-spinner-standard.css',
    'style-loading-spinner-dots.css',
    'style-loading-spinner-bars.css',
    'style-loading-spinner-circular.css'
  ],
  templateUrl: 'loading-spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  /**
   * Object of type `LoadingConfig` exposed to the template.
   * It contains a field to choose a loading spinner.
   */
  @Input() loadingConfig: LoadingConfig;
  /**
   * Object of type `AccessibilityConfig` to init custom accessibility features.
   * For instance, it contains titles, alt texts, aria-labels and so on.
   */
  @Input() accessibilityConfig: AccessibilityConfig;

  /**
   * Enum of type `LoadingType` to choose the standard loading spinner.
   * Declared here to be used inside the template.
   */
  loadingStandard: LoadingType = LoadingType.STANDARD;
  /**
   * Enum of type `LoadingType` to choose the bars loading spinner.
   * Declared here to be used inside the template.
   */
  loadingBars: LoadingType = LoadingType.BARS;
  /**
   * Enum of type `LoadingType` to choose the circular loading spinner.
   * Declared here to be used inside the template.
   */
  loadingCircular: LoadingType = LoadingType.CIRCULAR;
  /**
   * Enum of type `LoadingType` to choose the dots loading spinner.
   * Declared here to be used inside the template.
   */
  loadingDots: LoadingType = LoadingType.DOTS;
}