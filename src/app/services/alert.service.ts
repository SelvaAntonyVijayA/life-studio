import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AlertEmit, AlertSettings, AlertType, ResolveEmit } from '../helpers/alerts';

@Injectable()
export class AlertService {
  alert: Subject<AlertEmit> = new Subject();

  create(
    type: AlertType = 'success',
    message: any = '',
    title: any = '',
    override: AlertSettings = {}
  ) {
    const resolve = new Subject<ResolveEmit>();

    this.alert.next({ type, title, message, resolve, override });

    return resolve;
  }

  constructor() {
  }
}
