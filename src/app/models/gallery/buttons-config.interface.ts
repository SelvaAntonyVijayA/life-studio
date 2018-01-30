/**
 * Interface `ButtonsConfig` to show/hide buttons.
 */
import { Action } from './action.enum';
import { InternalLibImage } from './image-internal.class';
import { Size } from './size.interface';

/**
 * Interface `ButtonsConfig` to add buttons, show/hide their, and to add the strategy.
 */
export interface ButtonsConfig {
  visible: boolean;
  strategy: ButtonsStrategy;
  buttons?: ButtonConfig[];
}

/**
 * Interface `ButtonConfig` to configure a single button.
 */
export interface ButtonConfig {
  className?: string;
  size?: Size;
  fontSize?: string;
  type: ButtonType;
  title?: string;
  ariaLabel?: string;
  extUrlInNewTab?: boolean; // to open the external url in a new tab, instead of the current one
}

/**
 * Interface `ButtonEvent` to represent the event payload when a button is clicked.
 */
export interface ButtonEvent {
  button: ButtonConfig;
  image: InternalLibImage | null;
  action: Action;
}

/**
 * Enum `ButtonsStrategy` to configure the logic of a button.
 */
export enum ButtonsStrategy {
  // don't use 0 here
  // the first index is 1 and all of the following members are auto-incremented from that point on
  DEFAULT = 1,
  SIMPLE,
  ADVANCED,
  FULL,
  CUSTOM
}

/**
 * Enum `ButtonType` is the type of a button.
 */
export enum ButtonType {
  // don't use 0 here
  // the first index is 1 and all of the following members are auto-incremented from that point on
  REFRESH = 1,
  DELETE,
  EXTURL,
  DOWNLOAD,
  CLOSE,
  CUSTOM
}

/**
 * Array of admitted types of buttons.
 */
export const WHITELIST_BUTTON_TYPES: ButtonType[] = [
  ButtonType.REFRESH,
  ButtonType.DELETE,
  ButtonType.EXTURL,
  ButtonType.DOWNLOAD,
  ButtonType.CLOSE,
  ButtonType.CUSTOM
];
