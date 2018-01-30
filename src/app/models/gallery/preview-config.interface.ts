import { Size } from './size.interface';

/**
 * Interface `PreviewConfig` to configure previews in modal gallery.
 */
export interface PreviewConfig {
  visible: boolean;
  number?: number;
  arrows?: boolean;
  clickable?: boolean;
  // alwaysCenter?: boolean; // TODO implement this - still not used
  size?: Size;
}