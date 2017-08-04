import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TilesListComponent } from './tiles-list.component';

describe('TilesListComponent', () => {
  let component: TilesListComponent;
  let fixture: ComponentFixture<TilesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TilesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
