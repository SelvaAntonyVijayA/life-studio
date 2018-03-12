import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBackgroundComponent } from './menu-background.component';

describe('MenuBackgroundComponent', () => {
  let component: MenuBackgroundComponent;
  let fixture: ComponentFixture<MenuBackgroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuBackgroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
