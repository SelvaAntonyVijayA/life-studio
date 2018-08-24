import { Component, OnInit, Inject, ElementRef, ViewEncapsulation } from '@angular/core';
import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
//import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DOCUMENT } from '@angular/common';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { UserAccessService } from '../../services/user-access.service';
//import { ScriptService } from '../../services/script.service';
import { PageService } from '../../services/page.service';
import { RolesService } from '../../services/roles.service';
import { LivestreamService } from '../../services/livestream.service';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../services/email.service';

declare var $: any;
//declare var jquery: any;
//declare var jqGrid: any;
//declare var navGrid: any;
//declare var jAlert: any;

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.css'],
  providers: [UserAccessService, PageService, RolesService, LivestreamService, UserService],
  encapsulation: ViewEncapsulation.None
})
export class UserAccessComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    //private mScrollbarService: MalihuScrollbarService,
    private loaderShared: LoaderSharedService,
    // private e1: ElementRef,
    //private renderer: Renderer2,
    public utils: Utils,
    @Inject(DOCUMENT) private document: any,
    //private userAccessService: UserAccessService,
    private pageService: PageService,
    private rolesService: RolesService,
    private livestreamService: LivestreamService,
    private userService: UserService,
    private emailService: EmailService
  ) { }

  emptyMembers: any = $("<div><div style='position:relative;'><span style='color:#fff;font-size:15px'>0 records found</span></div></div>");
  emptyStreams: any = $("<div><div style='position:relative;'><span style='color:#fff;font-size:15px'>0 records found</span></div></div>");
  membersGridPager: ElementRef<any>;
  membersGrid: ElementRef<any>;
  streamGridPager: ElementRef<any>;
  streamGrid: ElementRef<any>;

  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  rAccess: Object = {};
  appList: any[] = [];
  selectedApp: string = "-1";
  allOrgRoles: any[] = [];
  orgRoles: Object = {};
  memGridEdit: any;
  savedUserId: string = "-1";
  mappedList: any[] = [];

  setScrollList() {
    // this.mScrollbarService.initScrollbar("#tiles-list-show", this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      // this.cms["appDatas"]["scrollList"].push("#tiles-list-show", "#rule_group_main", "#main-tile_squares");
    } else {
      // this.cms["appDatas"]["scrollList"] = ["#tiles-list-show", "#rule_group_main", "#main-tile_squares"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    //this.cms.destroyScroll(["#tiles-list-show"]);
  };

  /* Getting unique Id */
  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };

  trackByTileId(index: number, obj: any): any {
    return obj["tileId"];
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  trackByBlockId(index: number, obj: any): any {
    return obj["blockId"];
  };

  getApps() {
    let apps = this.pageService.getApps(this.oid);

    return apps;
  };

  getRoles() {
    let roles = this.rolesService.getRoles();

    return roles;
  };

  getMappedStreams(userId: string) {
    let mappedStreams = this.livestreamService.getMappedStreams(userId);

    return mappedStreams;
  };

  setrAccess() {
    this.rAccess = this.cms["appDatas"].hasOwnProperty("rAccess") ? this.cms["appDatas"]["rAccess"] : {};
  };

  userAccessDataReset() {
    this.userAccessReset(false);
    this.oid = "";
    this.rAccess = {};
    this.appList = [];
    this.allOrgRoles = [];
    this.orgRoles = {};
    this.memGridEdit = "";

    $.jgrid.gridUnload("#members-grid");
    $.jgrid.gridUnload("#stream-grid");

    this.membersGridPager = this.document.getElementById("members-grid-pager");
    this.membersGrid = this.document.getElementById("members-grid");
    this.streamGridPager = this.document.getElementById("stream-grid-pager");
    this.streamGrid = this.document.getElementById("stream-grid");
  };

  userAccessReset(isAppChange: boolean) {
    if (!isAppChange) {
      this.savedUserId = "-1";
    }

    this.mappedList = [];
  };

  appChange(appId: string) {
    this.selectedApp = appId;
    this.resetStreamGrid();
    $(this.streamGrid).jqGrid('resetSelection');
    this.userAccessReset(true);
  };

  getUserAccessDatas() {
    let apps = this.getApps();
    let roles = this.getRoles();

    return observableForkJoin([apps, roles]);
  };

  loadUserAccess() {
    this.getUserAccessDatas().subscribe(userAccessDatas => {
      this.setApps(userAccessDatas[0]);
      this.setRoles(userAccessDatas[1]);
    });
  };

  setApps(apps: any[]) {
    if (this.utils.isArray(apps) && apps.length > 0) {
      this.appList = apps;
      this.selectedApp = this.appList[0]["_id"]
    }
  };

  setRoles(rolesData: any[]) {
    if (!this.utils.isNullOrEmpty(rolesData) && rolesData.length > 0) {
      this.allOrgRoles = rolesData;
      let roles: Object = this.rAccess;

      if (!this.utils.isEmptyObject(roles) && roles.hasOwnProperty("level") && this.utils.isArray(roles["level"]) && roles["level"].length > 0) {
        for (let i = 0; i < roles["level"].length; i++) {
          let roleId: string = roles["level"][i];

          var idx = this.allOrgRoles.map(d => { return d['_id']; }).indexOf(roleId);

          if (idx !== -1) {
            let dataRole: Object = this.allOrgRoles[idx];
            this.orgRoles[dataRole["_id"]] = dataRole["name"];
          }
        }
      }
    }

    this.loadMembers();
    this.loadLiveStreams();
  };

  loadMembers() {
    $(this.membersGrid).jqGrid({
      url: '/user/list/' + this.oid,
      datatype: "json",
      colModel: [{
        name: '_id',
        index: '_id',
        sortable: false,
        hidden: true,
        key: true
      }, {
        label: 'First Name',
        name: 'name',
        width: 145,
        editable: true,
        sortable: true,
        editrules: {
          required: true
        }
      }, {
        label: 'Last Name',
        name: 'lastName',
        width: 115,
        editable: true,
        sortable: true,
        editrules: {
          required: true
        }
      }, {
        label: 'Email',
        name: 'email',
        width: 210,
        editable: true,
        sortable: true,
        editrules: {
          required: true,
          email: true
        }
      }, {
        label: 'Password',
        name: 'password',
        width: 80,
        edittype: 'password',
        formatter: this.userCustomPassword,
        editable: true,
        sortable: false,
        editrules: {
          required: false,
        }
      }, {
        label: 'Role',
        name: 'role_id',
        index: 'role_id',
        sortable: false,
        width: 100,
        formatter: 'select',
        editable: true,
        edittype: 'select',
        editrules: {
          required: true
        },
        editoptions: {
          value: this.orgRoles,
          style: "width: 91px"
        },
      }, {
        label: 'createdby',
        name: 'createdby',
        sortable: false,
        hidden: true
      }, {
        name: 'assignedAccess',
        index: 'assignedAccess',
        sortable: false,
        hidden: true
      }],
      sortname: 'name',
      sortorder: 'asc',
      loadonce: true,
      width: 675,
      height: 600,
      multiselect: false,
      multiboxonly: true,
      emptyrecords: 'No Users',
      viewrecords: false,
      rowNum: 1000,
      pager: "#members-grid-pager",
      beforeSelectRow: (rowid, e) => {

      },
      loadComplete: () => {
        $(this.membersGridPager).insertAfter('#gview_members-grid > .ui-jqgrid-titlebar');

        let memGridPagerCenter: any = this.document.getElementById("members-grid-pager_center");
        let memGridAdd: any = this.document.getElementById("members-grid_iladd");
        let memGridSave: any = this.document.getElementById("members-grid_ilsave");
        let memGridCancel: any = this.document.getElementById("members-grid_ilcancel");
        this.memGridEdit = this.document.getElementById("members-grid_iledit");

        $(memGridPagerCenter).hide();
        $(memGridAdd).attr("title", "Add Member");
        $(memGridSave).attr("title", "Save");
        $(memGridCancel).attr("title", "Cancel Edit");
        $(this.memGridEdit).attr("title", "Edit Member");

        if (this.membersGrid["p"]["reccount"] === 0) {
          this.emptyMembers.show();
        } else {
          this.emptyMembers.hide();
        }

        if (this.savedUserId !== "-1") {
          $(this.membersGrid).jqGrid('setSelection', this.savedUserId);
          //var currentUserRow = $('#users-grid').jqGrid("getLocalRow", this.savedUserId);
          this.savedUserId = "-1";
        }
      },
      ondblClickRow: (id) => {
        $(this.memGridEdit).click();
      },
      onSelectRow: (rowId) => {
        let streamGrid: any = $(this.streamGrid);
        this.mappedList = [];

        if (rowId.length > 12) {
          this.streamsMapped(rowId, streamGrid);
        } else {
          streamGrid.jqGrid('resetSelection');
        }
      }
    });

    this.emptyMembers.insertAfter($(this.membersGrid).parent());

    $(this.membersGrid).navGrid('#members-grid-pager', {
      edit: false,
      add: false,
      del: false,
      search: true,
      cancel: false,
      refresh: false,
      save: false
    }).navButtonAdd('#members-grid-pager', {
      caption: "",
      id: "members-grid_ildelete",
      title: "Delete",
      buttonicon: "ui-icon-trash",
      onClickButton: () => {
        this.deleteUser();
      }
    });

    $(this.membersGrid).inlineNav('#members-grid-pager', {
      edit: true,
      add: true,
      del: false,
      cancel: true,
      search: true,
      save: true,
      refresh: false,
      editParams: this.memberSaveUpdate,
      addParams: {
        position: "first",
        keys: true,
        addRowParams: this.memberSaveUpdate
      }
    });
  };

  userCustomPassword(cellvalue: any[], options: any, rowObject: any) {
    var password = cellvalue && cellvalue.length > 1 ? "****" : "";
    return password;
  };

  memberSaveUpdate: any = {
    keys: true,
    url: 'clientArray',
    oneditfunc: (rowid: string) => {
      this.emptyMembers.hide();
      this.checkUserDataProcess(rowid);
    },
    aftersavefunc: (rowid, response, options) => {
      if (options._id.length > 12) {
        this.updateUser(options);
      } else {
        this.saveUser(options);
      }
    }
  };

  checkUserDataProcess(rowid: string) {
    if (!this.utils.isNullOrEmpty(rowid)) {
      let rowEmail: any = this.document.getElementById(rowid + "_email");
      let rowPassword: any = this.document.getElementById(rowid + "_password");

      if (rowid.length > 12) {
        $(rowEmail).prop("disabled", true);
        $(rowPassword).prop("disabled", true);
      } else {
        $(rowEmail).prop("disabled", false);
        $(rowPassword).prop("disabled", false);
      }
    }
  };

  saveUser(options) {
    let userObj: Object = {};
    userObj["name"] = options.name;
    userObj["lastName"] = options.lastName;
    userObj["email"] = options.email;
    userObj["password"] = typeof options.password != "undefined" && options.password != "" && options.password != null ? options.password : "iLi@123";
    userObj["organizationId"] = [this.oid];
    userObj["isAdmin"] = false;
    userObj["role_id"] = options.role_id;

    //userObj.createdby = $.cookie('uid');
    userObj["createdon"] = (new Date()).toUTCString();
    userObj["updatedon"] = (new Date()).toUTCString();

    this.userService.save(userObj).subscribe(res => {
      this.utils.iAlert('success', '', 'User Created');
      this.savedUserId = res._id;
      this.assignUserRights(userObj["role_id"]);
      this.emailSend(userObj["email"], res._id, userObj["password"], userObj["name"]);
      this.memberReload();
      userObj["_id"] = res._id;
      userObj["pin"] = res.pin;
      this.saveAppMember(userObj);
    });
  };

  saveAppMember(userObj: Object) {
    let app: Object = {};
    let users: Object = {};
    let appObj: Object = this.appList.find(a => a['_id'] === this.selectedApp);

    app["user_id"] = userObj["_id"];
    app["org_id"] = userObj["organizationId"][0];
    app["app_id"] = this.selectedApp;

    users["email"] = userObj["email"];
    users["password"] = userObj["password"];
    users["type"] = "ili";
    users["firstName"] = userObj["name"];
    users["lastName"] = userObj["lastName"];
    users["appId"] = this.selectedApp;
    //users["login"] = login;
    users["user_pin"] = userObj["pin"];
    users["app_pin"] = parseInt(appObj["pin"]);
    users["verified"] = "1";
    users["isApproved"] = true;

    let obj: Object = {};
    obj["apps"] = app;
    obj["members"] = users;

    this.userService.saveUserApp(obj).subscribe(userAppRes => {
    });
  };

  assignUserRights(roleId: string) {
    this.livestreamService.streamUserRightMapping(this.oid, this.savedUserId, roleId).subscribe(() => {

    });
  };

  emailSend = function (email: string, id: string, password: string, firstName: string) {
    let data: Object = {};
    //var mainTitle = $('title').text().trim();

    data["to"] = email;
    data["subject"] = "User Created for" + firstName;
    data["memberId"] = id;

    let messageContent: string = "<span> UserId : " + email + " </span><br/><br/>";
    messageContent += "<span> Password : " + password + "</span>";
    data["html"] = messageContent;

    this.emailService.send(data).then(() => {
    });
  };

  updateUser(options: any) {
    let userObj: Object = {};
    userObj["name"] = options.name;
    userObj["lastName"] = options.lastName;
    userObj["updatedon"] = (new Date()).toUTCString();

    this.userService.update(options["_id"], userObj).subscribe(res => {
      this.utils.iAlert('success', '', 'User Updated');
      this.savedUserId = options["_id"];
      this.memberReload();
    });
  };

  memberReload() {
    $(this.membersGrid).jqGrid('setGridParam', {
      datatype: 'json',
      page: 1
    }).trigger("reloadGrid");
  };

  deleteUser() {
    let userId: string = $(this.membersGrid).jqGrid('getGridParam', 'selrow');
    var currentUserRow = $(this.membersGrid).jqGrid("getLocalRow", userId);
    this.checkCreatedUser(currentUserRow.createdby).subscribe(userChkRes => {
      let isUser: boolean = userChkRes["result"];

      if (isUser || this.utils.isNullOrEmpty(currentUserRow.createdby) || this.utils.isNullOrEmpty(currentUserRow.createdby)) {
        this.utils.iAlert('error', 'Information', 'Unable to delete this member');
        return false;
      }

      if (this.utils.isNullOrEmpty(userId)) {
        this.utils.iAlert('error', 'Information', 'No member is selected');
        return false;
      }

      if (userId.length < 12) {
        $(this.memGridEdit).click();
        return false;
      }

      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure you want to delete this member?", "Yes", "No", (r) => {
        if (r["resolved"]) {
          this.userService.remove({ "_id": userId }).subscribe(delRes => {
            this.utils.iAlert('success', '', 'Member Deleted');
            this.savedUserId = "-1";
            this.memberReload();
          });
        }
      });
    });
  };

  checkCreatedUser(id: string) {
    let userCheck = this.userService.createdUserChk({ "createdby": id });

    return userCheck;
  };

  loadLiveStreams() {
    var appId = this.selectedApp;
    var postUrl = '/livestream/list/' + this.oid + '/' + appId;

    $(this.streamGrid).jqGrid({
      url: postUrl,
      editurl: 'clientArray',
      datatype: "json",
      colModel: [{
        name: '_id',
        index: '_id',
        hidden: true,
        sortable: false,
        key: true
      }, {
        label: 'Streams',
        sortable: true,
        name: 'name',
        width: 150
      }, {
        name: 'assignedUserIds',
        index: 'assignedUserIds',
        hidden: true,
        sortable: false,
      }],
      sortname: 'name',
      sortorder: 'asc',
      loadonce: true,
      width: 500,
      height: 599,
      rowNum: 350,
      emptyrecords: 'No Live Streams',
      hidegrid: false,
      viewrecords: false,
      multiselect: true,
      pager: "#stream-grid-pager",
      onSelectRow: (rowid) => {
      },
      loadComplete: () => {
        let streamPagerLeft: any = this.document.getElementById("stream-grid-pager_left");
        $(streamPagerLeft).css("width", "100%");

        this.memberExistsCheck();

        if (this.streamGrid["p"]["reccount"] === 0) {
          this.emptyStreams.show();
        } else {
          this.emptyStreams.hide();
        }
      }
    });

    this.emptyStreams.insertAfter($(this.streamGrid).parent());

    $(this.streamGrid).jqGrid('navGrid', "#stream-grid-pager", {
      edit: false,
      add: false,
      del: false,
      cancel: false,
      save: false,
      refresh: false,
      view: false,
      search: false
    }).navButtonAdd('#stream-grid-pager', {
      caption: "Assign",
      title: "Assign",
      id: "stream-grid_ilAssign",
      buttonicon: "ui-icon-circle-plus",
      position: "first",
      width: '100px',
      onClickButton: () => {
        this.updateStreamMapping('push');
      }
    }).navButtonAdd('#stream-grid-pager', {
      caption: "Un assign",
      width: '100px',
      title: "Un assign streams from user",
      buttonicon: "ui-icon-circle-minus",
      onClickButton: () => {
        this.updateStreamMapping('pull');
      }
    });
  };

  updateStreamMapping(operation: string) {
    let selectedStreams: any = $(this.streamGrid).jqGrid("getGridParam", "selarrrow");
    let appId: string = this.selectedApp;
    let streamObj: Object = {};
    streamObj["userId"] = $(this.membersGrid).jqGrid('getGridParam', 'selrow');
    streamObj["streams"] = selectedStreams;
    streamObj["operation"] = operation;

    if (selectedStreams.length == 0) {
      this.utils.iAlert('error', 'Information', 'Please select an stream to assign');
      return false;
    }

    if (this.utils.isNullOrEmpty(streamObj["userId"]) || this.utils.isNullOrEmpty(appId)) {
      this.utils.iAlert('error', 'Information', 'Please select an user to assign');
      return false;
    }

    this.livestreamService.liveStreamMapping(streamObj).subscribe(strmRes => {
      if (!this.utils.isEmptyObject(strmRes) && strmRes.hasOwnProperty("status") && strmRes["status"] === "success") {
        this.utils.iAlert('success', '', 'Stream mapped');
      } else {
        this.utils.iAlert('error', 'Information', "Streams not mapped");
      }
    });
  };

  resetStreamGrid() {
    var appId = this.selectedApp;
    var streamPostUrl = '/livestream/list/' + this.oid + '/' + appId;

    $(this.streamGrid).jqGrid('setGridParam', {
      datatype: 'json',
      url: streamPostUrl
    }).trigger("reloadGrid");
  };

  memberExistsCheck() {
    let userId: string = $(this.membersGrid).jqGrid('getGridParam', 'selrow');

    if (!this.utils.isNullOrEmpty(userId)) {
      let streamGrid: any = $(this.streamGrid);
      this.streamsMapped(userId, streamGrid);
    }
  };

  streamsMapped(rowId: string, streamGrid: any) {
    if (!this.utils.isNullOrEmpty(rowId) && rowId.length > 12) {
      this.getMappedStreams(rowId)
        .subscribe(mStrms => {
          if (this.utils.isArray(mStrms) && mStrms.length > 0) {
            this.mappedList = mStrms;
          }

          streamGrid.jqGrid('resetSelection');

          if (this.mappedList.length > 0) {
            for (let i = 0; i < this.mappedList.length; i++) {
              let stream: Object = this.mappedList[i];
              streamGrid.jqGrid('setSelection', stream["_id"]);
            }
          }
        });
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.loaderShared.showSpinner(false);
        this.userAccessDataReset();
        this.oid = Cookie.get('oid');
        this.setrAccess();
        //this.setScrollList();
        this.loadUserAccess();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    //this.destroyScroll();
  };
}
