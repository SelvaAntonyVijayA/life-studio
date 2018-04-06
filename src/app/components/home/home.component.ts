import { Component, OnInit } from '@angular/core';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { Utils } from '../../helpers/utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  constructor(public utils: Utils,
    private loaderShared: LoaderSharedService
  ) {
    loaderShared.changeEmitted$.subscribe(
      curstate => {
        setTimeout(() => {
          this.status = curstate;
        });
      });
  }

  status: boolean = false;

  getStatus(statusObj: any) {
    if (!this.utils.isEmptyObject(statusObj) && statusObj.hasOwnProperty("status")) {
      this.status = statusObj["status"];
    }
  };

  ngOnInit() {

  }
}
