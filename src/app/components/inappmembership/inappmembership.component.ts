import { Component, OnInit } from '@angular/core';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-inappmembership',
  templateUrl: './inappmembership.component.html',
  styleUrls: ['./inappmembership.component.css']
})
export class InappmembershipComponent implements OnInit {

  constructor(private loaderShared: LoaderSharedService) { }

  ngOnInit() {
    this.loaderShared.showSpinner(false);
  }

}
