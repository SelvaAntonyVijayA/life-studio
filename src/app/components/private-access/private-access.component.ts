import { Component, OnInit, Inject, ElementRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DOCUMENT } from '@angular/common';
import { forkJoin as observableForkJoin } from 'rxjs';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { PageService } from '../../services/page.service';
import { LocationService } from '../../services/location.service';
import { MemberService } from '../../services/member.service';
import 'src/js/jquery.tinysort.min.js';

declare var tsort: any;
declare var $: any;

@Component({
  selector: 'app-private-access',
  templateUrl: './private-access.component.html',
  styleUrls: ['./private-access.component.css'],
  providers: [PageService, LocationService, MemberService],
  encapsulation: ViewEncapsulation.None
})
export class PrivateAccessComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private loaderShared: LoaderSharedService,
    public utils: Utils,
    private pageService: PageService,
    private locationService: LocationService,
    private memberService: MemberService,
    @Inject(DOCUMENT) private document: any,
    private e1: ElementRef,
    private cdRef: ChangeDetectorRef) { }

  emptyProcess: any = this.divZeroRecordsFound("one");
  emptyRoles: any = this.divZeroRecordsFound("one");
  emptyUsers: any = this.divZeroRecordsFound("two");
  emptySquares: any = this.divZeroRecordsFound("two");

  privateAccessGrid: ElementRef<any>;
  privateAccessGridPager: ElementRef<any>;
  squaresGrid: ElementRef<any>;
  squaresGridPager: ElementRef<any>;
  usersGrid: ElementRef<any>;
  usersGridPager: ElementRef<any>;

  private orgChangeDetect: any;
  oid: string = "";
  rAccess: Object = {};
  appList: any[] = [];
  selectedApp: string = "-1";
  locationsList: any[] = [];
  selectedLocation: string = "-1";
  newRoleId: string = "-1";
  userColModel: any[] = [];
  profileFields: any[] = [];
  onloadAssigning: boolean = false;
  memberIdsAssigned: string[] = [];
  userLoadInitial: string = "-1";
  userLastEdit: string = "-1";
  userChk: boolean = false;
  memberId: string = "";
  selectedUserId: string = "-1";

  getFileName(el: any) {
    //var name = el.value;
    //$("#fileName").text(name);
  };

  loadPrivateAccess() {
    this.getApps().then(appsRes => {
      if (this.utils.isArray(appsRes) && appsRes.length > 0) {
        this.appList = appsRes;
        this.selectedApp = this.appList[0]["_id"];

        this.getLocations().subscribe(locRes => {
          if (this.utils.isArray(locRes) && locRes.length > 0) {
            this.locationsList = locRes;
            this.selectedLocation = locRes[0]["_id"];
          }

          this.getPrivateAccess().subscribe(profUserDatas => {
            let profData: any = profUserDatas[0];
            let userData: any = profUserDatas[1];

            this.userColModel = profData["userColModel"];
            this.profileFields = profData["fields"];

            this.loadUsers(userData);
          });
        });

        this.loadRoles();
        this.loadSquares();
      }
    });
  };

  getPrivateAccess() {
    let profDatas: any = this.getProfileFields();
    let userData: any = this.getUserData();

    return observableForkJoin([profDatas, userData]);
  };

  getApps() {
    let apps: any = this.pageService.getApps(this.oid);

    return apps;
  };

  getLocations() {
    let locs: any = this.locationService.getLocations(this.oid, this.selectedApp);

    return locs;
  };

  getProfileFields() {
    let profileData: any = this.memberService.getProfileFields(this.selectedApp);

    return profileData;
  };

  getUserData() {
    let memberData: any = this.memberService.getMemberData(this.oid, this.selectedApp, this.selectedLocation);

    return memberData;
  };

  appChange(appId: string) {
    this.selectedApp = appId;
  };

  locationChange(locId: string) {
    this.selectedLocation = locId;
  };

  privateAccessDataReset() {
    this.privateAccessReset();
    this.oid = "";
    this.appList = [];
    this.selectedApp = "-1";
    this.locationsList = [];
    this.selectedLocation = "-1";

    $.jgrid.gridUnload("#private-access");
    $.jgrid.gridUnload("#squares");
    $.jgrid.gridUnload("#users-grid");

    this.privateAccessGrid = this.document.getElementById("private-access");
    this.privateAccessGridPager = this.document.getElementById("private-access-pager");
    this.squaresGrid = this.document.getElementById("squares");
    this.squaresGridPager = this.document.getElementById("squares-pager");
    this.usersGrid = this.document.getElementById("users-grid");
    this.usersGridPager = this.document.getElementById("users-grid-pager");
  };

  privateAccessReset() {
    this.newRoleId = "-1";
    this.userColModel = [];
    this.profileFields = [];
    this.onloadAssigning = false;
    this.memberIdsAssigned = [];
    this.userLoadInitial = "-1";
    this.userLastEdit = "-1";
    this.userChk = false;
    this.memberId = "";
    this.selectedUserId = "-1";
  };

  loadRoles() {
    $(this.privateAccessGrid).jqGrid({
      url: '/approles/list/' + this.selectedApp,
      editurl: 'clientArray',
      datatype: "json",
      colModel: [{
        name: '_id',
        index: '_id',
        hidden: true,
        key: true
      }, {
        name: 'squares',
        index: 'squares',
        hidden: true
      }, {
        label: 'Roles',
        name: 'name',
        width: 220,
        editable: true
      }],
      sortname: '_id',
      loadonce: true,
      width: 230,
      height: 765,
      emptyrecords: 'No Roles',
      viewrecords: false,
      rowNum: 350,
      pager: "#private-access-pager",
      onSelectRow: (rowid: string) => {
        this.selectRoleDependants(rowid);
      },
      loadComplete: () => {
        if (this.newRoleId !== "-1") {
          $(this.privateAccessGrid).jqGrid('setSelection', this.newRoleId);
          this.selectRoleDependants(this.newRoleId);
        }

        let privateAccessPagerCenter: any = this.document.getElementById("private-access-pager_center");
        $(this.privateAccessGridPager).insertAfter('#gview_private-access > .ui-jqgrid-titlebar');


        if (this.privateAccessGrid["p"]["reccount"] === 0) {
          this.emptyRoles.show();
        } else {
          this.emptyRoles.hide();
        }

        $(privateAccessPagerCenter).hide();
      }
    });

    this.emptyRoles.insertAfter($(this.privateAccessGrid).parent());

    $(this.privateAccessGrid).navGrid('#private-access-pager', {
      edit: false,
      add: false,
      del: false,
      search: false,
      cancel: false,
      refresh: false,
      save: false
    }).navButtonAdd('#private-access-pager', {
      caption: "",
      title: "Duplicate",
      buttonicon: " ui-icon-transferthick-e-w",
      onClickButton: () => {
        //duplicateRole();
      }
    }).navButtonAdd('#private-access-pager', {
      caption: "",
      title: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: () => {
        /* var roleId = $("#private-access").jqGrid('getGridParam', 'selrow');
   
         if (roleId && roleId != "" && roleId != null && roleId.length > 12) {
           var roleObj = {};
           roleObj.roleId = roleId;
           roleObj.appId = $(".apps-access").val();
   
           $.ajax({
             type: "POST",
             cache: false,
             async: false,
             data: {
               "form_data": JSON.stringify(roleObj)
             },
             url: "/app/member/rolemembers/",
             success: function (members) {
               if (members.length > 0) {
                 jAlert('Unassign the assigned users to delete selected Role', 'Information', 'Ok');
               } else {
                 deleteRole(roleId);
               }
             }
           });
         } else {
           jAlert('No Role is selected', 'Information', 'Ok');
         } */
      }
    });

    $(this.privateAccessGrid).inlineNav('#private-access-pager', {
      edit: true,
      add: true,
      del: false,
      cancel: true,
      search: true,
      save: true,
      refresh: false,
      editParams: this.rolesProcessOperations,
      addParams: {
        position: "afterSelected",
        addRowParams: this.rolesProcessOperations
      }
    });
  };

  rolesProcessOperations: any = {
    keys: true,
    url: 'clientArray',
    oneditfunc: (rowid: string) => {
      this.emptyRoles.hide();
    },
    aftersavefunc: (rowid: any, response: any, options: any) => {
      let roleCurrentRow: string = $(this.privateAccessGrid).jqGrid("getLocalRow", rowid);

      /*if (roleCurrentRow.name != "") {
        var roleObj = {};
        roleObj.name = roleCurrentRow.name;
        roleObj.appId = $('.apps-access').val();
  
        if (roleCurrentRow._id.length > 12) {
          roleObj._id = roleCurrentRow._id;
  
          var squaresList = [];
          var rolesCurrentRow = $("#private-access").jqGrid("getLocalRow", rowid);
  
          if (rolesCurrentRow.squares && rolesCurrentRow.squares.length > 0) {
            $.each(rolesCurrentRow.squares, function (index, currentSquare) {
              var square = {};
              var data = currentSquare.split("_");
              square["squareId"] = data[0];
              square["type"] = data[1];
  
              squaresList.push(square);
            });
          }
  
          roleObj.squares = squaresList;
        }
  
        var roleString = JSON.stringify(roleObj);
  
        $.ajax({
          type: "POST",
          cache: false,
          async: false,
          data: {
            "form_data": roleString
          },
          url: "/approles/save",
          success: function (res) {
            newRoleId = res._id;
  
            $("#private-access").setGridParam({
              datatype: 'json',
              page: 1
            }).trigger('reloadGrid');
  
            jAlert('Role created', 'Information', 'Ok');
          }
        });
      } else {
        $('#private-access').jqGrid('delRowData', rowid);
      }*/
    }
  };

  selectRoleDependants = function (rowid?: string) {
    if (this.utils.isNullOrEmpty(rowid) || rowid.length < 12) {
      return;
    }

    let rolesData: any = $(this.privateAccessGrid).jqGrid('getRowData', rowid);
    //var members = rolesData.members != "" ? rolesData.members.split(',') : [];
    $(this.usersGrid).jqGrid('resetSelection');
    $(this.squaresGrid).jqGrid('resetSelection');

    let members: any = $(this.usersGrid).jqGrid('getGridParam', 'data');

    if (members.length > 0) {
      this.memberIdsAssigned = [];

      for (let i = 0; i < members.length; i++) {
        let mem: any = members[i];

        if (mem.memberRoleId == rowid) {
          this.memberIdsAssigned.push(mem._id);
          $(this.usersGrid).jqGrid('setSelection', mem._id);
          $(this.usersGrid).find("#" + mem._id + " input:checkbox").prop('checked', false);
        }
      }
    }

    if (rolesData.hasOwnProperty("squares")) {
      let squares: any[] = !this.utils.isNullOrEmpty(rolesData.squares) ? rolesData.squares.split(',') : [];

      if (squares.length > 0) {
        for (let i = 0; i < squares.length; i++) {
          let sqrId: any = squares[i];
          $(this.squaresGrid).jqGrid('setSelection', sqrId);
        }
      }
    }

    if (this.onSelectUser) {
      $(this.onSelectUser).css("background", "");
      this.selectedUserId = -1;
    }
  };

  loadSquares() {
    $(this.squaresGrid).jqGrid({
      url: '/page/pagesquareslist/' + this.selectedApp,
      editurl: 'clientArray',
      datatype: "json",
      colModel: [{
        name: 'squareIdType',
        index: 'squareIdType',
        hidden: true,
        key: true
      }, {
        label: 'Squares',
        name: 'name',
        width: 250,
        editable: true
      }, {
        name: '_id',
        index: '_id',
        hidden: true
      }],
      sortname: 'name',
      loadonce: true,
      width: 230,
      height: 765,
      rowNum: 350,
      emptyrecords: 'No Squares',
      viewrecords: false,
      multiselect: true,
      pager: "#squares-pager",
      onSelectRow: (rowid: string) => {
      },
      loadComplete: () => {

        if (this.squaresGrid["p"]["reccount"] === 0) {
          this.emptySquares.show();
        } else {
          this.emptySquares.hide();
        }

        let squaresPagerLeft: any = this.document.getElementById("squares-pager_left");
        let squaresPagerCenter: any = this.document.getElementById("squares-pager_center");

        $(squaresPagerLeft).css("width", "100%");
        $(this.squaresGridPager).insertAfter('#gview_table3 > .ui-jqgrid-titlebar');
        $(squaresPagerCenter).hide();
      }
    });

    this.emptySquares.insertAfter($(this.squaresGrid).parent());

    $(this.squaresGrid).navGrid("#squares-pager", {
      edit: false,
      add: false,
      del: false,
      cancel: false,
      save: false,
      refresh: false,
      search: false,
      view: false
    }).navButtonAdd('#squares-pager', {
      caption: "Save",
      title: "Assign Squares to Role",
      buttonicon: "ui-icon-circle-plus",
      position: "first",
      onClickButton: () => {
        var roleId = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');
        var selectedSquares = $(this.squaresGrid).jqGrid("getGridParam", "selarrrow");

        /* if (!roleId || roleId == "" || roleId == null || roleId.length < 12) {
           jAlert('No role is selected', 'Information', 'Ok');
         } else {
           var squaresList = [];
           var pageIds = [];
           var square = {};
 
           $.each(selectedSquares, function (index, squareId) {
             square = {};
             var rowData = $("#table3").getRowData(squareId);
             var data = rowData.squareIdType.split("_");
             square["squareId"] = data[0];
             square["type"] = data[1];
 
             var pageIndex = pageIds.indexOf(rowData._id);
 
             if (pageIndex == -1) {
               pageIds.push(rowData._id);
             }
 
             squaresList.push(square);
           });
 
           var squareObj = {
             "squares": squaresList,
             "pageIds": pageIds
           };
 
           assignMembers(function (result) {
             assignSquares("/approles/update/" + roleId, squareObj, function (result) {
               var rolesData = $('#private-access').jqGrid('getRowData', roleId);
               rolesData.squares = selectedSquares;
               $('#private-access').jqGrid('setRowData', roleId, rolesData);
 
               $('#users-grid').jqGrid('resetSelection');
               var members = $('#users-grid').jqGrid('getGridParam', 'data');
               var memberIdsAssigned = [];
 
               if (members.length > 0) {
                 memberIdsAssigned = [];
                 $.each(members, function (index, mem) {
                   if (mem.memberRoleId == roleId) {
                     memberIdsAssigned.push(mem._id);
                     $('#users-grid').jqGrid('setSelection', mem._id);
                     $('#users-grid').find("#" + mem._id + " input:checkbox").prop('checked', false);
                   }
                 });
               }
 
               jAlert('Squares assigned', 'Information', 'Ok');
             });
           });
         } */
      }
    });

    $(this.squaresGrid).inlineNav('#squares-pager', {
      edit: false,
      add: false,
      del: false,
      cancel: false,
      save: false,
      refresh: false,
      search: false,
      view: false,
      editParams: {
        keys: true,
      },
      addParams: {
        keys: true,
        title: "Assign"
      }
    });
  };

  divZeroRecordsFound(rec: string) {
    let divZero1: any = $("<div><div style='position:relative;'><span style='color:#fff;font-size:15px'>0 records found</span></div></div>");
    let divZero2 = $("<div><span style='color:#fff;font-size:15px'>0 records found</span></div>");

    return rec === "one" ? divZero1 : divZero2;
  };

  getUserGridShrink() {
    let currIsShrink: boolean = false;

    if (this.utils.isArray(this.userColModel) && this.userColModel.length > 0) {
      let width: number = 0;

      for (let i = 0; i < this.userColModel.length; i++) {
        let colMdl: Object = this.userColModel[i];

        if (colMdl.hasOwnProperty("width")) {
          width = width + parseInt(colMdl['width']);
        }
      }

      if (width <= 770) {
        currIsShrink = true;
      }
    }

    return currIsShrink;
  };

  loadUsers(userDatas: any[]) {
    let isShrink: boolean = this.getUserGridShrink();
    let rowNumber: number = userDatas && userDatas.length > 25 ? userDatas.length : 25;

    $(this.usersGrid).jqGrid({
      data: userDatas,
      datatype: "local",
      colModel: this.userColModel,
      cmTemplate: { editable: true },
      sortname: 'firstName',
      sortorder: 'asc',
      shrinkToFit: isShrink,
      forceFit: true,
      loadonce: true,
      width: 720,
      height: 740,
      multiselect: true,
      multiboxonly: true,
      emptyrecords: 'No Users',
      viewrecords: false,
      rowNum: rowNumber,
      pager: "#users-grid-pager",
      beforeSelectRow: (rowid: string, e: any) => {
        /*if (onSelectUser) {
          $(onSelectUser).css("background", "");
          selectedUserId = -1;
        }

        onSelectUser = $('#' + $.jgrid.jqID(rowid))[0];

        if (!userChk) {
          $(onSelectUser).css("background", "#4AC2B9");
          $(onSelectUser).css("font-weight", "bolder");
          selectedUserId = rowid;
          $('#table3').jqGrid('resetSelection');
          selectUserBasedSquares(rowid);
        } else {
          $('#table3').jqGrid('resetSelection');
          selectUserSquares();
        }
        userChk = false;
        return $(e.target).is('input[type=checkbox]');*/
      },
      loadComplete: () => {
        $(this.usersGridPager).insertAfter('#gview_users-grid > .ui-jqgrid-titlebar');

        this.userInputChange();

        let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');

        if (!this.utils.isNullOrEmpty(roleId) && roleId.length > 15 && this.onloadAssigning) {
          let members: any[] = $('#users-grid').jqGrid('getGridParam', 'data');
          if (members.length > 0) {
            this.memberIdsAssigned = [];

            for (let i = 0; i < members.length; i++) {
              let mem: Object = members[i];

              if (mem["memberRoleId"] == roleId) {
                this.memberIdsAssigned.push(mem["_id"]);
                $(this.usersGrid).jqGrid('setSelection', mem["_id"]);
                $(this.usersGrid).find("#" + mem["_id"] + " input:checkbox").prop('checked', false);
              }
            }
          }
        }

        if (this.userLoadInitial === "-1") {
          this.userGridSorterHtml();
        }

        let usersGridPagerCenter: any = this.document.getElementById("users-grid-pager_center");

        $(usersGridPagerCenter).hide();

        let assignedUsersRow: any = $(this.usersGrid).children().find("tr:not(:first)");

        if (!this.utils.isNullOrEmpty(assignedUsersRow) && assignedUsersRow.length > 0) {
          this.processSortFilter(assignedUsersRow);
        }

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

        if (this.onloadAssigning) {
          this.onloadAssigning = true;
        }
      },
      ondblClickRow: (id: string) => {
        this.memberId = id;
        let selectedRows: any[] = $("#users-grid").jqGrid('getGridParam', 'selarrrow');

        selectedRows = this.utils.isNullOrEmpty(selectedRows) ? [] : selectedRows

        $(this.usersGrid).jqGrid('restoreRow', this.userLastEdit);

        let lastSelectedRow: number = selectedRows.indexOf(this.userLastEdit);

        if (lastSelectedRow !== -1) {
          $(this.usersGrid).jqGrid('setSelection', this.userLastEdit);
        }

        let currentRow: number = selectedRows.indexOf(id);

        if (currentRow === -1) {
          $(this.usersGrid).jqGrid('setSelection', id);
        }

        $(this.usersGrid).find("#" + id + " input:checkbox").prop('checked', false);
        this.userLastEdit = id;

        this.resetMember();
        this.resetValidation();

        if (this.selectedApp !== "-1") {
          //$('#addMemberDetail').modal('show');
          this.assignProfileValues();
        } else {
          this.utils.iAlert('error', 'Information', 'No App is selected');
        }
      },
      onSelectRow: (rowId: string) => {
        this.memberId = rowId;

        if (rowId.length < 12) {
          $(this.usersGrid).find("#" + rowId + " input:checkbox").prop('checked', false);
        }
      }
    });

    this.emptyUsers.insertAfter($(this.usersGrid).parent());

    $(this.usersGrid).inlineNav('#users-grid-pager', {
      edit: false,
      add: false,
      del: false,
      cancel: false,
      search: true,
      save: false,
      refresh: false
    }).navButtonAdd('#users-grid-pager', {
      caption: "Add User",
      title: "Add User",
      buttonicon: "ui-icon-plus",
      position: "first",
      onClickButton: () => {
        if (this.selectedApp !== "-1") {
          this.memberId = "-1";
          //$('#addMemberDetail').modal('show');
          this.resetValidation();
          //var form = $('#userForm');
          this.resetMember();
        } else {
          this.utils.iAlert('error', 'Information', 'No App is selected');
        }
      }
    }).navButtonAdd('#users-grid-pager', {
      caption: "Role",
      title: "Assign Role to CHECKED users",
      buttonicon: "ui-icon-circle-plus",
      onClickButton: () => {
        /* var roleId = $("#private-access").jqGrid('getGridParam', 'selrow');
         var rolesData = $('#private-access').jqGrid('getRowData', roleId);
         var selectedUsers = $("#users-grid").jqGrid("getGridParam", "selarrrow");
 
         if (selectedUsers.length == 0) {
           jAlert('No End Users are selected', 'Information', 'Ok');
         } else if (roleId == null || roleId == "") {
           jAlert('No Role is selected ', 'Information', 'Ok');
         } else if (selectedUsers.length > 0) {
           var memberUpdateList = [];
           var squaresList = [];
           var square = {};
           var selectedSquares = $("#table3").jqGrid("getGridParam", "selarrrow");
 
           $.each(selectedSquares, function (index, squareId) {
             square = {};
             var rowData = $("#table3").getRowData(squareId);
             var data = rowData.squareIdType.split("_");
             square["squareId"] = data[0];
             square["type"] = data[1];
 
             squaresList.push(square);
           });
 
           $.each(selectedUsers, function (index, user) {
             var checked = $('#users-grid').find("#" + user + " input:checkbox").is(':checked');
 
             if (checked) {
               var userObj = {};
               userObj.userId = user;
               userObj.appId = $('.apps-access').val();
               userObj.squares = {
                 "squares": squaresList
               };
 
               userObj.role = {
                 "role": [{
                   "roleId": roleId,
                   "name": rolesData.name
                 }]
               };
 
               memberUpdateList.push(userObj);
             }
           });
 
           $.ajax({
             type: "POST",
             cache: false,
             async: false,
             data: {
               "form_data": JSON.stringify(memberUpdateList)
             },
             url: "/app/square/assign",
             success: function (res) {
               if (!res.success) {
                 jAlert(res.message, 'Information', 'Ok');
                 return false;
               } else {
                 onloadAssigning = true;
                 var locationId = "";
 
                 if ($('.location').val() != "-1" && $('.location').val() != "") {
                   locationId = $('.location').val()
                 }
 
                 var memberUrl = '/app/member/get/' + oid + "/" + $('.apps-access').val() + "/" + locationId;
                 var isShrink = getUserGridShrink();
 
                 $("#users-grid").jqGrid('setGridParam', {
                   datatype: 'json',
                   shrinkToFit: isShrink,
                   url: memberUrl
                 }).trigger("reloadGrid");
 
                 jAlert('End users are assigned to role', 'Information', 'Ok');
               }
             }
           });
         } */
      }
    }).navButtonAdd('#users-grid-pager', {
      caption: "Role",
      title: "Un-assign Role from CHECKED users",
      buttonicon: "ui-icon-circle-minus",
      onClickButton: () => {
        /* var roleId = $("#private-access").jqGrid('getGridParam', 'selrow');
         var rolesData = $('#private-access').jqGrid('getRowData', roleId);
         var selectedUsers = $("#users-grid").jqGrid("getGridParam", "selarrrow");
         var roleSquaresList = [];
 
         if (selectedUsers.length == 0) {
           jAlert('No End Users are selected', 'Information', 'Ok');
         } else if (roleId == null || roleId == "") {
           jAlert('No Role is selected', 'Information', 'Ok');
         } else {
           jConfirm("Are you sure you want to unassign the Users?", 'Warning', 'Yes', 'No', function (r) {
             if (r) {
               var memberUpdateList = [];
 
               if (rolesData.squares) {
                 var squares = rolesData.squares != "" ? rolesData.squares.split(',') : [];
 
                 if (squares.length > 0) {
                   $.each(squares, function (index, squareId) {
                     square = {};
                     var data = squareId.split("_");
                     square["squareId"] = data[0];
                     square["type"] = data[1];
 
                     roleSquaresList.push(square);
                   });
                 }
               }
 
               $.each(selectedUsers, function (index, user) {
                 var checked = $('#users-grid').find("#" + user + " input:checkbox").is(':checked');
 
                 if (checked) {
                   var userData = $('#users-grid').jqGrid('getRowData', user);
 
                   if (userData.squares) {
                     userData.squares = JSON.parse(userData.squares);
                   }
 
                   if (userData.squares.length > 0) {
                     $.each(roleSquaresList, function (i, rSquare) {
                       $.each(userData.squares, function (indx, square) {
                         if (square && square.squareId == rSquare.squareId) {
                           userData.squares.splice(indx, 1);
                         }
                       });
                     });
                   }
 
                   var userObj = {};
                   userObj.userId = user;
                   userObj.appId = $('.apps-access').val();
                   userObj.role = {
                     "role": []
                   };
 
                   userObj.squares = {
                     "squares": userData.squares
                   };
 
                   memberUpdateList.push(userObj);
                 }
               });
 
               $.ajax({
                 type: "POST",
                 cache: false,
                 async: false,
                 data: {
                   "form_data": JSON.stringify(memberUpdateList)
                 },
                 url: "/app/square/assign",
                 success: function (res) {
                   if (!res.success) {
                     jAlert(res.message, 'Information', 'Ok');
                     return false;
                   } else {
                     onloadAssigning = true;
                     var locationId = "";
 
                     if ($('.location').val() != "-1" && $('.location').val() != "") {
                       locationId = $('.location').val()
                     }
 
                     var memberUrl = '/app/member/get/' + oid + "/" + $('.apps-access').val() + "/" + locationId;
                     var isShrink = getUserGridShrink();
 
                     $("#users-grid").jqGrid('setGridParam', {
                       datatype: 'json',
                       shrinkToFit: isShrink,
                       url: memberUrl
                     }).trigger("reloadGrid");
 
                     jAlert('End users are unassigned to selected role', 'Information', 'Ok');
                   }
                 }
               });
             }
           });
         } */
      }
    }).navButtonAdd('#users-grid-pager', {
      caption: "",
      title: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: () => {
        /* var selectedUsers = $("#users-grid").jqGrid("getGridParam", "selarrrow");
         var someUsersNotDeleted = false;
         var appsForDelete = ["5622140512b747843bc8136f", "56d8849474ae9b5201144c92"];
 
         jConfirm("Are you sure you want to delete the user(s)?", 'Warning', 'Yes', 'No', function (r) {
           if (r) {
             $.each(selectedUsers, function (index, userId) {
               var checked = $('#users-grid').find("#" + userId + " input:checkbox").is(':checked');
               var postUrl = "/app/member/remove/" + userId;
 
               if (checked) {
                 $.ajax({
                   type: "POST",
                   cache: false,
                   async: false,
                   url: "/app/member/remove/" + userId + "/" + $(".apps-access").val(),
                   success: function (res) {
                     if (!res.deleted) {
                       someUsersNotDeleted = true;
                     }
                   }
                 });
               }
             });
 
             reloadUserData();
 
             if (someUsersNotDeleted) {
               jAlert('Some User(s) not deleted', 'Information', 'Ok');
 
             } else {
               jAlert('User(s) deleted', 'Information', 'Ok');
             }
 
           }
         }); */
      }
    });
  };

  userEvents() {
    let searchPatientNames: any = this.document.getElementById("search_patient_names");
    let doSort: any = this.document.getElementsByClassName("do_sort");

    searchPatientNames.addEventListener('keyup', (e) => {
      let text: string = e.target.value;
      this.searchMemberNames(text);
    });

    doSort[0].addEventListener('click', (e) => {
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

  processSortFilter(userRows: any[]) {
    for (let i = 0; i < userRows.length; i++) {
      let row: any = userRows[i];
      let id: string = $(row).attr("id");

      let currentUserRow: any = $(this.usersGrid).jqGrid('getRowData', id);
      let search: string = "";
      let sortDate: any = "";

      if (!this.utils.isEmptyObject(currentUserRow)) {
        sortDate = currentUserRow.hasOwnProperty("lastUpdatedOn") && !this.utils.isNullOrEmpty(currentUserRow["lastUpdatedOn"]) ? this.utils.formatDateTime(new Date(currentUserRow.lastUpdatedOn), 'yy/mm/dd g:ii a') : "";
        let keys: string[] = Object.keys(currentUserRow);

        for (let j = 0; j < keys.length; j++) {
          let objKey: string = keys[j];

          if (objKey !== "allFieldsString" && objKey !== "isDied" && objKey !== "_id" && objKey !== "_id_") {
            let text: any = currentUserRow[objKey];

            if (!this.utils.isNullOrEmpty(text)) {
              text = typeof text == "string" ? text : text.toString();
              search = search + " " + text.toLowerCase();
            }
          }
        }
      }

      $(row).attr("sortDate", sortDate);

      if ($(row).find('.user-names-search').length === 0) {
        $(row).append("<input class='user-names-search' search='" + search + "' type='hidden'/>");
      }
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

  userGridSorterHtml() {
    $(this.usersGridPager).append("<img src='/img/search_patient_names.png' style='float: left; margin-top: 5px; position: absolute; margin-left: 13px;' alt='Search Names' height='14' width='14'>");
    $(this.usersGridPager).append("<div class='div-search-patient'><input id='search_patient_names' class='form-control input-sm' style='width: 200px; float: left; margin-left: 6px; background-color: #f3f3f3; color: #5b5b5b;' type='text' placeholder='Search'/></div>");

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

  userInputChange() {
    let inputChkBox: any = this.document.querySelectorAll("input[type=checkbox]");

    $(inputChkBox).change((e) => {
      $(this.usersGrid).jqGrid('restoreRow', this.userLastEdit);
      this.userChk = true;
    });
  };

  resetMember() {
    /* var formFields = $("#userForm .form-group").find(":first");
 
     for (var i = 0; i < formFields.length; i++) {
       $(formFields[i]).val("");
     }
 
     $('#addMemberDetail').find('.modal-title').text("Add User"); */
  };

  resetValidation() {
    //$('#userForm').bootstrapValidator('resetForm', true);
  };

  assignProfileValues() {
    let currentUserRow: any = $('#users-grid').jqGrid('getRowData', this.memberId);
    //var currentUserRow = $('#users-grid').jqGrid("getLocalRow", memberId);
    /* $('#addMemberDetail').find('.modal-title').text("Edit User");
     var profileImage = $('#addMemberDetail').find('.member-profile-image');
 
     if (currentUserRow && currentUserRow.allFieldsString) {
       var selectUserData = JSON.parse(currentUserRow.allFieldsString);
 
       if (selectUserData && selectUserData.image && typeof selectUserData.image !== "undefined" && selectUserData.image != "" && selectUserData.image != null) {
         profileImage.css("display", "block");
         profileImage.find('img').attr("src", selectUserData.image);
       } else {
         profileImage.css("display", "none");
         profileImage.find('img').attr("src", "");
       }
 
       var formFields = $("#userForm .form-group").find(":first");
 
       for (var i = 0; i < formFields.length; i++) {
         var field = $(formFields[i]);
 
         if (field.attr("type") === 'checkbox') {
           field.prop('checked', selectUserData[field.attr("name")]);
 
         } else if (field.attr("type") === 'date') {
           var fdate = _validateInput(selectUserData[field.attr("name")]);
 
           if (fdate) {
             fdate = fdate.split('/');
             field.val(fdate[2] + "-" + fdate[0] + "-" + fdate[1]);
           }
 
         } else if (field.attr("type") === 'password') {
           field.val(_validateInput(selectUserData["decryptedPassword"]));
 
         } else {
           field.val(_validateInput(selectUserData[field.attr("name")]));
         }
       }
     } */
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.loaderShared.showSpinner(false);
        this.privateAccessDataReset();
        this.oid = Cookie.get('oid');
        this.loadPrivateAccess();
      }
    });
  };

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
