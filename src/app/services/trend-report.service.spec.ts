import { TestBed, inject } from '@angular/core/testing';

import { TrendReportService } from './trend-report.service';

describe('TrendReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrendReportService]
    });
  });

  it('should be created', inject([TrendReportService], (service: TrendReportService) => {
    expect(service).toBeTruthy();
  }));
});
