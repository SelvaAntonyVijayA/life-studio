import { TestBed, inject } from '@angular/core/testing';

import { ReportGeneratorService } from './report-generator.service';

describe('ReportGeneratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportGeneratorService]
    });
  });

  it('should be created', inject([ReportGeneratorService], (service: ReportGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
