import { TestBed, inject } from '@angular/core/testing';

import { QaScoresService } from './qa-scores.service';

describe('QaScoresService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QaScoresService]
    });
  });

  it('should be created', inject([QaScoresService], (service: QaScoresService) => {
    expect(service).toBeTruthy();
  }));
});
