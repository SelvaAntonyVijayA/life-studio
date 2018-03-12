import { TestBed, inject } from '@angular/core/testing';

import { LoaderSharedService } from './loader-shared.service';

describe('LoaderSharedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoaderSharedService]
    });
  });

  it('should be created', inject([LoaderSharedService], (service: LoaderSharedService) => {
    expect(service).toBeTruthy();
  }));
});
