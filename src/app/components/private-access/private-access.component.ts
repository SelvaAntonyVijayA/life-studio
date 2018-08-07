import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DOCUMENT } from '@angular/common';
import { LoaderSharedService } from '../../services/loader-shared.service';

declare var $: any;

@Component({
  selector: 'app-private-access',
  templateUrl: './private-access.component.html',
  styleUrls: ['./private-access.component.css']
})
export class PrivateAccessComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private loaderShared: LoaderSharedService,
    public utils: Utils,
    @Inject(DOCUMENT) private document: any, ) { }

  private orgChangeDetect: any;
  oid: string = "";
  rAccess: Object = {};

  getFileName (el: any) {
    //var name = el.value;
    //$("#fileName").text(name);
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.loaderShared.showSpinner(false);
        this.oid = Cookie.get('oid');
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
