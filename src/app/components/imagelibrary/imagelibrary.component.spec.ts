import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagelibraryComponent } from './imagelibrary.component';

describe('ImagelibraryComponent', () => {
  let component: ImagelibraryComponent;
  let fixture: ComponentFixture<ImagelibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagelibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagelibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
