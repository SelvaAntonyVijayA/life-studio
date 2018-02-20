import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudiousersComponent } from './studiousers.component';

describe('StudiousersComponent', () => {
  let component: StudiousersComponent;
  let fixture: ComponentFixture<StudiousersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudiousersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudiousersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
