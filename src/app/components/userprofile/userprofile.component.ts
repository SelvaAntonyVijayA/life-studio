import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Utils } from '../../helpers/utils';
import { CommonService } from '../../services/common.service';
import { PageService } from '../../services/page.service';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css'],
  providers: [PageService]
})
export class UserprofileComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private pageService: PageService,
    private loaderShared: LoaderSharedService,
    public utils: Utils
  ) { }

  private orgChangeDetect: any;
  oid: string = "";
  appList: any[] = [];
  selectedApp: string = "";

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {

          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];

            this.setUrl();
          }
        });
    }
  };

  appChange(appId: string) {
    this.selectedApp = appId;
    this.setUrl();
  };

  setUrl() {
    var url = this.cms.authDomain + "/profile/" + this.selectedApp;

    this.cms.loadAuthUrl(url, "myIframe");
    this.loaderShared.showSpinner(false);
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);

        this.oid = Cookie.get('oid');
        this.getApps();
      }
    });
  }

}
