import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DIRECTIVES } from '../helpers/gallery';
import { COMPONENTS, ModalGalleryComponent } from '../components/gallery/components';
import { KEYBOARD_CONFIGURATION, KeyboardService } from '../services/keyboard.service';
import { KeyboardServiceConfig } from '../models/gallery';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [COMPONENTS, DIRECTIVES],
  exports: [ModalGalleryComponent]
})
export class GalleryModule {
  static forRoot(config?: KeyboardServiceConfig): ModuleWithProviders {
    return {
      ngModule: GalleryModule,
      providers: [
        {
          provide: KEYBOARD_CONFIGURATION,
          useValue: config ? config : {}
        },
        {
          provide: KeyboardService,
          useFactory: setupKeyboardService,
          deps: [KEYBOARD_CONFIGURATION]
        }
      ]
    };
  }
}
/**
 * Function to setup the keyboard service inside the `forRoot` method.
 * @param {KeyboardServiceConfig} injector is an interface of type `KeyboardServiceConfig` to pass data to KeyboardService
 * @returns {KeyboardService} an instance of the `KeyboardService`
 */
export function setupKeyboardService(injector: KeyboardServiceConfig): KeyboardService {
  return new KeyboardService(injector);
}
