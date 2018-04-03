import { TestBed, inject } from '@angular/core/testing';

import { IntegrationService } from './integration.service';

describe('IntegrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntegrationService]
    });
  });

  it('should be created', inject([IntegrationService], (service: IntegrationService) => {
    expect(service).toBeTruthy();
  }));
});
