import { TestBed, inject } from '@angular/core/testing';

import { PagesettingsService } from './pagesettings.service';

describe('PagesettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PagesettingsService]
    });
  });

  it('should be created', inject([PagesettingsService], (service: PagesettingsService) => {
    expect(service).toBeTruthy();
  }));
});
