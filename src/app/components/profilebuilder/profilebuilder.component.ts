import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Utils } from '../../helpers/utils';
import { CommonService } from '../../services/common.service';
import { PageService } from '../../services/page.service';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-profilebuilder',
  templateUrl: './profilebuilder.component.html',
  styleUrls: ['./profilebuilder.component.css'],
  providers: [PageService]
})
export class ProfilebuilderComponent implements OnInit {

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
  @ViewChild('myIframeForm') form: ElementRef;

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
    var url = this.cms.authDomain + "/organization/" + this.oid;

    this.loadAuthUrl(url);
    this.loaderShared.showSpinner(false);
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);

        this.oid = Cookie.get('oid');
        this.setUrl();
      }
    });
  }

}
