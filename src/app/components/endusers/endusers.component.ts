import { Component, OnInit } from '@angular/core';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-endusers',
  templateUrl: './endusers.component.html',
  styleUrls: ['./endusers.component.css']
})
export class EndusersComponent implements OnInit {

  constructor(private loaderShared: LoaderSharedService) { }

  ngOnInit() {
    this.loaderShared.showSpinner(false);
  }

}
