import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilebuilderComponent } from './profilebuilder.component';

describe('ProfilebuilderComponent', () => {
  let component: ProfilebuilderComponent;
  let fixture: ComponentFixture<ProfilebuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilebuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilebuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
