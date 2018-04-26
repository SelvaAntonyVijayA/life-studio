import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaScoresComponent } from './qa-scores.component';

describe('QaScoresComponent', () => {
  let component: QaScoresComponent;
  let fixture: ComponentFixture<QaScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
