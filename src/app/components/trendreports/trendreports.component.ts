import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { Component, OnInit, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { ReportGeneratorService } from '../../services/report-generator.service';
import { GeneralService } from '../../services/general.service';
import 'src/js/jquery.tinysort.min.js';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var tsort: any;
declare var $: any;
declare var Highcharts: any;

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
    public utils: Utils,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
  ) { }

  private orgChangeDetect: any;
  @ViewChild('chartForm') chartForm: ModalDirective;
  chartFormRef: BsModalRef;
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
  //isUserGrid: boolean = false;
  //isChartContainer: boolean = false;
  patientType: string = "0";
  userLoadInitial: string = "-1";
  memberId = "-1"
  emptyUsers: any = this.emptyHtml();
  formTitle: string = "";
  chartType: string = "1";

  trendReportDataReset() {
    this.trendReportReset(true);
    this.oid = "";
    this.appList = []
    this.selectedApp = "-1";
    this.reportList = [];
    this.patientType = "0";
    this.chartFormRef = null;
    this.formTitle = "";
    this.chartType = "1";

    this.userGridUnload();
  };

  trendReportReset(isEmpty: boolean) {
    this.selectedReport = "-1";
    this.isPatientFilter = false;
    this.startDate = "";
    this.endDate = "";
    //this.isChartContainer = false;
    //this.isUserGrid = false;

    if (isEmpty) {
      this.profile = [];
    }
  };

  /*resetReportData() {
     
    
  };*/

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

      if (!this.utils.isEmptyObject(profDatas) && profDatas.hasOwnProperty("userColModel")) {
        this.profile = profDatas["userColModel"];
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

  userGridUnload() {
    $.jgrid.gridUnload("#users-grid");
    $.jgrid.gridDestroy("#users-grid");

    this.usersGrid = this.document.getElementById("users-grid");
    this.usersGridPager = this.document.getElementById("users-grid-pager");

    this.userLoadInitial = "-1";
  };

  reportFilter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    //this.isUserGrid = false;
    //this.isChartContainer = false;

    if (this.selectedApp == "-1") {
      this.utils.iAlert('error', 'Information', 'Please select App');
      return false;
    }

    if (this.selectedReport == "-1") {
      this.utils.iAlert('error', 'Information', 'Please select Report');
      return false;
    }

    let currReport: any = this.reportList.find(r => r['_id'] === this.selectedReport);
    let type: string = currReport.hasOwnProperty("type") && !this.utils.isNullOrEmpty(currReport["type"]) ? currReport["type"] : "-1";

    if (type !== "-1") {
      if (type === "0") {
        if (this.patientType === "0") {
          //this.isUserGrid = true;
          let userGridElem = this.usersGrid["childNodes"].length;

          if (userGridElem === 0) {
            this.loadUsers();
          } else {
            this.userGridUnload();
            this.loadUsers();
          }
        } else {
          this.userGridUnload();
          this.getTimelapseAverageReport('chartContainer');
        }
      } else {
        this.getTimelapseAverageReport("timelapseContainer");
      }
    } else {
      this.utils.iAlert('error', 'Information', 'Report type does not exists');
    }
  };

  loadUsers() {
    $(this.usersGrid).jqGrid({
      url: '/trendreport/member/get/' + this.selectedApp,
      editurl: 'clientArray',
      datatype: "json",
      colModel: this.profile,
      sortname: 'firstName',
      sortorder: 'asc',
      loadonce: true,
      width: 1150,
      height: 760,
      emptyrecords: 'No Users',
      viewrecords: false,
      rowNum: 350,
      pager: "#users-grid-pager",
      onSelectRow: (rowid: string) => {
        //selfObj.processReport();
      },
      ondblClickRow: (id: string) => {
        let currentUserRow: any = $(this.usersGrid).jqGrid("getLocalRow", id);
        this.memberId = id;

        let memberTitle: string = currentUserRow.firstName + " " + currentUserRow.lastName;
        memberTitle = memberTitle != "" && memberTitle != null ? memberTitle : "Trend Report";
        let colNames: any[] = $(this.usersGrid).jqGrid("getGridParam", "colNames");
        let phoneNumber: string = "";

        for (let i = 0; i < colNames.length; i++) {
          if (colNames[i].toLowerCase().indexOf("phone") > -1) {
            phoneNumber = $(this.usersGrid).jqGrid("getCell", id, i);
          }
        }

        memberTitle = phoneNumber != "" ? memberTitle + " - " + phoneNumber : memberTitle;

        /* $("#timelapseContainer").removeAttr('style');
         $("#timelapseContainer").css({
           "display": "block",
           "width": "75%",
           "padding-top": "10px"
         });
 
         selfObj.showChart(memberTitle);*/
      },
      loadComplete: () => {
        $(this.usersGridPager).insertAfter('#gview_users-grid > .ui-jqgrid-titlebar');

        if (this.userLoadInitial === "-1") {
          this.sortHtml();
        }

        this.arrangeUserDatas();

        if (this.userLoadInitial === "-1") {
          this.userEvents();
        }

        this.doSort("desc", "sortdate");

        let dateAsc: any = this.document.getElementsByClassName("date_asc");
        let dateDesc: any = this.document.getElementsByClassName("date_desc");

        $(dateAsc).hide();
        $(dateDesc).hide();
        $(dateDesc).toggle();

        if (this.usersGrid["p"]["reccount"] === 0) {
          this.emptyUsers.show();
        } else {
          this.emptyUsers.hide();
        }

        let usersGridPagerCenter: any = this.document.getElementById("users-grid-pager_center");
        $(usersGridPagerCenter).hide();
      }
    });
  };

  sortHtml() {
    $(this.usersGridPager).append("<img src='/img/search_patient_names.png' style='float: left; margin-top: 5px; position: absolute; margin-left: 13px;' alt='Search Names' height='14' width='14'>");
    $(this.usersGridPager).append("<div class='div-search-patient'><input id='search_patient_names' class='form-control input-sm' style='width: 200px; float: left; margin-left: 6px; background-color: #777676; border: gray; color: white;' type='text' placeholder='Search'/></div>");

    var sortHtml = '<label class="lblSortText" style="float:left;">Sort by date : </label>';
    sortHtml += '<div class="not_show do_sort date_sort" style="display:block; cursor:pointer; float:left; margin-left:8px; margin-top:3px;">';
    sortHtml += '<div id="divDateOrderAsc" class="not_show date_asc" style="display: none;">';
    sortHtml += 'Ascending<img class="sort_image" src="/img/sort_up.png">';
    sortHtml += '</div>';
    sortHtml += '<div id="divDateOrderDesc" class="not_show date_desc" style="display: block;">';
    sortHtml += 'Desending<img class="sort_image" src="/img/sort_down.png">';
    sortHtml += '</div>';
    sortHtml += '</div>';

    $(this.usersGridPager).append(sortHtml);
  };

  arrangeUserDatas() {
    let allRowsUser: any[] = $(this.usersGrid).jqGrid('getGridParam', 'data');

    for (let i = 0; i < allRowsUser.length; i++) {
      let userObj: any = allRowsUser[i];
      let currentUserRow: any = $(this.usersGrid).jqGrid("getLocalRow", userObj._id);

      let search: string = "";
      let sortDate: any = "";

      if (!this.utils.isEmptyObject(currentUserRow)) {
        let fName: string = currentUserRow.hasOwnProperty("firstName") ? this.validate(currentUserRow.firstName) : "";
        let lName: string = currentUserRow.hasOwnProperty("lastName") ? this.validate(currentUserRow.lastName) : "";
        let email: string = currentUserRow.hasOwnProperty("email") ? this.validate(currentUserRow.email) : "";
        let phone: any = currentUserRow.hasOwnProperty("cellPhone") ? this.validate(currentUserRow.cellPhone) : "";
        let zipcode: any = currentUserRow.hasOwnProperty("zipcode") ? this.validate(currentUserRow.zipcode) : "";
        sortDate = currentUserRow.hasOwnProperty("lastUpdatedOn") && !this.utils.isNullOrEmpty(currentUserRow.lastUpdatedOn) ? this.utils.formatDateTime(new Date(currentUserRow.lastUpdatedOn), 'yy/mm/dd g:ii a') : "";
        search = fName + " " + lName + " " + email + " " + phone + " " + zipcode;
      }

      let userRow: any = $(this.usersGrid).find("tr:not(:first)[id=" + userObj._id + "]");
      userRow.attr("sortDate", sortDate);

      if (userRow.find('.user-names-search').length === 0) {
        userRow.append("<input class='user-names-search' search='" + search + "' type='hidden'/>");
      }
    }
  };

  userEvents() {
    let searchPatientNames: any = this.document.getElementById("search_patient_names");
    let doSort: any = this.document.getElementsByClassName("do_sort");

    if (!this.utils.isNullOrEmpty(searchPatientNames)) {
      searchPatientNames.addEventListener('keyup', (e) => {
        let text: string = e.target.value;
        this.searchMemberNames(text);
      });
    }

    if (doSort.length > 0) {
      doSort[0].addEventListener('click', (e: any) => {
        let dateAsc: any = this.document.getElementsByClassName("date_asc");
        let dateDesc: any = this.document.getElementsByClassName("date_desc");
        let state: string = dateAsc[0]["style"]["display"];

        let dir: string = "";
        dateAsc[0]["style"]["display"] = "none";
        dateDesc[0]["style"]["display"] = "none";

        if (this.utils.isNullOrEmpty(state)) {
          dateDesc[0]["style"]["display"] = "";
          dir = 'desc';
        } else {
          dateAsc[0]["style"]["display"] = "";
          dir = 'asc';
        }

        this.doSort(dir, "sortdate");
      });
    }

    this.userLoadInitial = "0";
  };

  searchMemberNames(txt: string) {
    //let nestles: any = val;
    let userNamesSearch: any = this.document.getElementsByClassName("user-names-search");
    $(userNamesSearch).parent().show();

    if (!this.utils.isNullOrEmpty(txt)) {
      $(userNamesSearch).not('[search*=\'' + txt.toLowerCase() + '\']').parent().hide();
    }
  };

  validate(value: any) {
    return !this.utils.isNullOrEmpty(value) ? value.toLowerCase() : "";
  };

  doSort(dir: any, sortBy: any) {
    let userGridRows: any[] = $(this.usersGrid).find('tbody').find("tr:not(:first)");

    if ($(userGridRows).length > 0) {
      $(userGridRows).tsort('', {
        order: dir,
        attr: sortBy
      });
    }
  };

  emptyHtml() {
    return $("<div><span style='color:#fff;font-size:15px'>0 records found</span></div>");
  };

  resetReport(e: any) {
    e.preventDefault();
    e.stopPropagation();

    this.trendReportReset(true);
  };

  getTimelapseAverageReport(renderTo: string) {
    let currReport: any = Object.assign({}, this.reportList.find(r => r['_id'] === this.selectedReport));

    let type: string = currReport.hasOwnProperty("type") && !this.utils.isNullOrEmpty(currReport["type"]) ? currReport["type"] : "-1";

    let tileIds: any[] = currReport.hasOwnProperty("tiles") && !this.utils.isEmptyObject(currReport["tiles"]) ? Object.keys(currReport["tiles"]) : [];

    if (type === "1" && tileIds.length > 0) {
      tileIds.length = 1;
    }

    let tileBlockIds: any[] = this.getTileBlocks(tileIds, currReport);

    let formObj: object = {
      "appId": this.selectedApp,
      "tileBlockIds": tileBlockIds
    };

    if (type === "0") {
      let userId: string = $(this.usersGrid).jqGrid('getGridParam', 'selrow');
      formObj["memberId"] = userId;

      if (currReport.hasOwnProperty("procedureId") && !this.utils.isNullOrEmpty(currReport.procedureId)) {
        formObj["procedureId"] = currReport.procedureId;
      }
    }

    if (!this.utils.isNullOrEmpty(this.startDate) && !this.utils.isNullOrEmpty(this.endDate)) {
      formObj["startTime"] = this.utils.toUTCDateTime(this.startDate);
      formObj["endTime"] = this.utils.toUTCDateTime(this.endDate);
    }

    let casQuesBlocks: object = this.getBlocksByCascadingQues(tileIds, currReport);

    if (!this.utils.isEmptyObject(casQuesBlocks)) {
      formObj["cascadingBlocks"] = casQuesBlocks;
    }

    this.reportGeneratorService.getAverageReport(formObj).subscribe(objChartAverage => {
      this.chartTypeShow(objChartAverage, currReport, tileIds, tileBlockIds, type, renderTo);
    });
  };

  showChart(e: any, type: string) {
    e.preventDefault();
    this.chartType = type;
    this.getTimelapseAverageReport("timelapseContainer");
  };

  getTileBlocks(tileIds: any[], reportData: any) {
    let blockResult: any[] = [];

    if (tileIds.length > 0) {
      for (let i = 0; i < tileIds.length; i++) {
        let blocks: any[] = Object.keys(reportData.tiles[tileIds[i]].blocks);

        if (blocks.length > 0) {
          blockResult = blockResult.concat(blocks)
        }
      }
    }

    return blockResult;
  };

  getBlocksByCascadingQues(tileIds: any[], reportData: any) {
    let casBlockData: object = {};

    for (let i = 0; i < tileIds.length; i++) {
      let currTileId: string = tileIds[i];
      let mainTileObj: object = reportData.tiles[currTileId];
      let blocks: any[] = Object.keys(mainTileObj["blocks"]);

      for (let j = 0; j < blocks.length; j++) {
        let isObjArray: boolean = this.utils.isArray(mainTileObj["blocks"][blocks[j]]);

        if (!isObjArray) {
          var objIndex = Object.keys(mainTileObj["blocks"][blocks[j]]);
          casBlockData[blocks[j]] = objIndex[0];
        }
      }
    }

    return casBlockData;
  };

  chartTypeShow(chartAvarageObj: any, reportData: any, tileId: any[], tileBlockIds: any[], type: string, renderTo: string) {
    if (this.chartType === "0" && !this.utils.isEmptyObject(chartAvarageObj)) {
      this.chartAverageAllPatient(chartAvarageObj, reportData, tileId, renderTo);
    } else if (this.chartType === "1" && !this.utils.isEmptyObject(chartAvarageObj)) {
      this.timelapseChartRender(chartAvarageObj.patientData, reportData, tileId, tileBlockIds, type, chartAvarageObj.procedure);
    } else {
      this.utils.iAlert('error', 'Information', 'No Reports');
    }
  };

  chartAverageAllPatient(chartObj: any, reportData: any, tileIds: any[], renderTo: string) {
    let xaxisCategories: any[] = [];
    let absoluteValues: any[] = [];

    let dataPointsObj: any[] = [{
      name: "Mean",
      data: []
    },
    {
      name: "Mean-SD",
      data: []
    },
    {
      name: "Mean+SD",
      data: []
    }];

    let averageTileData: object = chartObj.hasOwnProperty("averageData") ? chartObj.averageData : {};
    let patientData: any = chartObj.hasOwnProperty("patientData") ? chartObj.patientData : "";
    let patientChartData: any[] = [];

    if (chartObj.hasOwnProperty("procedure") && this.utils.isArray(chartObj.procedure) && chartObj.procedure.length > 0) {
      for (let i = 0; i < chartObj.procedure[0].tiles; i++) {
        let pTile: any = chartObj.procedure[0].tiles[i];
        let tileObj: any = reportData.tiles[pTile._id];

        if (!this.utils.isEmptyObject(reportData.tiles[pTile._id])) {
          let blockId: any = Object.keys(reportData.tiles[pTile._id].blocks);
          let isObjArray: boolean = this.utils.isArray(reportData.tiles[pTile._id].blocks[blockId[0]]);
          let cascadeIndex: any[] = [];

          let data: any = this.getMeanCalculationValues(averageTileData[pTile._id]);

          dataPointsObj[0].data.push(data.M);
          dataPointsObj[1].data.push(data.lower);
          dataPointsObj[2].data.push(data.top);

          if (i === 0) {
            if (isObjArray) {
              absoluteValues = reportData.tiles[pTile._id].blocks[blockId[0]];
            } else {
              cascadeIndex = Object.keys(reportData.tiles[pTile._id].blocks[blockId[0]]);
              absoluteValues = reportData.tiles[pTile._id].blocks[blockId[0]][cascadeIndex[0]];
            }
          }

          let day: any = pTile.triggerDays === 0 ? 0 : (pTile.triggerActionOn === "before" ? -pTile.triggerDays : pTile.triggerDays);

          if (!this.utils.isNullOrEmpty(patientData) && this.utils.isArray(patientData) && patientData.length > 0) {
            let blockObj: any = patientData.find(p => p['tileBlockId'] == blockId[0] && p['days'] == day);
            let answerIndex: any = 0;

            if (!this.utils.isEmptyObject(blockObj) && blockObj.hasOwnProperty("data") && blockObj.data.hasOwnProperty("answers") && this.utils.isArray(blockObj.data.answers) && blockObj.data.answers.length > 0) {
              if (isObjArray) {
                answerIndex = blockObj.data.answers[0];
                answerIndex = parseInt(answerIndex);
              } else {
                var cascadeAnswerObj = this.getCascadingQuesByLevel(blockObj, cascadeIndex[0]);
                answerIndex = cascadeAnswerObj.result ? cascadeAnswerObj.answers[0] : 0;
                answerIndex = parseInt(answerIndex);
              }
            }

            patientChartData.push(parseInt(absoluteValues[answerIndex]));
          }

          xaxisCategories.push(tileObj.xAxisLabel + "/day(" + day + ")");
        }
      }
    } else {
      for (let i = 0; i < tileIds.length; i++) {
        let id: any = tileIds[i];
        let tileObj: any = reportData.tiles[id];
        let blockId: any[] = Object.keys(reportData.tiles[id].blocks);
        let isObjArray: boolean = this.utils.isArray(reportData.tiles[id].blocks[blockId[0]]);
        let cascadeIndex: any = "-1";
        let data: any = this.getMeanCalculationValues(averageTileData[id]);

        dataPointsObj[0].data.push(data.M);
        dataPointsObj[1].data.push(data.lower);
        dataPointsObj[2].data.push(data.top);

        if (i === 0) {
          if (isObjArray) {
            absoluteValues = reportData.tiles[id].blocks[blockId[0]];
          } else {
            cascadeIndex = Object.keys(reportData.tiles[id].blocks[blockId[0]]);
            absoluteValues = reportData.tiles[id].blocks[blockId[0]][cascadeIndex[0]];
          }
        }

        if (!this.utils.isNullOrEmpty(patientData) && this.utils.isArray(patientData) && patientData.length > 0) {
          let blockObj: any = patientData.find(p => p['tileBlockId'] == blockId[0]);
          let answerIndex: any = 0;

          if (!this.utils.isEmptyObject(blockObj) && blockObj.hasOwnProperty("data") && blockObj.data.hasOwnProperty("answers") && this.utils.isArray(blockObj.data.answers) && blockObj.data.answers.length > 0) {
            if (isObjArray) {
              answerIndex = blockObj.data.answers[0];
              answerIndex = parseInt(answerIndex);
            } else {
              let cascadeAnswerObj: any = this.getCascadingQuesByLevel(blockObj, cascadeIndex[0]);
              answerIndex = cascadeAnswerObj.result ? cascadeAnswerObj.answers[0] : -1;
              answerIndex = parseInt(answerIndex);
            }
          }

          patientChartData.push(parseInt(absoluteValues[answerIndex]));
        }

        xaxisCategories.push(tileObj.xAxisLabel);
      }
    }

    if (!this.utils.isNullOrEmpty(patientData)) {
      dataPointsObj.push(
        {
          name: "Patient",
          data: patientChartData
        });
    }

    let options: any = {
      chart: {
        renderTo: renderTo,
        type: 'line',
      },
      title: {
        text: reportData.name
      },
      subtitle: {
        text: '',
      },
      xAxis: {
        title: {
          text: ""
        },
        categories: xaxisCategories
      },
      yAxis: {
        min: 0,
        max: 10,
        tickInterval: 2,
        allowDecimals: false,
        title: {
          text: ""
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        }
      },
      /*      legend : {
              layout : 'vertical',
              align : 'right',
              verticalAlign : 'top',
              x : -10,
              y : 100,
              borderWidth : 0
            },*/
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b><br/>' + ':' + this.y + '<br/>';
        }
      },
      series: dataPointsObj
    };

    if (renderTo === "chartContainer") {
      let chartContainer: any = this.document.getElementById("chartContainer");
      $(chartContainer).removeAttr('style');
      $(chartContainer).css({
        "display": "block",
        "width": "75%",
        "margin": "0 auto",
        "padding-top": "60px"
      });

      $(chartContainer).removeClass("type_time_lapse").addClass("type_snap_shot");
    }

    let chart: any = new Highcharts.Chart(options);
  };

  timelapseChartRender(chartObj: any, reportData: any, tileIds: any[], tileBlockIds: any[], type: string, procedure: any[]) {
    let xaxisCategories: any[] = [];
    let absoluteValues: any[] = [];

    let dataPointsObj: any = {
      data: []
    };

    if (this.utils.isArray(procedure) && procedure.length > 0) {
      for (let i = 0; i < procedure[0]["tiles"]; i++) {
        let pTile: any = procedure[0]["tiles"][i];

        if (!pTile.permanent) {
          let tileObj: any = reportData.tiles[pTile._id];

          if (reportData.tiles[pTile._id]) {
            let blockIds: any[] = Object.keys(reportData.tiles[pTile._id].blocks);
            let isObjArray: boolean = this.utils.isArray(reportData.tiles[pTile._id].blocks[blockIds[0]]);
            let cascadeIndex: any = "-1";
            let day: any = pTile.triggerDays === 0 ? 0 : (pTile.triggerActionOn === "before" ? -pTile.triggerDays : pTile.triggerDays);

            let blockObj: any = chartObj.find(b => b['tileBlockId'] === blockIds[0] && b['days'] == day);

            if (i === 0) {
              if (isObjArray) {
                absoluteValues = reportData.tiles[pTile._id].blocks[blockIds[0]];
              } else {
                cascadeIndex = Object.keys(reportData.tiles[pTile._id].blocks[blockIds[0]]);
                absoluteValues = reportData.tiles[pTile._id].blocks[blockIds[0]][cascadeIndex[0]];
              }
            }

            let answerIndex: any = 0;

            if (!this.utils.isEmptyObject(blockObj) && blockObj.hasOwnProperty("data") && blockObj.data.hasOwnProperty("answers") && this.utils.isArray(blockObj.data.answers) && blockObj.data.answers.length > 0) {
              if (isObjArray) {
                answerIndex = blockObj.data.answers[0];
                answerIndex = parseInt(answerIndex);
              } else {
                let cascadeAnswerObj: any = this.getCascadingQuesByLevel(blockObj, cascadeIndex[0]);
                answerIndex = cascadeAnswerObj.result ? cascadeAnswerObj.answers[0] : 0;
                answerIndex = parseInt(answerIndex);
              }
            }

            dataPointsObj.data.push(parseInt(absoluteValues[answerIndex]));
            xaxisCategories.push(tileObj.xAxisLabel + "/day(" + day + ")");
          }
        }
      }
    } else {
      for (let i = 0; i < tileIds.length; i++) {
        let id: any = tileIds[i];
        let tileObj: any = reportData.tiles[id];

        let blockIds: any[] = Object.keys(reportData.tiles[id].blocks);
        let isObjArray: boolean = this.utils.isArray(reportData.tiles[id].blocks[blockIds[0]]);
        let cascadeIndex: any = "-1";

        let blockObj: any = chartObj.find(b => b['tileBlockId'] === blockIds[0]);

        if (i === 0) {
          if (isObjArray) {
            absoluteValues = reportData.tiles[id].blocks[blockIds[0]];
          } else {
            cascadeIndex = Object.keys(reportData.tiles[id].blocks[blockIds[0]]);
            absoluteValues = reportData.tiles[id].blocks[blockIds[0]][cascadeIndex[0]];
          }
        }

        let answerIndex: any = 0;

        if (!this.utils.isEmptyObject(blockObj) && blockObj.hasOwnProperty("data") && blockObj.data.hasOwnProperty("answers") && this.utils.isArray(blockObj.data.answers) && blockObj.data.answers.length > 0) {
          if (isObjArray) {
            answerIndex = blockObj.data.answers[0];
            answerIndex = parseInt(answerIndex);
          } else {
            let cascadeAnswerObj: any = this.getCascadingQuesByLevel(blockObj, cascadeIndex[0]);
            answerIndex = cascadeAnswerObj.result ? cascadeAnswerObj.answers[0] : 0;
            answerIndex = parseInt(answerIndex);
          }
        }

        dataPointsObj.data.push(parseInt(absoluteValues[answerIndex]));
        xaxisCategories.push(tileObj.xAxisLabel);
      }
    }

    let options: any = {
      chart: {
        renderTo: 'timelapseContainer',
        type: 'column',
      },
      title: {
        text: reportData.name
      },
      subtitle: {
        text: '',
      },
      xAxis: {
        title: {
          text: ""
        },
        categories: xaxisCategories
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
          text: ""
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b><br/>' + ':' + this.y + '<br/>';
        }
      },
      series: [dataPointsObj]
    };

    let chart: any = new Highcharts.Chart(options);

    //$('#showChart').modal('show');  --> have  to  do 
  };

  getCascadingQuesByLevel(mblock: any, cascadeAnswerIndex: any) {
    let resultObj: any = { result: true, answers: [] };
    let answer: any[] = mblock && mblock.data && mblock.data.answers && mblock.data.answers.length > 0 ? mblock.data.answers : []

    let levels: any[] = cascadeAnswerIndex.split("_");
    let currObj: any = {};

    if (levels.length > 1) {
      for (let j = 0; j < levels.length; j++) {
        let pLevel: any = parseInt(levels[j]);

        if (j == 0) {
          currObj = this.matchAnswerLevel(answer, pLevel, 'answer');

          if (this.utils.isNullOrEmpty(currObj)) {
            resultObj.result = false;
            return false;
          }
        } else {
          if (j == 1) {
            currObj = currObj.subAnswers[pLevel];

            if (this.utils.isNullOrEmpty(currObj) || this.utils.isEmptyObject(currObj)) {
              resultObj.result = false;
              return false;
            }
          } else if (j == 2) {
            currObj = this.matchAnswerLevel(currObj.subAnswers, pLevel, 'subAnswer');

            if (this.utils.isNullOrEmpty(currObj)) {
              resultObj.result = false;
              return false;
            }
          }
        }
      }
    } else if (levels.length == 1) {
      resultObj.result = answer && answer.length > 0 ? true : false;
    } else {
      resultObj.result = false;
    }

    if (resultObj.result) {
      if (levels.length == 1) {
        //let dataAnswers: any[] = [];
        resultObj.result = answer && answer.length > 0 ? true : false;

        if (resultObj.result) {
          for (let k = 0; k < answer.length; k++) {
            let elem: any = answer[k];
            resultObj.answers.push(elem.answer);
          }
        }
      } else if (levels.length == 2) {
        resultObj.result = currObj && currObj.subAnswers && currObj.subAnswers.length > 0 ? true : false;

        if (resultObj.result) {
          for (let k = 0; k < currObj.subAnswers.length; k++) {
            let elem: any = currObj.subAnswers[k];
            resultObj.answers.push(elem.answer);
          }
        }
      } else if (levels.length == 3) {
        resultObj.result = currObj && currObj.optionAnswers[0] && currObj.optionAnswers[0].subAnswers && currObj.optionAnswers[0].subAnswers.length > 0 ? true : false;

        if (resultObj.result) {
          for (let k = 0; k < currObj.optionAnswers[0].subAnswers.length; k++) {
            let elem: any = currObj.optionAnswers[0].subAnswers[k];
            resultObj.answers.push(elem.answer);
          }
        }
      }
    }

    return resultObj;
  };

  matchAnswerLevel(a: any, pLevel: any, propName: any) {
    let result: any = "";

    if (a && a.length > 0) {
      let i: any = a.length;
      while (i--) {
        if (a[i][propName] == pLevel) {
          return a[i];
        }
      }
    }

    return result;
  };

  getMeanCalculationValues(tileAnswers: any) {
    let data: object = {};

    let sumOfX: number = 0;
    let noOfPatients: number = 0;

    for (let key in tileAnswers) {
      let x: number = (parseInt(key) * parseInt(tileAnswers[key]));
      let N: number = parseInt(tileAnswers[key]);

      sumOfX = sumOfX + x;
      noOfPatients = noOfPatients + N;
    }

    let M: number = sumOfX / noOfPatients;
    let sumOfSquare: number = 0;

    for (let key in tileAnswers) {
      let v: number = parseInt(key);

      let square: number = ((v - M) * (v - M)) * parseInt(tileAnswers[key]);
      sumOfSquare = sumOfSquare + square;
    }

    let S: number = Math.sqrt(sumOfSquare / noOfPatients);
    let lower: number = M - S;
    let top: number = M + S;

    data["M"] = M;
    data["lower"] = lower;
    data["top"] = top;

    return data;
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

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
