import { TestBed, inject } from '@angular/core/testing';

import { HealthStatusRulesService } from './health-status-rules.service';

describe('HealthStatusRulesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HealthStatusRulesService]
    });
  });

  it('should be created', inject([HealthStatusRulesService], (service: HealthStatusRulesService) => {
    expect(service).toBeTruthy();
  }));
});
