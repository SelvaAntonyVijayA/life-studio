import { Component, OnInit, Inject, OnDestroy, Input, Output, ElementRef, Renderer2, ViewChild, AfterViewInit, ViewChildren, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DOCUMENT } from '@angular/common';
import { LoaderSharedService } from '../../services/loader-shared.service';

declare var $: any;
declare var jquery: any;
declare var jqGrid: any;
declare var navGrid: any;
declare var jAlert: any;

@Component({
  selector: 'app-stream-url',
  templateUrl: './stream-url.component.html',
  styleUrls: ['./stream-url.component.css']
})
export class StreamUrlComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    @Inject(DOCUMENT) private document: any) { }


  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  rAccess: Object = {};
  emptyApps: any;
  emptyStream: any;
  engines: any[] = [];
  appNewId: string = "-1";

  appsGridPager: any;
  appsGrid: any;
  streamGridPager: any;
  streamGrid: any;

  divZeroRecordsFound() {
    return $("<div><span style='color:#fff;font-size:15px'>0 records found</span></div>");
  };

  setrAccess() {
    this.rAccess = this.cms["appDatas"].hasOwnProperty("rAccess") ? this.cms["appDatas"]["rAccess"] : {};
  };

  streamUrlDataReset() {
    this.streamUrlReset();
    this.oid = "";
    this.rAccess = {};
    this.engines = [];
    this.emptyApps = this.divZeroRecordsFound();
    this.emptyStream = this.divZeroRecordsFound();

    this.appsGridPager = this.document.getElementById("apps-grid-pager");
    this.appsGrid = this.document.getElementById("apps-grid");
    this.streamGridPager = this.document.getElementById("stream-grid-pager");
    this.streamGrid = this.document.getElementById("stream-grid");
  };

  streamUrlReset() {
    this.appNewId = "-1";
  };

  getEngines() {
    let organizations: any[] = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    let orgObj: Object = organizations.find(o => o['_id'] === this.oid);

    if (!this.utils.isEmptyObject(orgObj)) {
      this.engines = orgObj.hasOwnProperty("engines") && this.utils.isArray(orgObj["engines"]) ? orgObj["engines"] : [];
    }

    this.loadApps();
  };

  loadApps() {
    $(this.appsGrid).jqGrid({
      url: '/cms/apps/list/' + this.oid,
      editurl: 'clientArray',
      datatype: "json",
      colModel: [{
        name: '_id',
        index: '_id',
        sortable: false,
        hidden: true,
        key: true
      }, {
        label: 'Name',
        name: 'name',
        width: 110,
        sortable: true,
        editable: true,
        editrules: {
          required: true
        }
      }, {
        name: 'logo',
        index: 'logo',
        sortable: false,
        hidden: true
      }, {
        name: 'startScreenImage',
        index: 'startScreenImage',
        sortable: false,
        hidden: true
      }, {
        name: 'website',
        index: 'website',
        sortable: false,
        hidden: true
      }, {
        name: 'organizationId',
        index: 'organizationId',
        sortable: false,
        hidden: true
      }, {
        label: 'Secure Auth',
        name: 'authenticated',
        sortable: false,
        formatter: 'select',
        editable: true,
        edittype: 'select',
        width: 120,
        editrules: {
          required: true
        },
        editoptions: {
          value: {
            '0': 'Pre-approved',
            '1': 'Email',
            '4': 'Email-Auto Approve',
            '2': 'Username',
            '3': 'No Security'
          },
          style: "width: 110px"
        }
      }, {
        label: 'PIN',
        sortable: true,
        name: 'pin',
        width: 50
      }, {
        name: 'autoApprove',
        index: 'autoApprove',
        sortable: false,
        hidden: true
      }, {
        label: 'Google Analytics',
        name: 'googleAnalytics',
        sortable: false,
        width: 100,
        editable: true
      }, {
        label: 'Alerts',
        name: 'alerts',
        sortable: false,
        width: 135,
        editable: true
      }, {
        label: 'Chat',
        name: 'chat',
        index: 'chat',
        sortable: false,
        width: 45,
        formatter: 'select',
        editable: true,
        edittype: 'select',
        editrules: {
          required: true
        },
        editoptions: {
          value: {
            '0': "Off",
            '1': 'On',
            '2': 'Private'
          },
          style: "width: 38px"
        },
      }, {
        name: 'publishing',
        index: 'publishing',
        sortable: false,
        hidden: true
      }],
      sortname: 'name',
      sortorder: 'asc',
      loadonce: true,
      width: 500,
      height: 350,
      emptyrecords: 'No Apps',
      hidegrid: false,
      viewrecords: true,
      rowNum: 350,
      pager: "#apps-grid-pager",
      onSelectRow: (rowid) => {
        /* if (!streamGrid) {
           loadStreams(oid, rowid);
         } else {
           reloadGrid("streams", oid, rowid); 
         } */
      },
      loadComplete: () => {

        let appGridPagerCenter: any = this.document.getElementById("apps-grid-pager_center");
        //let memGridAdd: any = this.document.getElementById("apps-grid");
        //let memGridSave: any = this.document.getElementById("apps-grid");


        $(appGridPagerCenter).empty();
        //$("#apps-grid").jqGrid('sortGrid', 'name', false, 'asc');
        $(this.appsGrid).setCaption("Apps");
        $(this.appsGrid).closest("div.ui-jqgrid-view").children("div.ui-jqgrid-titlebar").css("text-align", "center").css("height", "25px").children("span.ui-jqgrid-title").css("float", "none");
        //var gridApps = this;

        if (this.appNewId !== "-1") {
          $(this.appsGrid).jqGrid('setSelection', this.appNewId);
          this.appNewId = "-1";
        } else {
          let appsTopRowId: string = $(this.appsGrid).getDataIDs()[0];
          appsTopRowId = !this.utils.isNullOrEmpty(appsTopRowId) ? appsTopRowId : "-1";

          if (appsTopRowId !== "-1") {
            $(this.appsGrid).jqGrid('setSelection', appsTopRowId);
          }

          /*if (!streamGrid) {
            loadStreams(oid, appsTopRowId);
          } else {
            reloadGrid("streams", oid, appsTopRowId);
          }*/
        }

        if (this.appsGrid["p"]["reccount"] === 0) {
          this.emptyApps.show();
        } else {
          this.emptyApps.hide();
        }
      }
    });

    this.emptyApps.insertAfter($(this.appsGrid).parent());

    $(this.appsGrid).navGrid('#apps-grid-pager', {
      edit: false,
      add: false,
      del: false,
      search: false,
      cancel: false,
      refresh: false,
      save: false
    });
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.loaderShared.showSpinner(false);
        this.streamUrlDataReset();
        this.oid = Cookie.get('oid');
        this.setrAccess();
        this.getEngines();

      }
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
