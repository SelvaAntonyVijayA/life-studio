import {
  Component, HostBinding, Output, EventEmitter, OnInit, NgZone,
  ViewEncapsulation, ViewContainerRef, OnDestroy, Input, ComponentFactoryResolver, ViewChild, Injector, TemplateRef
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AlertType, AlertSettings, ResolveEmit } from '../../helpers/alerts';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'il-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('overlayAn', [
      state('void', style({ opacity: 0 })),
      state('leave', style({ opacity: 0 })),
      state('enter', style({ opacity: 1 })),
      transition('void => enter', animate('450ms ease-in-out')),
      transition('enter => leave', animate('450ms ease-in-out'))
    ]),
    trigger('wrapperAn', [
      state('void', style({ opacity: 0, transform: 'scale(0.75, 0.75) translate(0, -100vh)' })),
      state('leave', style({ opacity: 0, transform: 'scale(0.75, 0.75) translate(0, -100vh)' })),
      state('enter', style({ opacity: 1, transform: 'scale(1, 1) translate(0, 0)' })),
      transition('void => enter', animate('450ms cubic-bezier(.5, 1.4, .5, 1)')),
      transition('enter => leave', animate('450ms cubic-bezier(.5, 1.4, .5, 1)'))
    ]),
    trigger('symbolAn', [
      state('void', style({ opacity: 0, transform: 'rotate(90deg) scale(0.1, 0.1)' })),
      state('leave', style({ opacity: 0, transform: 'rotate(90deg) scale(0.1, 0.1)' })),
      state('enter', style({ opacity: 1, transform: 'rotate(0deg)' })),
      transition('void => enter', animate('450ms 100ms ease-in-out')),
      transition('enter => leave', animate('450ms 100ms ease-in-out'))
    ]),
    trigger('messageAn', [
      state('void', style({ opacity: 0, transform: 'translate(0, 20px) scale(0.01, 0.01)' })),
      state('leave', style({ opacity: 0, transform: 'translate(0, 20px) scale(0.01, 0.01)' })),
      state('enter', style({ opacity: 1, transform: 'translate(0, 0)' })),
      transition('void => enter', animate('450ms 100ms ease-in-out')),
      transition('enter => leave', animate('450ms 100ms ease-in-out'))
    ]),
    trigger('shortAn', [
      transition('void => enter', [
        animate('450ms 200ms ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0, 0)', offset: 0 }),
          style({ transform: 'scale(1.5, 1.5)', offset: 0.35 }),
          style({ transform: 'scale(0.9, 0.9)', offset: 0.85 }),
          style({ opacity: 1, transform: 'scale(1, 1)', offset: 1.0 })
        ]))
      ])
    ])
  ]
})

export class AlertComponent implements OnInit {

  constructor(
    private _ngZone: NgZone
  ) { }

  //@Output() close = new EventEmitter();
  @HostBinding('class') type: AlertType;

  animationState = 'enter';
  incomingData: any = {
    title: '',
    titleIsTemplate: false,
    message: '',
    messageIsTemplate: false,
    overlay: true,
    overlayClickToClose: true,
    showCloseButton: true,
    duration: 0,
    confirmText: 'Yes',
    confirmTextIsTemplate: false,
    declineText: 'No',
    declineTextIsTemplate: false,
  };

  ngOnInit() {
    /*
    if (this.incomingData.duration && this.incomingData.duration != 0) {
      this._ngZone.runOutsideAngular(() =>
        setTimeout(() =>
          this._ngZone.run(() =>
            this.close('overlayClick')
          ),
          this.incomingData.duration
        )
      );
    } */
  }

  closeSelf() {
    this.close('overlayClick')
  }

  close(type: string) {
    this.animationState = 'leave';
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this._ngZone.run(() => {
          this.resolve({ resolved: false });
        });
      }, 450);
    });
  }

  resolve(how: ResolveEmit) {
    this.animationState = 'leave';
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this._ngZone.run(() => {
          this.incomingData.resolve.next(how);
        });
      }, 450);
    });
  }

  overlayClick() {
    if (!this.incomingData.overlayClickToClose) {
      return;
    }

    this.close('overlayClick')
  }
}

@Component({
  selector: 'il-alerts',
  entryComponents: [AlertComponent],
  template: `<div #comp></div>`
})

export class AlertsComponent implements OnInit, OnDestroy {

  constructor(
    private _service: AlertService,
    private _resolver: ComponentFactoryResolver,
    private _domSanitize: DomSanitizer
  ) { }

  @ViewChild('comp', { read: ViewContainerRef }) compViewContainerRef: ViewContainerRef;

  @Input() set defaultSettings(settings: AlertSettings) {
    this.settings = Object.assign({}, this.settings, settings);
  }

  settings: AlertSettings = {
    overlay: true,
    overlayClickToClose: true,
    showCloseButton: true,
    duration: 3000,
    confirmText: 'Yes',
    declineText: 'No'
  };

  private _current: any;
  private _latestSub: any;
  private _listener: any;

  ngOnInit() {
    this._listener = this._service.alert.subscribe(alert => {

      if (this._current) {
        this._handleResolve();
      }

      if (this._current) {
        if (alert.close) {
          setTimeout(() => this._destroy(), 450);
        } else {
          this._destroy();
        }
      }

      if (alert.close) {
        return;
      }

      const settingsFinal = {};

      for (const key in this.settings) {
        if (this.settings.hasOwnProperty(key)) {
          settingsFinal[key] = alert.override[key] !== undefined ? alert.override[key] : this.settings[key];
        }
      }

      const injector = Injector.create([], this.compViewContainerRef.parentInjector);
      const factory = this._resolver.resolveComponentFactory(AlertComponent);
      const component = factory.create(injector);

      component.instance.type = alert.type || 'success';
      component.instance.incomingData = {
        ...this._buildItemTemplate('message', alert.message),
        ...this._buildItemTemplate('title', alert.title),
        ...this._buildItemTemplate('confirmText', alert.override.confirmText),
        ...this._buildItemTemplate('declineText', alert.override.declineText),
        ...settingsFinal,
        resolve: alert.resolve
      };


      this.compViewContainerRef.insert(component.hostView);

      this._current = component;

      this._latestSub = alert.resolve.subscribe((res: any) => this._handleResolve(res));
    });
  }

  ngOnDestroy() {
    if (this._listener) {
      this._listener.unsubscribe();
    }
  }

  private _handleResolve(res?: ResolveEmit) {
    this._current.destroy();
    this._latestSub.unsubscribe();
  }

  private _destroy() {
    /**
     * We run the check twice in case the component timed out
     * This can happen on short durations
     */

    if (this._current) {
      this._current.destroy();
      this._current = null;
    }

    this._latestSub.unsubscribe();
  }

  private _buildItemTemplate(key: string, value: any) {

    if (!value) {
      return {};
    }

    if (value instanceof TemplateRef) {
      return { [key]: value, [`${key}IsTemplate`]: true };
    } else {
      return { [key]: this._domSanitize.bypassSecurityTrustHtml(value) };
    }
  }
}



