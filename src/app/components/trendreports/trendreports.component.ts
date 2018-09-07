import { Component, OnInit } from '@angular/core';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-trendreports',
  templateUrl: './trendreports.component.html',
  styleUrls: ['./trendreports.component.css']
})
export class TrendreportsComponent implements OnInit {

  constructor(private loaderShared: LoaderSharedService) { }

  ngOnInit() {
    this.loaderShared.showSpinner(false);
  }

}
