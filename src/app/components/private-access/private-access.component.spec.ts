import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateAccessComponent } from './private-access.component';

describe('PrivateAccessComponent', () => {
  let component: PrivateAccessComponent;
  let fixture: ComponentFixture<PrivateAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
