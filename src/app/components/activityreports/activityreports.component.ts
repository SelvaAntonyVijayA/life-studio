import { Component, OnInit } from '@angular/core';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-activityreports',
  templateUrl: './activityreports.component.html',
  styleUrls: ['./activityreports.component.css']
})
export class ActivityreportsComponent implements OnInit {

  constructor(private loaderShared: LoaderSharedService) { }

  ngOnInit() {
    this.loaderShared.showSpinner(false);
  }

}
