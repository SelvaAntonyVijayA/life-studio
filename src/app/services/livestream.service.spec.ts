import { TestBed, inject } from '@angular/core/testing';

import { LivestreamService } from './livestream.service';

describe('LivestreamService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LivestreamService]
    });
  });

  it('should be created', inject([LivestreamService], (service: LivestreamService) => {
    expect(service).toBeTruthy();
  }));
});
