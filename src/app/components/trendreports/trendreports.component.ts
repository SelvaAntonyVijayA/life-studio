import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { Component, OnInit, ElementRef, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { ReportGeneratorService } from '../../services/report-generator.service';
import { GeneralService } from '../../services/general.service'

declare var tsort: any;
declare var $: any;

@Component({
  selector: 'app-trendreports',
  templateUrl: './trendreports.component.html',
  styleUrls: ['./trendreports.component.css'],
  providers: [PageService, GeneralService, ReportGeneratorService],
  encapsulation: ViewEncapsulation.None
})
export class TrendreportsComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: any,
    private e1: ElementRef,
    private route: ActivatedRoute,
    private loaderShared: LoaderSharedService,
    private pageService: PageService,
    private reportGeneratorService: ReportGeneratorService,
    private generalService: GeneralService,
    public utils: Utils) { }

  private orgChangeDetect: any;
  oid: string = "";
  appList: any[] = [];
  selectedApp: string = "-1";
  reportList: any[] = [];
  selectedReport: string = "-1";
  profile: any[] = [];
  startDate: string = "";
  endDate: string = "";
  usersGrid: ElementRef<any>;
  usersGridPager: ElementRef<any>;
  isPatientFilter: boolean = false;
  isUserGrid: boolean = false;
  isChartContainer: boolean = false;
  patientType: string = "0";

  trendReportDataReset() {
    this.trendReportReset(true);
    this.oid = "";
    this.appList = []
    this.selectedApp = "-1";
    this.reportList = [];

    $.jgrid.gridUnload("#users-grid");
    this.usersGrid = this.document.getElementById("users-grid");
    this.usersGridPager = this.document.getElementById("users-grid-pager");
  };

  trendReportReset(isEmpty: boolean) {
    this.selectedReport = "-1";
    this.isPatientFilter = false;
    this.startDate = "";
    this.endDate = "";
    this.isChartContainer = false;
    this.isUserGrid = false;

    if (isEmpty) {
      this.profile = [];
    }
  };

  getApps() {
    let apps: any = this.pageService.getApps(this.oid);

    return apps;
  };

  getReports() {
    let reports: any = this.reportGeneratorService.getReportRule(this.oid);

    return reports;
  };

  getProfile() {
    let profile: any = this.generalService.getAppProfile(this.selectedApp);

    return profile;
  };

  getDynamicProfile() {
    this.getProfile().subscribe(profDatas => {

      if (this.utils.isArray(profDatas) && profDatas.length > 0) {
        this.profile = profDatas;
      }
    });
  };

  appChange(val: any) {
    this.selectedApp = val;
    this.trendReportReset(true);
    this.getDynamicProfile();
  };

  reportChange(val: any) {
    this.selectedReport = val;
    this.isPatientFilter = false;

    if (this.selectedReport !== "-1") {
      let currReport: any = this.reportList.find(r => r['_id'] === this.selectedReport);
      this.isPatientFilter = currReport.hasOwnProperty("type") && !this.utils.isNullOrEmpty(currReport["type"]) && currReport["type"] === "0" ? true : false;
    }
  };

  loadTrendReport() {
    this.getTrendReport().subscribe(trDatas => {
      this.setApps(trDatas[0]);
      this.setReports(trDatas[1]);
      this.getDynamicProfile();
    });
  };

  setApps(apps: any[]) {
    this.appList = apps;

    if (this.appList.length > 0) {
      this.selectedApp = this.appList[0]["_id"];
    }
  };

  setReports(reports: any[]) {
    this.reportList = reports;
  };

  getTrendReport() {
    let apps: any = this.getApps();
    let reports: any = this.getReports();

    return observableForkJoin([apps, reports]);
  };

  reportFilter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.isUserGrid = false;
    this.isChartContainer = false;

    if (this.selectedApp == "-1") {
      this.utils.iAlert('error', 'Information', 'Please select App');
      return false;
    }

    if (this.selectedReport == "-1") {
      this.utils.iAlert('error', 'Information', 'Please select Report');
      return false;
    }

    let currReport: any = this.reportList.find(r => r['_id'] === this.selectedReport);
    var type = currReport.hasOwnProperty("type") && !this.utils.isNullOrEmpty(currReport["type"]) ? currReport["type"] : "-1";

    if (type !== "-1") {
      if (type === "0") {
        if (this.patientType === "0") {
          this.isUserGrid = true;


        } else {

        }
      } else {
        this.utils.iAlert('error', 'Information', 'Report type does not exists');
      }
    }
  };

  resetReport(e: any) {
    e.preventDefault();
    e.stopPropagation();

    this.trendReportReset(true);
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.loaderShared.showSpinner(false);
        this.trendReportDataReset();
        this.oid = Cookie.get('oid');
        this.loadTrendReport();
      }
    });
  }
}
