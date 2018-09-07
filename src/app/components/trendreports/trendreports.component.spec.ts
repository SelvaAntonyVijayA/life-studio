import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendreportsComponent } from './trendreports.component';

describe('TrendreportsComponent', () => {
  let component: TrendreportsComponent;
  let fixture: ComponentFixture<TrendreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
