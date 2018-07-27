import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamUrlComponent } from './stream-url.component';

describe('StreamUrlComponent', () => {
  let component: StreamUrlComponent;
  let fixture: ComponentFixture<StreamUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
