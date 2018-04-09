import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthandsecurityComponent } from './authandsecurity.component';

describe('AuthandsecurityComponent', () => {
  let component: AuthandsecurityComponent;
  let fixture: ComponentFixture<AuthandsecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthandsecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthandsecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
