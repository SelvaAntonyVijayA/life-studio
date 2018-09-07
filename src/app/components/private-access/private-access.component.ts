import { Component, OnInit, Inject, ElementRef, ViewEncapsulation, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { RolesService } from '../../services/roles.service';
import { AppsService } from '../../services/apps.service'
import { GeneralService } from '../../services/general.service'
import 'src/js/jquery.tinysort.min.js';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { merge } from 'rxjs/operators';
// import { DateValidator } from '../../helpers/date-validator';

declare var tsort: any;
declare var $: any;

@Component({
  selector: 'app-private-access',
  templateUrl: './private-access.component.html',
  styleUrls: ['./private-access.component.css'],
  providers: [PageService, LocationService, MemberService, GeneralService],
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
    private rolesService: RolesService,
    private appsService: AppsService,
    private generalService: GeneralService,
    @Inject(DOCUMENT) private document: any,
    private modalService: BsModalService,
    private e1: ElementRef,
    private cdRef: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) { }

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

  @ViewChild('userForm') userForm: ModalDirective;
  userFormRef: BsModalRef;
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
  memberForm: FormGroup;
  memberFormSubmitted: boolean = false;
  onSelectUser: any = null;
  savedMemCheck: boolean = false;
  memberCount: number = 0;
  formTitle: string = "Add User";
  profileImage: object = { "isShow": false, "src": "" };
  profileObj: Object = {};

  defaultRegex: Object = {
    text: {
      pattern: "^[a-zA-Z0-9 \_\.]+$",
      message: " can only consist of alphabetical, number, dot and underscore"
    },
    number: {
      pattern: "^[0-9 \.\,]+$",
      message: " can only consist of numbers with dot or commas"
    }
  };

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
            //this.selectedLocation = locRes[0]["_id"];
          }

          this.getPrivateAccess().subscribe(profUserDatas => {
            let profData: any = profUserDatas[0];
            let userData: any = profUserDatas[1];

            this.userColModel = this.userColumns().concat(profData["userColModel"]);

            this.loadUsers(userData);
            this.createUserForm(profData["fields"]);
            this.memberFormOnHide();
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
    let locId = !this.utils.isNullOrEmpty(this.selectedLocation) && this.selectedLocation !== "-1" ? this.selectedLocation : "";
    let memberData: any = this.memberService.getMemberData(this.oid, this.selectedApp, locId);

    return memberData;
  };

  appChange(appId: string) {
    this.selectedApp = appId;

    this.userLoadInitial = "-1";
    this.memberId = "";
    this.selectedLocation = "-1";
    this.locationsList = [];

    $.jgrid.gridUnload("#users-grid");
    this.assignAppProfileDatas();
    this.appLocationsAssign();
  };

  assignAppProfileDatas() {
    this.getProfileFields().subscribe(res => {
      let profData: any = !this.utils.isNullOrEmpty(res) && res.hasOwnProperty("userColModel") && this.utils.isArray(res["userColModel"]) ? res["userColModel"] : [];
      this.userColModel = this.userColumns().concat(profData);
    });
  };

  appLocationsAssign() {
    this.getLocations().subscribe(locRes => {
      if (this.utils.isArray(locRes) && locRes.length > 0) {
        this.locationsList = locRes;
      }
    });
  };

  locationChange(locId: string) {
    this.selectedLocation = locId;

    $(this.privateAccessGrid).jqGrid('setGridParam', {
      datatype: 'json'
    }).trigger("reloadGrid");

    $(this.squaresGrid).jqGrid('setGridParam', {
      datatype: 'json'
    }).trigger("reloadGrid");

    this.loadUserData(true);
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
    this.memberFormSubmitted = false;
    this.userFormRef = null;
    this.savedMemCheck = false;
    this.onSelectUser = null;
    this.memberCount = 0;
    this.formTitle = "Add User";
    this.profileImage = { "isShow": false, "src": "" };
    this.profileObj = {};
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
        this.duplicateRole();
      }
    }).navButtonAdd('#private-access-pager', {
      caption: "",
      title: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: () => {
        let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');

        if (this.utils.isNullOrEmpty(roleId) && roleId.length > 12) {
          let roleObj: Object = {};
          roleObj["roleId"] = roleId;
          roleObj["appId"] = this.selectedApp;

          this.memberService.roleMembers(roleObj).subscribe(memRes => {
            if (memRes.length > 0) {
              this.utils.iAlert('error', 'Information', 'Unassign the assigned users to delete selected Role');
            } else {
              this.deleteRole(roleId);
            }
          })
        } else {
          this.utils.iAlert('error', 'Information', 'No Role is selected');
        }
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
      let roleCurrentRow: any = $(this.privateAccessGrid).jqGrid("getLocalRow", rowid);

      if (roleCurrentRow.hasOwnProperty("name") && !this.utils.isNullOrEmpty(roleCurrentRow.name)) {
        let roleObj: Object = {};
        roleObj["name"] = roleCurrentRow.name;
        roleObj["appId"] = this.selectedApp;

        if (roleCurrentRow._id.length > 12) {
          roleObj["_id"] = roleCurrentRow._id;

          let squaresList: any[] = [];
          let rolesCurrentRow: any = $("#private-access").jqGrid("getLocalRow", rowid);

          if (rolesCurrentRow.hasOwnProperty("squares") && this.utils.isArray(rolesCurrentRow["squares"]) && rolesCurrentRow.squares.length > 0) {
            for (let i = 0; i < rolesCurrentRow.squares.length; i++) {
              let currentSquare: any = rolesCurrentRow.squares[i];

              let square: Object = {};
              let data: any[] = currentSquare.split("_");
              square["squareId"] = data[0];
              square["type"] = data[1];
              squaresList.push(square);
            }
          }

          roleObj["squares"] = squaresList;
        }

        this.rolesService.saveRole(roleObj).subscribe(res => {
          this.newRoleId = res._id;

          $(this.privateAccessGrid).setGridParam({
            datatype: 'json',
            page: 1
          }).trigger('reloadGrid');

          this.utils.iAlert('success', '', 'Role created');
        });
      } else {
        $(this.privateAccessGrid).jqGrid('delRowData', rowid);
      }
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

  deleteRole(roleId: string) {
    this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure you want to delete this Role?", "Yes", "No", (r) => {
      if (r["resolved"]) {
        this.rolesService.removeRole(roleId).subscribe(delRes => {
          $("#private-access").jqGrid('setGridParam', {
            datatype: 'json'
          }).trigger("reloadGrid");

          let locationId: string = "";

          if (this.selectedLocation !== "-1" && this.utils.isNullOrEmpty(this.selectedLocation)) {
            locationId = this.selectedLocation
          }

          let memberUrl: string = '/app/member/get/' + this.oid + "/" + this.selectedApp + "/" + locationId;

          let isShrink: boolean = this.getUserGridShrink();

          $(this.usersGrid).jqGrid('setGridParam', {
            datatype: 'json',
            shrinkToFit: isShrink,
            url: memberUrl
          }).trigger("reloadGrid");

          $(this.squaresGrid).jqGrid('setGridParam', {
            datatype: 'json'
          }).trigger("reloadGrid");

          this.utils.iAlert('success', '', 'Role removed');
        });
      }
    });
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
        let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');
        let selectedSquares: any[] = $(this.squaresGrid).jqGrid("getGridParam", "selarrrow");

        if (this.utils.isNullOrEmpty(roleId) || roleId.length < 12) {
          this.utils.iAlert('error', 'Information', "No role is selected");
        } else {
          let squaresList: any[] = [];
          let pageIds: any[] = [];
          let square: Object = {};

          for (let i = 0; i < selectedSquares.length; i++) {
            let squareId: string = selectedSquares[i];
            square = {};

            let rowData: any = $(this.squaresGrid).getRowData(squareId);
            var data = rowData.squareIdType.split("_");
            square["squareId"] = data[0];
            square["type"] = data[1];

            var pageIndex = pageIds.indexOf(rowData._id);

            if (pageIndex == -1) {
              pageIds.push(rowData._id);
            }

            squaresList.push(square);
          }

          let squareObj: Object = {
            "squares": squaresList,
            "pageIds": pageIds
          };

          this.assignMembers((memRes) => {
            this.assignSquares(roleId, squareObj, (sqrRes) => {
              let rolesData: any = $(this.privateAccessGrid).jqGrid('getRowData', roleId);
              rolesData.squares = selectedSquares;
              $(this.privateAccessGrid).jqGrid('setRowData', roleId, rolesData);

              $(this.usersGrid).jqGrid('resetSelection');
              let members: any[] = $(this.usersGrid).jqGrid('getGridParam', 'data');
              let memberIdsAssigned: any[] = [];

              if (members.length > 0) {
                memberIdsAssigned = [];

                for (let i = 0; i < members.length; i++) {
                  let mem: any = members[i];

                  if (mem.memberRoleId === roleId) {
                    memberIdsAssigned.push(mem._id);
                    $(this.usersGrid).jqGrid('setSelection', mem._id);
                    $(this.usersGrid).find("#" + mem._id + " input:checkbox").prop('checked', false);
                  }
                }
              }

              this.utils.iAlert('success', '', 'Squares assigned');
            });
          });
        }
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

  assignMembers(cb) {
    let selectedUsers: any[] = $(this.usersGrid).jqGrid("getGridParam", "selarrrow");
    let selectedSquares: any[] = $(this.squaresGrid).jqGrid("getGridParam", "selarrrow");
    let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');
    let rolesData: any = $(this.privateAccessGrid).jqGrid('getRowData', roleId);
    let squaresList: any[] = [];
    let memberUpdateList: any[] = [];
    let square: Object = {};

    for (let i = 0; i < selectedSquares.length; i++) {
      let squareId: string = selectedSquares[i];
      square = {};
      let rowData: any = $(this.squaresGrid).getRowData(squareId);
      let data: any[] = rowData.squareIdType.split("_");
      square["squareId"] = data[0];
      square["type"] = data[1];

      squaresList.push(square);
    }

    for (let i = 0; i < selectedUsers.length; i++) {
      let user: any = selectedUsers[i];
      let userData: any = $('#users-grid').jqGrid('getRowData', user);
      let userObj: Object = {};
      userObj["userId"] = user;
      userObj["appId"] = $('.apps-access').val();
      userObj["squares"] = {
        "squares": squaresList
      };

      if (userData.memberRoleId === roleId) {
        memberUpdateList.push(userObj);
      }
    }

    if (memberUpdateList.length === 0) {
      cb();
    } else {
      this.appsService.squareAssign(memberUpdateList).subscribe(sqrRes => {
        if (!sqrRes.success) {
          this.utils.iAlert('error', 'Information', sqrRes.message);
        } else {
          if (cb) {
            cb(sqrRes);
          }
        }
      });
    }
  };

  assignSquares(roleId: string, obj: Object, cb: any) {

    this.rolesService.updateRole(roleId, obj).subscribe(updateRes => {
      if (cb) {
        cb(updateRes);
      }
    });
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
        if (this.onSelectUser) {
          $(this.onSelectUser).css("background", "");
          this.selectedUserId = "-1";
        }

        this.onSelectUser = $('#' + $.jgrid.jqID(rowid))[0];

        if (!this.userChk) {
          $(this.onSelectUser).css("background", "#4AC2B9");
          $(this.onSelectUser).css("font-weight", "bolder");
          this.selectedUserId = rowid;
          $(this.squaresGrid).jqGrid('resetSelection');
          this.selectUserBasedSquares(rowid);
        } else {
          $(this.squaresGrid).jqGrid('resetSelection');
          this.selectUserSquares();
        }
        this.userChk = false;
        return $(e.target).is('input[type=checkbox]');
      },
      loadComplete: () => {
        $(this.usersGridPager).insertAfter('#gview_users-grid > .ui-jqgrid-titlebar');

        this.userInputChange();

        let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');

        if (!this.utils.isNullOrEmpty(roleId) && roleId.length > 15 && this.onloadAssigning) {
          let members: any[] = $(this.usersGrid).jqGrid('getGridParam', 'data');
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

        this.doColumnActions();
      },
      ondblClickRow: (id: string) => {
        this.memberId = id;
        let selectedRows: any[] = $(this.usersGrid).jqGrid('getGridParam', 'selarrrow');

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
          this.userFormRef = this.modalService.show(this.userForm, { class: 'modal-md' });
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
          this.resetValidation();
          this.resetMember();
          this.userFormRef = this.modalService.show(this.userForm, { class: 'modal-md' });
        } else {
          this.utils.iAlert('error', 'Information', 'No App is selected');
        }
      }
    }).navButtonAdd('#users-grid-pager', {
      caption: "Role",
      title: "Assign Role to CHECKED users",
      buttonicon: "ui-icon-circle-plus",
      onClickButton: () => {
        let roleId: string = $("#private-access").jqGrid('getGridParam', 'selrow');
        let rolesData: any = $(this.privateAccessGrid).jqGrid('getRowData', roleId);
        let selectedUsers: any[] = $("#users-grid").jqGrid("getGridParam", "selarrrow");

        if (selectedUsers.length === 0) {
          this.utils.iAlert('error', 'Information', 'No End Users are selected');
        } else if (!this.utils.isNullOrEmpty(roleId)) {
          this.utils.iAlert('error', 'Information', 'No Role is selected');
        } else if (selectedUsers.length > 0) {
          let memberUpdateList: any[] = [];
          let squaresList: any[] = [];
          let square: Object = {};
          let selectedSquares: any[] = $(this.squaresGrid).jqGrid("getGridParam", "selarrrow");

          for (let i = 0; i < selectedSquares.length; i++) {
            square = {};
            let rowData: any = $(this.squaresGrid).getRowData(selectedSquares[i]);
            let data: any = rowData.squareIdType.split("_");
            square["squareId"] = data[0];
            square["type"] = data[1];

            squaresList.push(square);
          }

          for (let i = 0; i < selectedUsers.length; i++) {
            let userId: string = selectedUsers[i];

            let checked: boolean = $(this.usersGrid).find("#" + userId + " input:checkbox").is(':checked');

            if (checked) {
              let userObj: Object = {};
              userObj["userId"] = userId;
              userObj["appId"] = this.selectedApp;
              userObj["squares"] = {
                "squares": squaresList
              };

              userObj["role"] = {
                "role": [{
                  "roleId": roleId,
                  "name": rolesData.name
                }]
              };

              memberUpdateList.push(userObj);
            }
          }

          this.appsService.squareAssign(memberUpdateList).subscribe(appSqrRes => {
            if (!appSqrRes.success) {
              this.utils.iAlert('error', 'Information', appSqrRes.message);
              return false;
            } else {
              this.onloadAssigning = true;
              let locId: string = "";

              if (this.selectedLocation !== "-1" && !this.utils.isNullOrEmpty(this.selectedLocation)) {
                locId = this.selectedLocation;
              }

              let memberUrl: string = '/app/member/get/' + this.oid + "/" + this.selectedApp + "/" + this.selectedLocation;
              let isShrink: boolean = this.getUserGridShrink();

              $(this.usersGrid).jqGrid('setGridParam', {
                datatype: 'json',
                shrinkToFit: isShrink,
                url: memberUrl
              }).trigger("reloadGrid");

              this.utils.iAlert('success', "", "End users are assigned to role");
            }
          });
        }
      }
    }).navButtonAdd('#users-grid-pager', {
      caption: "Role",
      title: "Un-assign Role from CHECKED users",
      buttonicon: "ui-icon-circle-minus",
      onClickButton: () => {
        let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');
        let rolesData: any = $(this.privateAccessGrid).jqGrid('getRowData', roleId);
        let selectedUsers: any[] = $(this.usersGrid).jqGrid("getGridParam", "selarrrow");
        let roleSquaresList: any[] = [];

        if (selectedUsers.length == 0) {
          this.utils.iAlert('error', 'Information', 'No End Users are selected');
        } else if (this.utils.isNullOrEmpty(roleId)) {
          this.utils.iAlert('error', 'Information', 'No Role is selected');
        } else {

          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Procedure?", "Yes", "No", (r) => {
            if (r["resolved"]) {
              let memberUpdateList: any[] = [];

              if (rolesData.squares) {
                let squares: any[] = !this.utils.isNullOrEmpty(rolesData.squares) ? rolesData.squares.split(',') : [];

                if (squares.length > 0) {
                  for (let i = 0; i < squares.length; i++) {
                    let sqr: Object = {};
                    let data: any[] = squares[i].split("_");
                    sqr["squareId"] = data[0];
                    sqr["type"] = data[1];

                    roleSquaresList.push(sqr);
                  }
                }
              }

              for (let i = 0; i < selectedUsers.length; i++) {
                let userId: string = selectedUsers[i];
                let checked: boolean = $(this.usersGrid).find("#" + userId + " input:checkbox").is(':checked');

                if (checked) {
                  let userData: any = $(this.usersGrid).jqGrid('getRowData', userId);

                  if (userData.squares) {
                    userData.squares = JSON.parse(userData.squares);
                  }

                  if (userData.squares.length > 0) {
                    for (let j = 0; j < roleSquaresList.length; j++) {
                      let rSquare: any = roleSquaresList[j];

                      for (let k = 0; k < userData.squares.length; k++) {
                        let square: any = userData.squares[k];
                        if (!this.utils.isEmptyObject(square) && square.hasOwnProperty("squareId") && square.squareId == rSquare.squareId) {
                          userData.squares.splice(j, 1);
                        }
                      }
                    }
                  }

                  let userObj: object = {};
                  userObj["userId"] = userId;
                  userObj["appId"] = this.selectedApp;
                  userObj["role"] = {
                    "role": []
                  };

                  userObj["squares"] = {
                    "squares": userData.squares
                  };

                  memberUpdateList.push(userObj);
                }
              }

              this.appsService.squareAssign(memberUpdateList).subscribe(sqrAssignRes => {
                if (!sqrAssignRes.success) {
                  this.utils.iAlert('success', "", sqrAssignRes.message);
                  return false;
                } else {
                  this.onloadAssigning = true;
                  let locId: string = "";

                  if (this.selectedLocation !== "-1" && !this.utils.isNullOrEmpty(this.selectedLocation)) {
                    locId = this.selectedLocation;
                  }

                  let memberUrl: string = '/app/member/get/' + this.oid + "/" + $('.apps-access').val() + "/" + locId;
                  let isShrink: boolean = this.getUserGridShrink();

                  $(this.usersGrid).jqGrid('setGridParam', {
                    datatype: 'json',
                    shrinkToFit: isShrink,
                    url: memberUrl
                  }).trigger("reloadGrid");

                  this.utils.iAlert('success', "", "End users are unassigned to selected role");
                }
              });
            }
          });
        }
      }
    }).navButtonAdd('#users-grid-pager', {
      caption: "",
      title: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: () => {
        let selectedUsers: any[] = $(this.usersGrid).jqGrid("getGridParam", "selarrrow");
        // let someUsersNotDeleted: boolean = false;
        // let appsForDelete: string[] = ["5622140512b747843bc8136f", "56d8849474ae9b5201144c92"];

        if (selectedUsers.length > 0) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure you want to delete the user(s)?", "Yes", "No", (r) => {

            if (r["resolved"]) {
              let removeXHR: any[] = [];

              for (let i = 0; i < selectedUsers.length; i++) {
                let userId: string = selectedUsers[i];
                var checked = $(this.usersGrid).find("#" + userId + " input:checkbox").is(':checked');

                if (checked) {
                  let appId: string = this.selectedApp !== "-1" && !this.utils.isNullOrEmpty(this.selectedApp) ? this.selectedApp : "";
                  let xhr: any = this.memberService.appMemberRemove(userId, appId);
                  removeXHR.push(xhr);
                }
              }

              if (removeXHR.length > 0) {
                observableForkJoin(removeXHR).subscribe(dataRes => {
                  let notDeleted: any[] = dataRes.filter(r => {
                    return !r["deleted"];
                  });

                  this.loadUserData(true);

                  if (notDeleted.length > 0) {
                    this.utils.iAlert('error', 'Information', 'Some User(s) not deleted');
                  } else {
                    this.utils.iAlert('success', "", 'User(s) deleted');
                  }
                });
              }
            }
          });
        }
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
    this.clearProfileFields();
    this.formTitle = "Add User";
  };

  resetValidation() {
    this.memberFormSubmitted = false;
    //$('#userForm').bootstrapValidator('resetForm', true);
  };

  assignProfileValues() {
    let currentUserRow: any = $(this.usersGrid).jqGrid('getRowData', this.memberId);

    //var currentUserRow = $('#users-grid').jqGrid("getLocalRow", memberId);
    //$('#addMemberDetail').find('.modal-title').text("Edit User");
    this.formTitle = "Edit User";
    // var profileImage = $('#addMemberDetail').find('.member-profile-image');

    if (!this.utils.isEmptyObject(currentUserRow) && currentUserRow.hasOwnProperty("allFieldsString")) {
      let selectUserData: any = JSON.parse(currentUserRow.allFieldsString);

      if (!this.utils.isEmptyObject("selectUserData") && selectUserData.hasOwnProperty("image") && !this.utils.isNullOrEmpty(selectUserData.image)) {
        this.profileImage["isShow"] = true;
        this.profileImage["src"] = selectUserData.image;

      } else {
        this.profileImage["isShow"] = false;
        this.profileImage["src"] = "";
      }

      //let fieldDatas: any[] = [];
      //let profObject: Object = {};

      for (let i = 0; i < this.profileFields.length; i++) {
        let profField: object = this.profileFields[i];
        let tagName: any = profField["tag"];
        let fieldContents: any[] = [];
        let fieldProfileObj: any[] = this.profileObj[profField["formFieldName"]];

        if (profField["type"] === "check") {
          let checkValue: boolean = this.checkfieldExists(selectUserData, tagName) ? this.utils.convertToBoolean(selectUserData[tagName]) : false;
          fieldContents.push(checkValue);
          fieldProfileObj[0] = checkValue;
          //fieldContents.push([Validators.requiredTrue]);
        } else if (profField["type"] === "date") {
          let dateFieldValue: any = this.checkfieldExists(selectUserData, tagName) ? selectUserData[tagName] : "";
          let fSplittedDate: any[] = !this.utils.isNullOrEmpty(dateFieldValue) ? dateFieldValue.split('/') : [];
          let formattedDate: any = fSplittedDate.length > 0 ? fSplittedDate[2] + "-" + fSplittedDate[0] + "-" + fSplittedDate[1] : "";
          //fieldContents.push(formattedDate);

          fieldProfileObj[0] = formattedDate;

          /* let dateContent: any = this.getRequired(profField);

          if (dateContent.length > 0) {
            fieldContents.push(dateContent);
          } */
        } else if (profField["type"] === "password") {
          let decryptedPassword: any = this.checkfieldExists(selectUserData, "decryptedPassword") ? selectUserData["decryptedPassword"] : "";
          //fieldContents.push(decryptedPassword);

          fieldProfileObj[0] = decryptedPassword;

          /* let passContent: any = this.getRequired(profField);
           passContent.push(Validators.minLength(6));
 
           if (passContent.length > 0) {
             fieldContents.push(passContent);
           } */
        } else {
          let fieldData: any = this.checkfieldExists(selectUserData, tagName) ? selectUserData[tagName] : "";
          //fieldContents.push(fieldData);

          fieldProfileObj[0] = fieldData;

          // let fieldDataContent = this.getRequired(profField);

          /* if (profField["type"] === "text") {
             fieldDataContent.push(Validators.pattern(this.defaultRegex["text"]["pattern"]));
           } else if (profField["type"] === "email") {
             fieldDataContent.push(Validators.email);
           } else if (profField["type"] === "number") {
             fieldDataContent.push(Validators.pattern(this.defaultRegex["number"]["pattern"]));
           } else if (profField["type"] === "custom") {
             if (profField.hasOwnProperty("regex") && !this.utils.isNullOrEmpty(profField["regex"])) {
               fieldDataContent.push(Validators.pattern(profField["regex"]));
             }
           } */

          /* if (fieldDataContent.length > 0) {
             fieldContents.push(fieldDataContent);
           } */
        }

        //profObject[profField["formFieldName"]] = fieldContents;
      }


      this.memberForm = this.formBuilder.group(this.profileObj);
    } else {
      this.clearProfileFields();
    }
  };

  clearProfileFields() {
    if (!this.utils.isEmptyObject(this.profileObj)) {
      for (let fieldKey in this.profileObj) {
        let fieldData: any[] = this.profileObj[fieldKey];

        fieldData[0] = "";
      }

      this.memberForm = this.formBuilder.group(this.profileObj);
    }
  };

  checkfieldExists(obj: object, keyName: any) {

    return !this.utils.isEmptyObject(obj) && obj.hasOwnProperty(keyName) && !this.utils.isNullOrEmpty(obj[keyName]) ? true : false;
  };

  duplicateRole() {
    let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');

    if (this.utils.isNullOrEmpty(roleId) || roleId.length < 12) {
      this.utils.iAlert('error', 'Information', 'No role is selected');
      return false;
    }

    let rolesCurrentRow: any;

    if (roleId.length > 12) {
      rolesCurrentRow = $(this.privateAccessGrid).jqGrid("getLocalRow", roleId);
      let squaresList: any[] = [];

      if (rolesCurrentRow.hasOwnProperty("squares") && rolesCurrentRow.squares.length > 0) {
        for (let i = 0; i < rolesCurrentRow.squares; i++) {
          let currRoleSqr = rolesCurrentRow.squares[i];
          let square: Object = {};
          let data: any[] = currRoleSqr.split("_");
          square["squareId"] = data[0];
          square["type"] = data[1];
          squaresList.push(square);
        }
      }

      let roleObj: Object = {};
      roleObj["name"] = "Copy of " + rolesCurrentRow.name;
      roleObj["appId"] = this.selectedApp;
      roleObj["squares"] = squaresList;

      this.rolesService.saveRole(roleObj).subscribe(res => {
        this.newRoleId = res["_id"];

        $(this.privateAccessGrid).jqGrid('setGridParam', {
          datatype: 'json',
        }).trigger("reloadGrid");

        this.utils.iAlert('success', '', 'Role duplicated');
      });
    };
  };

  get formDetails() { return this.memberForm.controls; }

  createUserForm(memFields: any[]) {
    this.profileFields = [];
    //let profObject: Object = {};

    this.profileObj = {};

    for (let i = 0; i < memFields.length; i++) {
      let currField: Object = {};
      let profField: Object = memFields[i];
      currField = Object.assign({}, profField);

      let fieldName: string = profField.hasOwnProperty("name") && !this.utils.isNullOrEmpty(profField["name"]) ? this.utils.trim(profField["name"].toLowerCase()) : "";
      currField["formFieldName"] = fieldName;

      if (!this.utils.isNullOrEmpty(fieldName)) {
        let fieldContents: any[] = [""];

        if (currField["type"] === "email") {
          let emailContent: any = this.getRequired(currField);

          emailContent.push(Validators.email);

          if (emailContent.length > 0) {
            fieldContents.push(emailContent);
          }

        } else if (currField["type"] === "password") {
          let passContent: any = this.getRequired(currField);
          passContent.push(Validators.minLength(6));

          if (passContent.length > 0) {
            fieldContents.push(passContent);
          }
        } else if (currField["type"] === "check") {
          fieldContents.push([Validators.requiredTrue]);
        } else {
          let fieldData: any = this.getRequired(currField);

          if (currField["type"] === "text") {
            fieldData.push(Validators.pattern(this.defaultRegex["text"]["pattern"]));
          } else if (currField["type"] === "number") {
            fieldData.push(Validators.pattern(this.defaultRegex["number"]["pattern"]));
          } else if (currField["type"] === "custom") {
            if (currField.hasOwnProperty("regex") && !this.utils.isNullOrEmpty(currField["regex"])) {
              fieldData.push(Validators.pattern(currField["regex"]));
            }
          }

          if (fieldData.length > 0) {
            fieldContents.push(fieldData);
          }
        }

        this.profileObj[fieldName] = fieldContents;

        if (currField['type'] === 'text' || currField['type'] === 'password' || currField['type'] === 'email' || currField['type'] === 'select' || currField['type'] === 'date' || currField['type'] === 'check' || currField['type'] === 'custom') {
          this.profileFields.push(currField);
        }
      }
    }

    this.memberForm = this.formBuilder.group(this.profileObj);
  };

  getRequired(field: Object) {

    return field.hasOwnProperty("required") && !this.utils.isNullOrEmpty(field["required"]) && field["required"] ? [Validators.required] : [];
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  saveMember(e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (this.selectedApp === "-1" || this.utils.isNullOrEmpty(this.selectedApp)) {
      this.utils.iAlert('error', 'Information', 'Please Select the App.');
      return false;
    }

    if (this.selectedLocation === "-1" && this.utils.isNullOrEmpty(this.selectedLocation)) {
      this.utils.iAlert('error', 'Information', 'Please Select the Location');
      return false;
    }

    this.memberFormSubmitted = true;

    if (this.memberForm.invalid) {
      return;
    }

    let memFormData: Object = this.memberForm.value;

    if (!this.utils.isEmptyObject(memFormData)) {
      let data: Object = {};
      let currentPassword: string = "";
      let loginIdentifier: any[] = [];
      let emails: any[] = [];

      for (let fieldKey in memFormData) {
        let fieldData: Object = this.profileFields.find(p => p['formFieldName'] === fieldKey);
        let fieldVal: any = memFormData[fieldKey];
        let role: any = fieldData["role"];
        let tag: any = fieldData["tag"];
        let type: any = fieldData["type"];

        if (!this.utils.isNullOrEmpty(role) && role.toLowerCase() == 'login identifier') {
          loginIdentifier.push(tag);
        }

        if (type === "email") {
          emails.push(fieldVal);
        }

        if (type === 'date') {
          data[fieldData["name"]] = "";

          if (!this.utils.isNullOrEmpty(fieldVal)) {
            let patientDOB: any[] = fieldVal.split('-');
            data[fieldData["name"]] = patientDOB[1] + "/" + patientDOB[2] + "/" + patientDOB[0];
          }
        } else if (type === 'check') {
          data[fieldData["name"]] = fieldVal;

        } else if (type === 'number') {
          data[fieldData["name"]] = parseInt(fieldVal);

        } else {
          data[fieldData["name"]] = fieldVal;
        }

        if (fieldData["name"] === "password") {
          currentPassword = fieldVal;
        }
      }

      data["appId"] = this.selectedApp;
      let selectedLocationId: string = this.selectedLocation;

      if (!this.utils.isNullOrEmpty(selectedLocationId) && selectedLocationId !== "-1") {
        data["locationId"] = selectedLocationId
      }

      data["dateCreated"] = (new Date()).toUTCString();
      data["lastUpdatedOn"] = (new Date()).toUTCString();
      data["patient"] = false;
      data["login_identifier"] = loginIdentifier;

      if (!this.utils.isNullOrEmpty(this.memberId) && this.memberId !== "-1") {
        let loginObj: boolean = false;
        let currentUserRow: any = $(this.usersGrid).jqGrid('getRowData', this.memberId);
        let selectUserData: Object = JSON.parse(currentUserRow.allFieldsString);
        let oldPassword: string = selectUserData["decryptedPassword"];

        if (currentPassword !== oldPassword) {
          data["password"] = currentPassword;
          loginObj = true;
        }

        data["login_identifier"] = loginIdentifier;

        this.updateMember(data);
      } else {
        data["password"] = currentPassword;

        this.memberService.saveMember(data).subscribe(saveRes => {
          if (saveRes.message) {
            if (!saveRes.success) {
              this.utils.iAlert('success', '', saveRes.message);
            } else {
              this.savedMemCheck = true;
              this.memberId = saveRes._id;
              this.resetGrid(false);
            }
          } else if (!saveRes.success && saveRes.body) {
            this.utils.iAlert('error', 'Information', saveRes.body);
          } else if (saveRes._id) {
            this.savedMemCheck = true;
            this.memberId = saveRes._id;
            this.resetGrid(false);

            let isShrink: boolean = this.getUserGridShrink();

            $(this.usersGrid).jqGrid('setGridParam', {
              datatype: 'json',
              shrinkToFit: isShrink,
            }).trigger("reloadGrid");
          }
        });
      }
    }
  };

  updateMember(data: Object) {
    this.memberService.updateMember(this.memberId, data).subscribe(updateRes => {
      if (updateRes.message) {
        if (!updateRes.success) {

          this.utils.iAlert('success', '', updateRes.message);
        } else {
          this.savedMemCheck = true;
          // this.lastAddedMember = res._id;
          this.memberId = updateRes._id;
          this.resetGrid(false);
        }
      } else if (!updateRes.success && updateRes.body) {
        this.utils.iAlert('success', '', updateRes.body);
      } else if (updateRes._id) {
        this.savedMemCheck = true;
        //this.lastAddedMember = updateRes._id;
        this.memberId = updateRes._id;
        this.resetGrid(false);
      }
    });
  };

  resetGrid(isLoadUser: boolean) {
    this.onSelectUser = null;
    this.userChk = false;
    this.selectedUserId = "-1";

    let appRolesUrl: string = '/approles/list/' + this.selectedApp;
    let squareUrl: string = '/page/pagesquareslist/' + this.selectedApp;
    // appIdToProcess = $('.apps-access').val();

    $(this.privateAccessGrid).jqGrid('setGridParam', {
      datatype: 'json',
      url: appRolesUrl
    }).trigger("reloadGrid");


    let isReload: boolean = isLoadUser ? false : true;
    this.loadUserData(isReload);

    $(this.squaresGrid).jqGrid('setGridParam', {
      datatype: 'json',
      url: squareUrl
    }).trigger("reloadGrid");
  };

  memberFormOnHide() {
    this.modalService.onHide.subscribe((reslut) => {
      this.memberFormSubmitted = false;
    });
  };

  changeToDate(e: any, type: string, isFocus: boolean) {
    if (type === "date") {
      if (isFocus) {
        e.target.type = "date";
      } else {
        e.target.type = "text";
      }
    }
  };

  selectUserBasedSquares(rowId: string) {
    let memberData: any = $(this.usersGrid).jqGrid('getRowData', rowId);
    let squareTypeIds: any[] = !this.utils.isNullOrEmpty(memberData.squareTypeId) ? memberData.squareTypeId.split(',') : [];
    $(this.squaresGrid).jqGrid('resetSelection');

    for (let i = 0; i < squareTypeIds.length; i++) {
      $(this.squaresGrid).jqGrid('setSelection', squareTypeIds[i]);
    }
  };

  selectUserSquares() {
    let roleId: string = $(this.privateAccessGrid).jqGrid('getGridParam', 'selrow');
    let rolesData: any = $(this.privateAccessGrid).jqGrid('getRowData', roleId);
    $(this.squaresGrid).jqGrid('resetSelection');

    let squares: any[] = rolesData.hasOwnProperty("squares") && !this.utils.isNullOrEmpty(rolesData.squares) ? rolesData.squares.split(',') : [];

    if (squares.length > 0) {
      for (let i = 0; i < squares.length; i++) {
        $(this.squaresGrid).jqGrid('setSelection', squares[i]);
      }
    }
  };

  loadUserData(isReload: boolean) {
    //let locId: string = this.selectedLocation !== "-1" && !this.utils.isNullOrEmpty(this.selectedLocation) ? this.selectedLocation : "";

    this.getUserData().subscribe(memRes => {
      this.memberCount = !this.utils.isNullOrEmpty(memRes) && this.utils.isArray(memRes) && memRes.length > 0 ? memRes.length : 0;

      if (isReload) {
        let isShrink: boolean = this.getUserGridShrink();
        $(this.usersGrid).clearGridData();

        $(this.usersGrid).jqGrid('setGridParam', {
          data: memRes,
          shrinkToFit: isShrink,
          datatype: 'local',
        }).trigger("reloadGrid");
      } else {
        this.loadUsers(memRes);
      }
    });
  };

  userColumns() {
    let userCols: any[] = [{
      name: 'isApproved',
      index: 'isApproved',
      sortable: false,
      hidden: true
    }, {
      name: 'squares',
      index: 'squares',
      sortable: false,
      formatter: function (cellvalue) {
        return JSON.stringify(cellvalue);
      },
      hidden: true
    }, {
      name: 'role',
      index: 'role',
      sortable: false,
      hidden: true
    }, {
      name: 'squareTypeId',
      index: 'squareTypeId',
      sortable: false,
      hidden: true
    }, {
      name: 'memberRoleId',
      index: 'memberRoleId',
      sortable: false,
      hidden: true
    }, {
      name: 'action',
      label: 'Action',
      index: 'action',
      width: 90,
      sortable: false,
      formatter: (cellvalue: any, options: any, rowObject: any) => {
        if (rowObject.hasOwnProperty("isApproved") && !this.utils.isNullOrEmpty(rowObject["isApproved"]) && !rowObject.isApproved) {
          return "<button type='button' value='approve' style='margin-right: 10px;width: 55px;' rowid='" + rowObject._id + "' class='btn-success btn-xs action user-approval-deny'>Approve</button><span title='Denied' style='left: 0px; right: 3px; top: 2px;color: #b90200; font-size: 12px;' class='glyphicon glyphicon-remove' aria-hidden='true'></span>";

        } else if (rowObject.hasOwnProperty("isApproved") && !this.utils.isNullOrEmpty(rowObject["isApproved"]) && rowObject.isApproved) {
          return "<button type='button' value='deny' style='margin-right: 10px;width: 55px;' rowid='" + rowObject._id + "' class='btn-danger btn-xs action user-approval-deny'>Deny</button><span title='Approved' style='left: 2px; right: 3px; top: 2px;color: #36a41e; font-size: 12px;' class='glyphicon glyphicon-ok' aria-hidden='true'></span> ";

        } else {
          return "";
        }
      }
    }, {
      label: 'Email Verification',
      name: 'verified',
      width: 100,
      editable: true,
      formatter: 'select',
      sortable: false,
      edittype: 'select',
      editoptions: {
        value: {
          '0': 'Unverified',
          '1': 'Verified'
        }
      }
    }];

    return userCols;
  };

  doColumnActions() {
    let userApprovalDeny: any = this.document.getElementsByClassName("user-approval-deny");

    if (userApprovalDeny.length > 0) {
      this.removeEventColumnListener(userApprovalDeny, "userApproveDeny");
      this.addEventColumnListener(userApprovalDeny, "userApproveDeny");
    }
  };

  removeEventColumnListener(domObjs: any, fnName: any) {
    if (domObjs.length > 0) {
      for (let i = 0; i < domObjs.length; i++) {
        domObjs[i].removeEventListener('click', this[fnName]);
      }
    };
  }

  addEventColumnListener(domObjs: any, fnName: any) {
    if (domObjs.length > 0) {
      for (let i = 0; i < domObjs.length; i++) {
        domObjs[i].addEventListener('click', this[fnName]);
      }
    };
  };

  userApproval(userId: string) {
    var objApproval = {
      isApproved: true,
      appId: this.selectedApp
    };

    if (!this.utils.isNullOrEmpty(this.selectedApp) && this.selectedApp !== "-1") {
      this.memberUpdate(userId, objApproval).subscribe((res) => {
        if (res.message) {
          if (!res.success) {
            this.utils.iAlert('success', '', res.message);
          } else {
            this.loadUserData(true);
            this.utils.iAlert('success', '', 'Approved');
          }
        } else if (!res.success && res.body) {
          this.utils.iAlert('error', 'Information', res.body);
        } else if (res._id) {
          this.loadUserData(true);
          this.utils.iAlert('success', '', 'Approved');
        }
      });
    }

  };

  userDeny(userId: string, domObj: any) {
    let objDeny: object = {
      isApproved: false,
      appId: this.selectedApp
    };

    if (!this.utils.isNullOrEmpty(this.selectedApp) && this.selectedApp !== "-1") {
      this.memberUpdate(userId, objDeny).subscribe((res) => {
        if (res.message) {
          if (!res.success) {
            this.utils.iAlert('success', '', res.message);
          } else {
            $(domObj).removeClass("user-deny").addClass("user-approval");
            $(domObj).val("approve");
            $(domObj).text("Approve");

            let isShrink: boolean = this.getUserGridShrink();

            $(this.usersGrid).setGridParam({
              datatype: 'json',
              shrinkToFit: isShrink,
            }).trigger('reloadGrid');

            this.utils.iAlert('success', '', 'Denied');
          }
        } else if (!res.success && res.body) {
          this.utils.iAlert('error', 'Information', res.body);
        } else if (res._id) {
          $(domObj).removeClass("user-deny").addClass("user-approval");
          $(domObj).val("approve");
          $(domObj).text("Approve");

          this.utils.iAlert('success', '', 'Denied');
        }
      });
    }
  };

  memberUpdate(id: string, obj: object) {
    let memberUpdate: any = this.memberService.updateMember(id, obj);

    return memberUpdate;
  };

  userApproveDeny(e: any) {
    let userId: string = e.srcElement.getAttribute("rowid");
    let currVal: string = e.srcElement.getAttribute("value");
    let currTarget: any = e.target;

    if (currVal === "approve") {
      //$(currTarget).removeClass("user-approval").addClass("user-deny");

      if ($(currTarget).hasClass("btn-success")) {
        $(currTarget).removeClass("btn-success");
      }

      if (!$(currTarget).hasClass("btn-danger")) {
        $(currTarget).first().addClass("btn-danger")
      }

      $(currTarget).text("Deny");
      $(currTarget).val("deny");
      //this.userApproval(userId);
    } else {

      $(currTarget).removeClass("user-deny").addClass("user-approval");
      $(currTarget).val("approve");
      $(currTarget).text("Approve");

      //this.userDeny(userId, currTarget);
    }
  };

  importCsv(e: any) {
    e.preventDefault();

    let fields: any = [];
    let profObj: object = {};
    let isValidate: boolean = false;

    for (let i = 0; i < this.profileFields.length; i++) {
      let currProfileField: any = this.profileFields[i];
      let name: string = currProfileField["name"];

      if (name.toLowerCase() == 'email') {
        if (isValidate == false) {
          isValidate = true;
        }
      }

      if (currProfileField.role == "login identifier" || currProfileField.required) {
        name = "*" + name;
      }

      profObj[name] = "";
    }

    profObj["Request email verification (Yes/No)"] = "";
    profObj["End user is pre-approved (True/False)"] = "";

    fields.push(profObj);

    if (isValidate) {
      this.generalService.getExcelData(this.selectedApp, fields).subscribe(res => {
        if (!res.success) {
          if (res.message) {

            this.utils.iAlert('error', 'Information', res.message);
          } else {
            this.utils.iAlert('error', 'Information', 'Unable to download file. Please try Again!!!');
          }
          return false;
        } else {
          this.document.location.href = "/files/" + res.fileName;
          return true;
        }
      })
    } else {
      this.utils.iAlert('error', 'Information', 'Email field is mandatory to import the users');
    }
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
