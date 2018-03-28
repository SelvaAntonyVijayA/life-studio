import { TestBed, inject } from '@angular/core/testing';

import { EnginesService } from './engines.service';

describe('EnginesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnginesService]
    });
  });

  it('should be created', inject([EnginesService], (service: EnginesService) => {
    expect(service).toBeTruthy();
  }));
});
