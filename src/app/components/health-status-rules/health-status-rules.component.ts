import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { HealthStatusRulesService } from '../../services/health-status-rules.service';

@Component({
  selector: 'app-health-status-rules',
  templateUrl: './health-status-rules.component.html',
  styleUrls: ['./health-status-rules.component.css'],
  providers: [PageService, HealthStatusRulesService],
  encapsulation: ViewEncapsulation.None
})
export class HealthStatusRulesComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer,
    public utils: Utils,
    private pageService: PageService,
    private healthStatusRules: HealthStatusRulesService
  ) { }

  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  appList: any[] = [];
  selectedApp: string = "";
  hsrList: any[] = [];
  selectedHsr: string = "";

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    this.mScrollbarService.initScrollbar("#hsr_group_main", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#hsr_group_main");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#hsr_group_main"];
    }
  };

  statusDataReset() {
    this.oid = "";
    this.statusReset();
    this.appList = [];
    this.selectedApp = "";
    this.hsrList = [];
  };

  statusReset() {
    this.selectedHsr = "";
  };

  getApps() {
    if (this.appList.length === 0) {
      this.pageService.getApps(this.oid)
        .then(apps => {
          if (this.utils.isArray(apps) && apps.length > 0) {
            this.appList = apps;
            this.selectedApp = this.appList[0]["_id"];

          } else {
            this.loaderShared.showSpinner(false);
          }
        });
    }
  };

  appChange(appId: string) {
    this.selectedApp = appId;
  };

  getRules() {
    this.healthStatusRules.hsrList(this.oid)
      .then(ruleList => {
        if (this.utils.isArray(ruleList) && ruleList.length > 0) {
          this.hsrList = ruleList;
        }

        this.loaderShared.showSpinner(false);
      });
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  getRuleStatus(ruleObj: Object) {
    let isDeath = ruleObj.hasOwnProperty("ruleStatusColor") && !this.utils.isNullOrEmpty(ruleObj["ruleStatusColor"]) && ruleObj["ruleStatusColor"] == "purple" ? true : false;

    return isDeath;
  };

  getStatusColor(ruleObj: Object) {
    let isDeath = this.getRuleStatus(ruleObj)

    return isDeath ? "gray" : ruleObj["ruleStatusColor"];
  }

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.statusDataReset();
        this.setScrollList();
        this.oid = Cookie.get('oid');
        this.getApps();
        this.getRules();
      }
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  }
}
