import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileBackgroundComponent } from './tile-background.component';

describe('TileBackgroundComponent', () => {
  let component: TileBackgroundComponent;
  let fixture: ComponentFixture<TileBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
