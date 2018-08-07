import { Component, Input, ViewChild, ElementRef, OnInit, Inject, HostListener, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { CommonService } from '../../services/common.service';
import { DomainPageLib, DomainTools } from '../../helpers/domainPageLib';
//import { CMS } from '../../helpers/common';
import { Organization } from '../../models/organization';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { DOCUMENT } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  outputs: ["isSpinner"],
  providers: [DomainPageLib, DomainTools]
})

export class HeaderComponent implements OnInit {
  constructor(private headerService: HeaderService,
    private cms: CommonService,
    private pageLib: DomainPageLib,
    private el: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private mScrollbarService: MalihuScrollbarService,
    @Inject(DOCUMENT) private document: any,
    public utils: Utils
  ) {
    //this.cms = cms;
  }

  userName: string = "";
  accessList: Object = {};
  domainName: string = "ili";
  dmDatas: any[] = [];
  rAccess: Object = {};
  userObj: any[] = [];
  allPages: any = {};
  orgs: Organization[] = [];
  selectedOrgId: string = "-1";
  selectedOrg: Organization;
  selectedPage: Object = {};
  selectedPageTitle: string = "";
  isSpinner = new EventEmitter<any>();

  menusDatas: Object = {
    "left": [],
    "right": []
  };

  orgChangeSet(orgId?: string) {
    if (!this.utils.isNullOrEmpty(orgId)) {
      this.selectedOrgId = orgId;
      Cookie.set('oid', orgId);
    } else {
      var currOid = Cookie.get('oid');
      this.selectedOrgId = !this.utils.isNullOrEmpty(currOid) ? currOid : "-1";
    }

    if (this.selectedOrgId !== "-1") {
      var orgSelected = this.orgs.filter(org => {
        return org["_id"] === this.selectedOrgId;
      });

      if (orgSelected.length > 0) {
        this.selectedOrg = orgSelected[0];
      }
    }

    this.getAssignedPages();
  };

  pageList() {
    if (this.dmDatas.length > 0) {
      var keys = Object.keys(this.dmDatas[0].menus);
      for (let ky of keys) {
        var menuDatas = Object.keys(this.dmDatas[0].menus[ky]);

        for (var i = 0; i < menuDatas.length; i++) {
          if (menuDatas[i].toLowerCase() != "tools") {
            var menuNames = Object.keys(this.dmDatas[0].menus[ky][menuDatas[i]]);

            for (var j = 0; j < menuNames.length; j++) {
              var menu = this.dmDatas[0].menus[ky][menuDatas[i]][menuNames[j]];
              if (menu instanceof String || typeof (menu) === "string") {
                var cMname: string = String(menu);
                this.allPages[cMname] = this.pageLib[cMname];
              } else if (menu instanceof Array) {
                for (let mnName of menu) {
                  var cMname: string = String(mnName);
                  this.allPages[cMname] = this.pageLib[cMname];
                }
              }
            }
          }
        }
      }
    }
  };

  createMenus() {
    var currentUrl = window.location.href;
    currentUrl = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    var hasPage = false;
    var pageName = this.utils.getParameterByName('page');
    var queryString = "";
    var self = this;

    if ((pageName != 'undefined' && pageName != null && pageName != "")) {
      var redirectPage = "";

      if (pageName == "member") {
        redirectPage = "End_User_Roles";
      } else if (pageName == "square") {
        redirectPage = "In_app_Membership";
      }

      if (this.accessList.hasOwnProperty(redirectPage)) {
        this.loadPage(this.accessList[redirectPage]);

        hasPage = true;
      }
    }

    for (var prop in this.accessList) {
      if (currentUrl === this.accessList[prop] || currentUrl === 'account.html') {
        hasPage = true;
      }
    }

    if (!hasPage) {
      var loadResult = false;
      $.each(this.dmDatas[0].intialLoad, (indx, pgName) => {
        if (self.accessList.hasOwnProperty(pgName) && !loadResult) {
          loadResult = true;
          self.loadPage(self.accessList[pgName]);
        }
      });

      if (!loadResult) {
        var accessKeys = Object.keys(this.accessList);
        this.processAccessList(accessKeys);
        var firstPage = Object.keys(this.accessList)[0] !== "Event_Triggers" ? Object.keys(this.accessList)[0] : Object.keys(this.accessList)[1];

        if (firstPage) {
          self.loadPage(this.accessList[firstPage]);
        }
      }
    }

    this.loadMenu();
  };

  processAccessList(accessKeys: any) {
    $.each(accessKeys, (index, key) => {
      var accessValue = this.accessList[key];

      if (!accessValue) {
        delete this.accessList[key];
      }
    });
  };

  loadMenu() {
    var pages = {};
    var domainDatas = this.dmDatas[0];
    var pgLib = this.pageLib;
    var menuKeys = Object.keys(domainDatas.menus);
    var bindMenu = this.bindMenu;
    var self = this;

    $.each(menuKeys, (indx, ky) => {
      pages = {};
      var menuDatas = Object.keys(domainDatas.menus[ky]);

      for (var i = 0; i < menuDatas.length; i++) {
        if (menuDatas[i].toLowerCase() != "main") {
          pages[menuDatas[i]] = {};
        }

        var menuNames = Object.keys(domainDatas.menus[ky][menuDatas[i]]);

        for (var j = 0; j < menuNames.length; j++) {
          var menuNm = domainDatas.menus[ky][menuDatas[i]][menuNames[j]];
          var cMname: string = String(menuNm);
          if ((self.accessList && self.accessList[cMname]) || menuDatas[i].toLowerCase() == "tools" || menuNm instanceof Array) {
            if (menuNm instanceof String || typeof (menuNm) === "string") {
              var cMname: string = String(menuNm);
              if (menuDatas[i].toLowerCase() != "main") {

                pages[menuDatas[i]][menuNames[j]] = menuDatas[i].toLowerCase() != "tools" ? self.accessList[cMname] : cMname;
              } else {
                pages[menuNames[j]] = menuDatas[i].toLowerCase() != "tools" ? self.accessList[cMname] : cMname;
              }
            } else if (menuNm instanceof Array) {
              $.each(menuNm, (indx, mnName) => {
                if (mnName == "Basic_Stream" || mnName == "Advanced_Stream") {
                  var cMname: string = String(mnName);
                  if (self.accessList && self.accessList[cMname]) {
                    if (menuDatas[i].toLowerCase() != "main") {
                      pages[menuDatas[i]][menuNames[j]] = self.accessList[cMname];
                    } else {
                      pages[menuNames[j]] = self.accessList[cMname];
                    }
                  }
                }
              });
            }
          }
        }
      }

      if (ky == "left") {
        bindMenu(pages, "left", self);
      }

      if (ky == "right") {
        bindMenu(pages, "right", self);
      }
    });


    if (this.utils.isNullOrEmpty(this.selectedPageTitle)) {
      var pageUrl = Cookie.get('pageName');

      if (!this.utils.isNullOrEmpty(pageUrl)) {
        this.setPageTitle(pageUrl);
      }
    }
  };

  setPageTitle(currPageUrl: string) {
    if (!this.utils.isNullOrEmpty(currPageUrl)) {
      var menusObjLeft = !this.utils.isEmptyObject(this.menusDatas) && this.menusDatas.hasOwnProperty("left") && this.utils.isArray(this.menusDatas["left"]) ? this.menusDatas["left"] : [];
      var menusObjRight = !this.utils.isEmptyObject(this.menusDatas) && this.menusDatas.hasOwnProperty("right") && this.utils.isArray(this.menusDatas["right"]) ? this.menusDatas["right"] : [];
      var menuObj = menusObjLeft.concat(menusObjRight);
      var pgLib = this.pageLib;
      var pageKeys = Object.keys(this.pageLib);

      for (let i = 0; i < pageKeys.length; i++) {
        var pgTitle = "";
        var pageUrl = pgLib[pageKeys[i]];

        if (pageUrl === currPageUrl) {
          pgTitle = this.utils.replaceAll("_", " " ,pageKeys[i]);
        }

        if (!this.utils.isNullOrEmpty(pgTitle)) {
          for (let j = 0; j < menuObj.length; j++) {
            var currMenuObj = menuObj[j];
            var grpName = !this.utils.isEmptyObject(currMenuObj) && currMenuObj.hasOwnProperty("text") && !this.utils.isNullOrEmpty(currMenuObj["text"]) ? currMenuObj["text"] : "";


            if (!this.utils.isNullOrEmpty(grpName) && currMenuObj.hasOwnProperty("subPages")) {
              if (this.utils.isArray(currMenuObj["subPages"]) && currMenuObj["subPages"].length > 0) {
                for (let k = 0; k < currMenuObj["subPages"].length; k++) {
                  var currSubPg = currMenuObj["subPages"][k];

                  if (!this.utils.isEmptyObject(currSubPg) && currSubPg.hasOwnProperty("url") && !this.utils.isNullOrEmpty(currSubPg["url"])) {
                    if (currSubPg["url"] === currPageUrl) {

                      this.selectedPageTitle = grpName + " - " + pgTitle;
                      break;
                    }
                  }
                }
              }

              if (!this.utils.isNullOrEmpty(this.selectedPageTitle)) {
                break;
              }
            }
          }
        }

        if (!this.utils.isNullOrEmpty(this.selectedPageTitle)) {
          break;
        }
      }
    }
  };

  loadPage(page: any, isMenu?: boolean) {
    let token = Cookie.get('token');
    let oid = Cookie.get('oid');
    var currPageName = "";
    this.selectedPageTitle = "";
    this.destroyLibrarires();

    if (isMenu) {
      currPageName = typeof page === "string" ? page : typeof page === "object" && page.hasOwnProperty("url") ? page["url"] : "";
    } else {
      var pageName = Cookie.get('pageName');
      currPageName = !this.utils.isNullOrEmpty(pageName) ? pageName : typeof page === "string" ? page : typeof page === "object" && page.hasOwnProperty("url") ? page["url"] : "";
    }

    Cookie.set('pageName', currPageName);

    if (!this.utils.isNullOrEmpty(token) && !this.utils.isNullOrEmpty(oid)) {
      this.showLoadSpinner();
      var pageAddress = currPageName;
      this.selectedPage = pageAddress;
      var currPage = "." + pageAddress;
      let link = [currPage];
      var currDate = Date.parse(new Date().toString());
      this.cms.destroyScroll();
      this.router.navigate(link, { queryParams: { "_dt": currDate }, relativeTo: this.route });
    }

    this.setPageTitle(currPageName);
  };

  userLogout() {
    this.cms.destroyScroll();
    this.destroyLibrarires();

    Cookie.deleteAll();
    setTimeout(() => {
      this.router.navigate(['/login'], { relativeTo: this.route });
    });
  };

  accountPage() {
    this.cms.destroyScroll();
    this.destroyLibrarires();
    this.router.navigate(['./account'], { relativeTo: this.route });
  };

  bindMenu(pages: any, ulBind: any, self: any) {
    var menuDatas = [];

    for (var page in pages) {
      var data = {};
      data["id"] = page.replace("$", "_") + "_li";
      var subPages = pages[page];
      var find = '_';
      var rep = new RegExp(find, 'g');
      var text = page.replace(rep, ' ');

      if (typeof subPages == 'object' && !$.isEmptyObject(subPages)) {
        data["type"] = "multi";
        text = text + ' ';
        data["text"] = self.utils.replaceAll("$", "-", text);
        data["aId"] = self.utils.replaceAll("$", "_", page);
      } else if (typeof subPages !== "undefined" && !$.isEmptyObject(subPages)) {
        data["type"] = "single";
        data["text"] = self.utils.replaceAll("$", "-", text);
        data["aId"] = self.utils.replaceAll("$", "_", page);
      }

      var sPgs = [];

      for (var spage in subPages) {
        var sPg = {};
        sPg["id"] = spage.replace("$", "_") + "_li";
        sPg["url"] = $.trim(subPages[spage]) == '' ? '' : subPages[spage];
        var stext = spage.replace(rep, ' ');
        stext = self.utils.replaceAll("$", "-", stext);
        sPg["name"] = stext;
        sPg["siteMap"] = text + "- " + stext;
        sPg["aId"] = self.utils.replaceAll("$", "_", spage);
        sPgs.push(sPg);
      }

      if (typeof subPages !== "undefined" && !$.isEmptyObject(subPages)) {
        data["subPages"] = sPgs;
        menuDatas.push(data);
      }
    }

    self.menusDatas[ulBind] = menuDatas;
  };

  getAssignedPages() {
    this.userName = this.userObj[0] && this.userObj[0].hasOwnProperty("name") ? this.userObj[0].name : "";
    var accessByOrg = this.userObj[0].assignedOrgAccess && !$.isEmptyObject(this.selectedOrg) && this.selectedOrg.hasOwnProperty("_id") && this.userObj[0].assignedOrgAccess[this.selectedOrg["_id"]] ? this.userObj[0].assignedOrgAccess[this.selectedOrg["_id"]] : [];
    var accesses = this.userObj[0].assignedAccess;

    if (accessByOrg.length > 0) {
      accesses = accessByOrg;
    }

    accesses = this.engineAccesses(accesses);
    var raccess = this.rAccess;

    if (!$.isEmptyObject(raccess) && raccess["name"].toLowerCase() == 'trial') {
      var expiryDate = new Date(this.userObj[0].createdon);
      var current = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);

      if (current > expiryDate) {
        alert("Your trial period has ended.  Please contact us to activate your interactive services");
        this.userLogout();
      }
    }

    if (this.orgs.length == 0) {
      if (!$.isEmptyObject(raccess) && (raccess["name"].toLowerCase() != 'agent' && raccess["name"].toLowerCase() != 'acc manager' && raccess["name"].toLowerCase() != 'sales' && raccess["name"].toLowerCase() != 'sales/account')) {
        alert("You are not assigned to any organization.");
        this.userLogout();
        return;
      }
    }

    if (accesses && accesses.length == 0) {
      if (!$.isEmptyObject(raccess) && (raccess["name"].toLowerCase() != 'agent' && raccess["name"].toLowerCase() != 'acc manager' && raccess["name"].toLowerCase() != 'sales' && raccess["name"].toLowerCase() != 'sales/account')) {
        alert("You do not have rights to login.");
        this.userLogout();

        return;
      } else {
        if (!$.isEmptyObject(raccess) && (raccess["name"].toLowerCase() == 'sales' || raccess["name"].toLowerCase() == 'sales/account')) {
          this.accessList["Registration"] = this.allPages["Registration"];
        }
      }
    }

    if (raccess["name"].toLowerCase() !== 'iliadmin') {
      for (var i = 0; i < accesses.length; i++) {
        var access = accesses[i];

        if (!$.isEmptyObject(raccess)) {
          if (access.name.toLowerCase() == 'organizations' && (raccess["name"].toLowerCase() == 'agent' || raccess["name"].toLowerCase() == 'acc manager' || raccess["name"].toLowerCase() == 'sales/account')) {
            continue;
          }

          if (access.name.toLowerCase() == 'users' && (raccess["name"].toLowerCase() == 'acc manager' || raccess["name"].toLowerCase() == 'sales/account')) {
            continue;
          }
        }

        if (!$.isEmptyObject(raccess) && raccess["name"].toLowerCase() == 'sales') {
          this.accessList["Registration"] = this.allPages["Registration"];
          break;
        }

        var find = ' ';
        var rep = new RegExp(find, 'g');
        var text = access.name.replace(rep, '_');
        text = text.replace("$", '-');

        this.accessList[text] = this.allPages[text];
      }
    } else {
      if (!$.isEmptyObject(raccess) && (raccess["name"].toLowerCase() == 'sales' || raccess["name"].toLowerCase() == 'sales/account')) {
        this.accessList["Registration"] = this.allPages["Registration"];
      } else {
        this.accessList = this.allPages;
      }
    }

    this.createMenus();
  };

  engineAccesses(accesses: any) {
    var orgObj = !$.isEmptyObject(this.selectedOrg) ? this.selectedOrg : {};
    var currentEngines = [];

    if (!$.isEmptyObject(orgObj) && orgObj.hasOwnProperty("engines") && orgObj["engines"].length > 0) {
      for (var i = 0; i < orgObj["engines"].length; i++) {
        currentEngines.push(orgObj["engines"][i].name);
      }

      accesses = this.processEngines(currentEngines, accesses);
    } else {
      accesses = this.processEngines([], accesses);
    }

    return accesses;
  };

  destroyLibrarires() {
    let jQGridDom: any = document.getElementsByClassName('ui-jqdialog');

    if (jQGridDom.length > 0) {
      $(jQGridDom).remove();
    }
  };

  processEngines(currentEngines: any, accesses: any) {
    var indexes = [];
    var newAccesses = [];

    if (accesses && accesses.length > 0) {
      accesses.forEach((currentPage, index) => {
        if (currentEngines.indexOf("Triggering") == -1 && currentPage.name == "Event Triggers") {
          indexes.push(index);
        }

        if (currentEngines.indexOf("Push Notifications") == -1 && (currentPage.name == "Notifications" || currentPage.name == "Push Notifications")) {
          indexes.push(index);
        }

        if (currentEngines.indexOf("Roles and Permissions") == -1 && currentPage.name == "End User Roles") {
          indexes.push(index);
        }

        if (currentEngines.indexOf("In app Membership") == -1 && currentPage.name == "In app Membership") {
          indexes.push(index);
        }

        if (currentEngines.indexOf("SMART") == -1 && currentPage.name == "SMART") {
          indexes.push(index);
        }

        if (currentEngines.indexOf("Basic Stream") == -1 && currentPage.name == "Basic Stream") {
          indexes.push(index);
        }

        if (currentEngines.indexOf("Advanced Stream") == -1 && currentPage.name == "Advanced Stream") {
          indexes.push(index);
        }
      });

      for (var i = 0; i < accesses.length; i++) {
        if (indexes.indexOf(i) == -1) {
          newAccesses.push(accesses[i]);
        }
      }

      return newAccesses;
    }
  };

  domainDatas() {
    this.headerService.getDomainMenus(this.domainName).subscribe(domainDatas => {
      this.dmDatas = domainDatas[0];
      this.userObj = domainDatas[1] && domainDatas[1].length > 0 ? domainDatas[1] : [];
      this.rAccess = !$.isEmptyObject(domainDatas[2]) && domainDatas[2].hasOwnProperty("role") ? domainDatas[2]["role"] : {};
      this.selectedPageTitle = "";

      if (this.userObj.length > 0) {
        if (this.userObj[0].hasOwnProperty('organizations')) {
          this.orgs = this.userObj[0]['organizations'];
          //this.cms.organizations = this.userObj[0]['organizations'];
          //this.selectedOrg = this.orgs[0];
          this.orgChangeSet();
        }
      }

      //let cms = new CMS();
      this.cms.setCms("organizations", this.orgs);
      this.cms.setCms("rAccess", this.rAccess);

      if (this.userObj && this.userObj.length > 0) {
        this.pageList();
        this.getAssignedPages();
        //this.loadMenu();
      }
    });
  };

  showLoadSpinner() {
    this.isSpinner.emit({ "status": true });
  };

  hideLoadSpinner() {
    this.isSpinner.emit({ "status": false });
  };

  ngOnInit() {
    this.domainName = "ili";
    this.cms.destroyScroll();
    this.domainDatas();
  };
};

