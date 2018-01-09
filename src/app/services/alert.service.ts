import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { AlertEmit } from '../helpers/alert-emit';
import { AlertSettings } from '../helpers/alert-settings';
import { AlertType } from '../helpers/alert-type';


@Injectable()
export class AlertService {
  alert$: Subject<AlertEmit> = new Subject();

  create(
    type: AlertType = 'success',
    message: any = '',
    title: any = '',
    override: AlertSettings = {}
  ) {
    this.alert$.next({ type, title, message, override });
  }

  constructor() {
  }
}
