import { async, inject, TestBed } from '@angular/core/testing';
import { InjectionToken } from '@angular/core';

import { KeyboardService } from './keyboard.service';
import { KeyboardServiceConfig } from '../models/gallery';

const KEYBOARD_CONFIGURATION = new InjectionToken<KeyboardServiceConfig>('KEYBOARD_CONFIGURATION');

function setupRouter(injector: KeyboardServiceConfig) {
  return new KeyboardService(injector);
}

describe('KeyboardService', () => {

  describe('KeyboardService WITHOUT external config via forRoot()', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          providers: [
            {
              provide: KeyboardService,
              useFactory: setupRouter,
              deps: [KEYBOARD_CONFIGURATION]
            },
            {
              provide: KEYBOARD_CONFIGURATION,
              useValue: {}
            }
          ]
        });
      })
    );

    it('should instantiate service when inject service',
      inject([KeyboardService], (service: KeyboardService) => {
        expect(service instanceof KeyboardService).toEqual(true);
      })
    );

    describe('#reset()', () => {
      it('should call reset',
        inject([KeyboardService], (service: KeyboardService) => {
          service.reset();
        })
      );
    });

    describe('#add()', () => {
      it('should call add',
        inject([KeyboardService], (service: KeyboardService) => {
          service.add(() => null);
        })
      );
    });
  });

  describe('KeyboardService WITH external config via forRoot()', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          providers: [
            {
              provide: KeyboardService,
              useFactory: setupRouter,
              deps: [KEYBOARD_CONFIGURATION]
            },
            {
              provide: KEYBOARD_CONFIGURATION,
              useValue: { shortcuts: ['ctrl+a', 'ctrl+s'] }
            }
          ]
        });
      })
    );

    it('should instantiate service when inject service',
      inject([KeyboardService], (service: KeyboardService) => {
        expect(service instanceof KeyboardService).toEqual(true);
      })
    );

    describe('#reset()', () => {
      it('should call reset',
        inject([KeyboardService], (service: KeyboardService) => {
          service.reset();
        })
      );
    });

    describe('#add()', () => {
      it('should call add',
        inject([KeyboardService], (service: KeyboardService) => {
          service.add(() => null);
        })
      );
    });
  });
});