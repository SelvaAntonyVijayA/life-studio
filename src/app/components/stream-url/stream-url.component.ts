import { Component, OnInit, Inject} from '@angular/core';
//import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
//import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DOCUMENT } from '@angular/common';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { LivestreamService } from '../../services/livestream.service';

declare var $: any;
//declare var jquery: any;
//declare var jqGrid: any;
//declare var navGrid: any;
//declare var jAlert: any;

@Component({
  selector: 'app-stream-url',
  templateUrl: './stream-url.component.html',
  styleUrls: ['./stream-url.component.css'],
  providers: [LivestreamService],
})
export class StreamUrlComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private cms: CommonService,
    // private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    // private e1: ElementRef,
    // private renderer: Renderer2,
    public utils: Utils,
    @Inject(DOCUMENT) private document: any,
    private liveStreamService: LivestreamService
  ) { }


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
  streamGridEdit: any;

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

    $.jgrid.gridUnload("#apps-grid");
    $.jgrid.gridUnload("#stream-grid");

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
      onSelectRow: (rowid: string) => {
        if (this.streamGrid.childNodes.length === 0) {
          this.loadStreams(rowid);
        } else {
          this.reloadGrid("streams", rowid);
        }
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

          if (this.streamGrid.childNodes.length === 0) {
            this.loadStreams(appsTopRowId);
          } else {
            this.reloadGrid("streams", appsTopRowId);
          }
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

  loadStreams(appId: string) {
    $(this.streamGrid).jqGrid({
      url: '/livestream/list/' + this.oid + "/" + appId,
      editurl: 'clientArray',
      datatype: "json",
      colModel: [{
        name: '_id',
        index: '_id',
        sortable: false,
        hidden: true,
        key: true
      }, {
        label: 'Title',
        name: 'name',
        width: 90,
        sortable: true,
        editable: true,
        editrules: {
          required: true
        }
      }, {
        label: 'Stream Url',
        name: 'url',
        width: 80,
        sortable: false,
        editable: true,
        editrules: {
          required: true
        }
      }, {
        label: 'Andriod Stream Url',
        name: 'urlAndroid',
        width: 120,
        sortable: false,
        editable: true
      }, {
        label: 'Web Stream Url',
        name: 'urlWeb',
        width: 100,
        sortable: false,
        editable: true
      }, {
        label: 'Stream Key',
        name: 'lifeStreamId',
        width: 70,
        sortable: false,
        editable: true,
        editrules: {
          required: true
        }
      }, {
        label: 'Report Abuse',
        name: 'reportAbuse',
        width: 100,
        sortable: false,
        editable: true,
        editrules: {
          required: true
        }
      }, {
        label: 'LifeStream',
        name: 'livestream',
        index: 'livestream',
        sortable: false,
        width: 75,
        formatter: 'select',
        editable: true,
        edittype: 'select',
        editrules: {
          required: true
        },
        editoptions: {
          value: {
            "no": "No",
            "yes": "Yes"
          },
          style: "width: 45px"
        },
      }, {
        label: 'isAdvanced',
        name: 'isAdvanced',
        index: 'isAdvanced',
        sortable: false,
        width: 70,
        editable: true,
        edittype: 'checkbox',
        align: "center",
        editoptions: {
          value: "True:False",
          style: "width: 65px; text-align:center"
        },
        formatter: "checkbox",
        formatoptions: {
          disabled: true,
          style: "width: 90px; text-align:center"
        }
      }, {
        name: 'organizationId',
        index: 'organizationId',
        sortable: false,
        hidden: true
      }, {
        name: 'createdApp',
        index: 'createdApp',
        sortable: false,
        hidden: true
      }, {
        name: 'createdBy',
        index: 'createdBy',
        sortable: false,
        hidden: true
      }, {
        name: 'userId',
        index: 'userId',
        sortable: false,
        hidden: true
      }],
      loadonce: true,
      width: 689,
      height: 350,
      gridview: true,
      rownumbers: true,
      sortname: 'name',
      sortorder: 'asc',
      emptyrecords: 'No Streams',
      hidegrid: false,
      viewrecords: true,
      rowNum: 350,
      pager: "#stream-grid-pager",
      onSelectRow: (rowid: any) => {

      },
      ondblClickRow: (id: string) => {
        $(this.streamGridEdit).click();
      },
      loadComplete: () => {
        let streamPagerCenter: any = this.document.getElementById("stream-grid-pager_center");
        this.streamGridEdit = this.document.getElementById("stream-grid_iledit");

        $(streamPagerCenter).empty();

        $(this.streamGrid).setCaption("Stream Studio");
        $(this.streamGrid).closest("div.ui-jqgrid-view").children("div.ui-jqgrid-titlebar").css("text-align", "center").css("height", "25px").children("span.ui-jqgrid-title").css("float", "none");

        if (this.streamGrid["p"]["reccount"] === 0) {
          this.emptyStream.show();
        } else {
          this.emptyStream.hide();
        }
      }
    });

    this.emptyStream.insertAfter($(this.streamGrid).parent());

    $(this.streamGrid).navGrid('#stream-grid-pager', {
      edit: false,
      add: false,
      del: false,
      search: true,
      cancel: false,
      refresh: false,
      save: false
    }).navButtonAdd('#stream-grid-pager', {
      caption: "",
      id: "stream_ildelete",
      title: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: () => {
        this.removeStream();
      }
    });

    $(this.streamGrid).inlineNav('#stream-grid-pager', {
      edit: true,
      add: true,
      del: false,
      cancel: true,
      search: false,
      save: true,
      refresh: false,
      editParams: this.streamSaveUpdate,
      addParams: {
        position: "first",
        addRowParams: this.streamSaveUpdate
      }
    });
  };

  streamSaveUpdate: any = {
    keys: true,
    url: 'clientArray',
    oneditfunc: (rowid: string) => {
      let engineFilter: Object = this.engines.find(e => e['name'] === "Advanced Stream");

      if (!this.utils.isEmptyObject(engineFilter)) {
        let streamRowAdvanced: any = this.document.getElementById(rowid + "_isAdvanced");
        $(streamRowAdvanced).prop("disabled", true);
      }

      this.emptyStream.hide();
    },
    aftersavefunc: (rowid: string, response: any, options: any) => {
      let appId: string = $(this.appsGrid).jqGrid('getGridParam', 'selrow');
      let appData: Object = $(this.appsGrid).jqGrid('getLocalRow', appId);
      let streamObj: Object = {};
      //let streamUrl: string = "";

      if (this.utils.isNullOrEmpty(appId)) {
        this.utils.iAlert('error', 'Information', 'Please select the App.');
        return false;
      }

      let regexp: any = new RegExp("://");
      let validUrl: boolean = regexp.test(options.url);
      let validStreamAndriodUrl: any = regexp.test(options.urlAndroid);
      let validStreamWebUrl: any = regexp.test(options.urlWeb);

      let re: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let validEmail: boolean = true;

      let streamRAemail: any[] = options.reportAbuse.split(',');

      for (var i = 0; i < streamRAemail.length; i++) {
        validEmail = re.test(streamRAemail[i]);

        if (!validEmail) {
          break;
        }
      }

      if (!validUrl) {
        this.utils.iAlert('error', 'Information', 'URL is not valid, Please enter valid URL');
        return false;
      }

      if (!this.utils.isNullOrEmpty(options.urlAndroid) && !validStreamAndriodUrl) {
        this.utils.iAlert('error', 'Information', 'Andriod Stream URL is not valid, Please enter valid URL');
        return false;
      }

      if (!this.utils.isNullOrEmpty(options.urlWeb) && !validStreamWebUrl) {
        this.utils.iAlert('error', 'Information', 'Web Stream URL is not valid, Please enter valid URL');
        return false;
      }

      if (!validEmail) {
        this.utils.iAlert('error', 'Information', 'Report Abuse is not valid, Please enter valid Email Address');
        return false;
      }

      streamObj["name"] = options.name;
      streamObj["url"] = options.url;
      streamObj["urlAndroid"] = options.urlAndroid;
      streamObj["urlWeb"] = options.urlWeb;
      streamObj["reportAbuse"] = options.reportAbuse;
      streamObj["isAdvanced"] = options.hasOwnProperty("isAdvanced") && !this.utils.isNullOrEmpty(options.isAdvanced) && options.isAdvanced.toLowerCase() == "true" ? true : false;
      streamObj["updatedOn"] = (new Date()).toUTCString();
      streamObj["chat"] = (appData["chat"] === "1" || appData["chat"] === "2") ? true : false;
      streamObj["livestream"] = options.livestream;
      streamObj["lifeStreamId"] = options.lifeStreamId;

      if (options._id.length > 12) {
        this.liveStreamService.updateStream(options._id, streamObj).subscribe(() => {
          this.utils.iAlert('success', '', 'Stream Updated');
          this.reloadGrid("streams", appId);
        });
      } else {
        streamObj["createdOn"] = (new Date()).toUTCString();
        streamObj["organizationId"] = this.oid;
        streamObj["createdApp"] = {
          "id": appId,
          "name": appData["name"]
        };

        this.liveStreamService.saveStream(streamObj).subscribe(() => {
          this.utils.iAlert('success', '', 'Stream Saved');
          this.reloadGrid("streams", appId);
        });
      }
    }
  };

  reloadGrid(type: string, appId: string) {
    if (type == "apps") {
      var appUrl = '/cms/apps/list/' + this.oid;

      $(this.appsGrid).setGridParam({
        url: appUrl,
        datatype: 'json',
        page: 1
      }).trigger('reloadGrid');
    }

    if (type == "streams") {
      var streamUrl = '/livestream/list/' + this.oid + "/" + appId;

      $(this.streamGrid).setGridParam({
        url: streamUrl,
        datatype: 'json',
        page: 1
      }).trigger('reloadGrid');
    }
  };

  removeStream() {
    let streamId: string = $(this.streamGrid).jqGrid('getGridParam', 'selrow');

    if (this.utils.isNullOrEmpty(streamId)) {
      this.utils.iAlert('error', 'Information', 'No stream is selected');
      return false;
    }

    if (streamId.length < 12) {
      $(this.streamGridEdit).click();
      return false;
    }

    this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure you want to delete this Stream?", "Yes", "No", (r) => {
      if (r["resolved"]) {
        this.liveStreamService.deleteStream(streamId).subscribe(() => {
          this.utils.iAlert('success', '', 'Stream Removed');
          let appId: string = $(this.appsGrid).jqGrid('getGridParam', 'selrow');

          this.reloadGrid("streams", appId);
        });
      }
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
