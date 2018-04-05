import { TestBed, inject } from '@angular/core/testing';

import { PageSettingsService } from './pagesettings.service';

describe('PagesettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PageSettingsService]
    });
  });

  it('should be created', inject([PageSettingsService], (service: PageSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
