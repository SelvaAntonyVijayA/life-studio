import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoticonsReportsComponent } from './emoticons-reports.component';

describe('EmoticonsReportsComponent', () => {
  let component: EmoticonsReportsComponent;
  let fixture: ComponentFixture<EmoticonsReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmoticonsReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmoticonsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
