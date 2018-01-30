import { Size, ButtonConfig, ButtonType } from '../../../models/gallery';

/**
 * Default button size object
 * @type Size
 */
export const KS_DEFAULT_SIZE: Size = { height: 'auto', width: '30px' };

/**
 * Default close button object
 * @type ButtonConfig
 */
export const KS_DEFAULT_BTN_CLOSE: ButtonConfig = {
    className: 'close-image',
    size: KS_DEFAULT_SIZE,
    type: ButtonType.CLOSE,
    title: 'Close this modal image gallery',
    ariaLabel: 'Close this modal image gallery'
};
/**
 * Default download button object
 * @type ButtonConfig
 */
export const KS_DEFAULT_BTN_DOWNLOAD: ButtonConfig = {
    className: 'download-image',
    size: KS_DEFAULT_SIZE,
    type: ButtonType.DOWNLOAD,
    title: 'Download the current image',
    ariaLabel: 'Download the current image'
};
/**
 * Default exturl button object
 * @type ButtonConfig
 */
export const KS_DEFAULT_BTN_EXTURL: ButtonConfig = {
    className: 'ext-url-image',
    size: KS_DEFAULT_SIZE,
    type: ButtonType.EXTURL,
    title: 'Navigate the current image',
    ariaLabel: 'Navigate the current image'
};
/**
 * Default refresh button object
 * @type ButtonConfig
 */
export const KS_DEFAULT_BTN_REFRESH: ButtonConfig = {
    className: 'refresh-image',
    size: KS_DEFAULT_SIZE,
    type: ButtonType.REFRESH,
    title: 'Refresh all images',
    ariaLabel: 'Refresh all images'
};
/**
 * Default delete button object
 * @type ButtonConfig
 */
export const KS_DEFAULT_BTN_DELETE: ButtonConfig = {
    className: 'delete-image',
    size: KS_DEFAULT_SIZE,
    type: ButtonType.DELETE,
    title: 'Delete the current image',
    ariaLabel: 'Delete the current image'
};