import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthStatusRulesComponent } from './health-status-rules.component';

describe('HealthStatusRulesComponent', () => {
  let component: HealthStatusRulesComponent;
  let fixture: ComponentFixture<HealthStatusRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthStatusRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthStatusRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
