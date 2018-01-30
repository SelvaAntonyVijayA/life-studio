import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AccessibilityConfig } from '../../../models/gallery';
import { BackgroundComponent } from './background.component';

let comp: BackgroundComponent;
let fixture: ComponentFixture<BackgroundComponent>;

const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  backgroundAriaLabel: 'Modal gallery full screen background',
  backgroundTitle: '',

  plainGalleryContentAriaLabel: 'Plain gallery content',
  plainGalleryContentTitle: '',

  modalGalleryContentAriaLabel: 'Modal gallery content',
  modalGalleryContentTitle: '',

  loadingSpinnerAriaLabel: 'The current image is loading. Please be patient.',
  loadingSpinnerTitle: 'The current image is loading. Please be patient.',

  mainContainerAriaLabel: 'Current image and navigation',
  mainContainerTitle: '',
  mainPrevImageAriaLabel: 'Previous image',
  mainPrevImageTitle: 'Previous image',
  mainNextImageAriaLabel: 'Next image',
  mainNextImageTitle: 'Next image',

  dotsContainerAriaLabel: 'Image navigation dots',
  dotsContainerTitle: '',
  dotAriaLabel: 'Navigate to image number',

  previewsContainerAriaLabel: 'Image previews',
  previewsContainerTitle: '',
  previewScrollPrevAriaLabel: 'Scroll previous previews',
  previewScrollPrevTitle: 'Scroll previous previews',
  previewScrollNextAriaLabel: 'Scroll next previews',
  previewScrollNextTitle: 'Scroll next previews'
};

function initTestBed() {
  return TestBed.configureTestingModule({
    declarations: [BackgroundComponent]
  }).compileComponents();
}

describe('BackgroundComponent', () => {
  beforeEach(async(() => {
    return initTestBed();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundComponent);
    comp = fixture.componentInstance;
  });

  it('should instantiate it', () => expect(comp).not.toBeNull());

  describe('---YES---', () => {
    it(`should display the background with default accessibility config`, () => {
      comp.isOpen = true;
      comp.accessibilityConfig = DEFAULT_ACCESSIBILITY;
      fixture.detectChanges();

      const element: DebugElement = fixture.debugElement;
      const background: DebugElement = element.query(By.css('div.ng-overlay'));
      expect(background).not.toBeUndefined();
      expect(background.name).toBe('div');
      expect(background.attributes['class']).toBe('ng-overlay');
      expect(background.attributes['aria-label']).toBe(DEFAULT_ACCESSIBILITY.backgroundAriaLabel);
      expect(background.properties['title']).toBe(DEFAULT_ACCESSIBILITY.backgroundTitle);
    });
    it(`should display the background with custom accessibility config`, () => {
      const customAccessibilityConfig: AccessibilityConfig = Object.assign({}, DEFAULT_ACCESSIBILITY);
      customAccessibilityConfig.backgroundTitle = 'custom backgroundTitle';
      customAccessibilityConfig.backgroundAriaLabel = 'custom backgroundAriaLabel';

      comp.isOpen = true;
      comp.accessibilityConfig = customAccessibilityConfig;
      fixture.detectChanges();

      const element: DebugElement = fixture.debugElement;
      const background: DebugElement = element.query(By.css('div.ng-overlay'));
      expect(background).not.toBeUndefined();
      expect(background.name).toBe('div');
      expect(background.attributes['class']).toBe('ng-overlay');
      expect(background.attributes['aria-label']).toBe(customAccessibilityConfig.backgroundAriaLabel);
      expect(background.properties['title']).toBe(customAccessibilityConfig.backgroundTitle);
    });
  });
  describe('---NO---', () => {
    it(`shouldn't display the background`, () => {
      comp.isOpen = false;
      comp.accessibilityConfig = DEFAULT_ACCESSIBILITY;
      fixture.detectChanges();

      const element: DebugElement = fixture.debugElement;
      const background: DebugElement = element.query(By.css('div.ng-overlay'));
      expect(background).toBeNull();
    });
  });
});