import { Component, OnInit } from '@angular/core';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-trendalerts',
  templateUrl: './trendalerts.component.html',
  styleUrls: ['./trendalerts.component.css']
})
export class TrendalertsComponent implements OnInit {

  constructor(private loaderShared: LoaderSharedService) { }

  ngOnInit() {
    this.loaderShared.showSpinner(false);
  }

}
