import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndusersComponent } from './endusers.component';

describe('EndusersComponent', () => {
  let component: EndusersComponent;
  let fixture: ComponentFixture<EndusersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndusersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
