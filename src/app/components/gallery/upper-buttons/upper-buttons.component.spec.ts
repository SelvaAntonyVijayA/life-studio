import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpperButtonsComponent } from './upper-buttons.component';

describe('UpperButtonsComponent', () => {
  let component: UpperButtonsComponent;
  let fixture: ComponentFixture<UpperButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpperButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpperButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
