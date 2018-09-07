import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityreportsComponent } from './activityreports.component';

describe('ActivityreportsComponent', () => {
  let component: ActivityreportsComponent;
  let fixture: ComponentFixture<ActivityreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
