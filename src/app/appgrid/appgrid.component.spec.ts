import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppgridComponent } from './appgrid.component';

describe('AppgridComponent', () => {
  let component: AppgridComponent;
  let fixture: ComponentFixture<AppgridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppgridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
