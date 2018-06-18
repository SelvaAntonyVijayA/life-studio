
import { Observable ,  Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class LoaderSharedService {
  constructor() { }
  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  
  // Service message commands
  showSpinner(change: any) {
    this.emitChangeSource.next(change);
  }
}
