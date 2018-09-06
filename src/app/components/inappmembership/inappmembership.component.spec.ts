import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InappmembershipComponent } from './inappmembership.component';

describe('InappmembershipComponent', () => {
  let component: InappmembershipComponent;
  let fixture: ComponentFixture<InappmembershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InappmembershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InappmembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
