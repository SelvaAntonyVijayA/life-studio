import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
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
    private renderer: Renderer2,
    private el: ElementRef,
    private cms: CommonService,
    private pageService: PageService,
    private loaderShared: LoaderSharedService,
    public utils: Utils
  ) { }

  private orgChangeDetect: any;
  oid: string = "";
  appList: any[] = [];
  selectedApp: string = "";
  @ViewChild('myIframeForm') form: ElementRef;

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

  loadAuthUrl(url) {
    if (!this.form) {
      const input = this.renderer.createElement('input');
      input.name = 'studio_token';
      input.type = 'hidden';
      input.value = Cookie.get('token');

      this.form = this.renderer.createElement('form');

      this.renderer.appendChild(this.form, input);
      this.renderer.appendChild(this.el.nativeElement, this.form);
    }

    this.renderer.setAttribute(this.form, "id", "myIframeForm")
    this.renderer.setAttribute(this.form, "target", "myIframe");
    this.renderer.setAttribute(this.form, "action", url);
    this.renderer.setAttribute(this.form, "method", "POST");

    (<HTMLFormElement>document.getElementById("myIframeForm")).submit();
  };

  setUrl() {
    var url = this.cms.authDomain + "/profile/" + this.selectedApp;

    this.loadAuthUrl(url);
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
