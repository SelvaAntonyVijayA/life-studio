import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendalertsComponent } from './trendalerts.component';

describe('TrendalertsComponent', () => {
  let component: TrendalertsComponent;
  let fixture: ComponentFixture<TrendalertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendalertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendalertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
