import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { DomainPageLib } from '../../helpers/DomainPageLib';
import { Common } from '../../helpers/Common';
import { Organization } from '../../models/organization';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [DomainPageLib, Common]
})
export class HeaderComponent implements OnInit {
  constructor(private headerService: HeaderService, private pageLib: DomainPageLib, private cms: Common, private el: ElementRef, private route: ActivatedRoute, private router: Router) {
    this.cms = cms;
  }

  domainName: string = "ili";
  dmDatas: any[] = [];
  allPages: any = {};
  orgs: Organization[] = [];
  defaultOrg = -1;
  selectedOrg: Organization;
  selectedPage: Object = {};
  menusDatas: Object = {
    "left": [],
    "right": []
  };

  orgChange(sOrg: any) {
    this.selectedOrg = sOrg;
  }

  createMenus() {

  }

  pageList() {
    if (this.dmDatas[0].length > 0) {
      var keys = Object.keys(this.dmDatas[0][0].menus);
      for (let ky of keys) {
        var menuDatas = Object.keys(this.dmDatas[0][0].menus[ky]);

        for (var i = 0; i < menuDatas.length; i++) {
          if (menuDatas[i].toLowerCase() != "tools") {
            var menuNames = Object.keys(this.dmDatas[0][0].menus[ky][menuDatas[i]]);

            for (var j = 0; j < menuNames.length; j++) {
              var menu = this.dmDatas[0][0].menus[ky][menuDatas[i]][menuNames[j]];
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

  loadMenu() {
    var pages = {};
    var domainDatas = this.dmDatas[0][0];
    var pgLib = this.pageLib;
    var menuKeys = Object.keys(domainDatas.menus);
    var bindMenu = this.bindMenu;
    var self = this;
    $.each(menuKeys, function (indx, ky) {
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
          if ((pgLib && pgLib[cMname]) || menuDatas[i].toLowerCase() == "tools" || menuNm instanceof Array) {
            if (menuNm instanceof String || typeof (menuNm) === "string") {
              var cMname: string = String(menuNm);
              if (menuDatas[i].toLowerCase() != "main") {

                pages[menuDatas[i]][menuNames[j]] = menuDatas[i].toLowerCase() != "tools" ? pgLib[cMname] : cMname;
              } else {
                pages[menuNames[j]] = menuDatas[i].toLowerCase() != "tools" ? pgLib[cMname] : cMname;
              }
            } else if (menuNm instanceof Array) {
              $.each(menuNm, function (indx, mnName) {
                if (mnName == "Basic_Stream" || mnName == "Advanced_Stream") {
                  var cMname: string = String(menuNm);
                  if (pgLib && pgLib[cMname]) {
                    if (menuDatas[i].toLowerCase() != "main") {
                      pages[menuDatas[i]][menuNames[j]] = pgLib[cMname];
                    } else {
                      pages[menuNames[j]] = pgLib[cMname];
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
  };

  loadPage(selected: any) {
    this.selectedPage = selected;

    this.router.navigate(['./widgets'], { relativeTo: this.route });
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

      if (typeof subPages == 'object') {
        data["type"] = "multi";
        text = text + ' ';
        data["text"] = text.replace("$", "-");
        data["aId"] = page.replace("$", "_");
      } else {
        data["type"] = "single";
        data["text"] = text.replace("$", "-");
        data["aId"] = page.replace("$", "_");
      }

      var sPgs = [];

      for (var spage in subPages) {
        var sPg = {};
        sPg["id"] = spage.replace("$", "_") + "_li";
        sPg["url"] = $.trim(subPages[spage]) == '' ? '' : subPages[spage];
        var stext = spage.replace(rep, ' ');
        stext = stext.replace("$", "-");
        sPg["name"] = stext;
        sPg["siteMap"] = text + "- " + stext;
        sPg["aId"] = spage.replace("$", "_");
        sPgs.push(sPg);
      }

      data["subPages"] = sPgs;
      menuDatas.push(data);
    }

    self.menusDatas[ulBind] = menuDatas;
  };

  getAssignedPageRefresh() {
    var accesses = this.dmDatas[1][0].assignedAccess;
    accesses = this.engineAccesses(accesses);
    var raccess = this.cms.rAcesss;

    if (accesses && accesses.length == 0) {
      if (!$.isEmptyObject(raccess) && (raccess.name.toLowerCase() != 'agent' && raccess.name.toLowerCase() != 'acc manager' && raccess.name.toLowerCase() != 'sales' && raccess.name.toLowerCase() != 'sales/account')) {
        alert("You do not have rights to login.");
        //userLogout();

        return;
      } else {
        if (!$.isEmptyObject(raccess) && (raccess.name.toLowerCase() == 'sales' || raccess.name.toLowerCase() == 'sales/account')) {
          this.cms.accessList["Registration"] = this.allPages["Registration"];
        }
      }
    }

    if (raccess.name.toLowerCase() !== 'iliadmin') {
      for (var i = 0; i < accesses.length; i++) {
        var access = accesses[i];

        if (!$.isEmptyObject(raccess)) {
          if (access.name.toLowerCase() == 'organizations' && (raccess.name.toLowerCase() == 'agent' || raccess.name.toLowerCase() == 'acc manager' || raccess.name.toLowerCase() == 'sales/account')) {
            continue;
          }

          if (access.name.toLowerCase() == 'users' && (raccess.name.toLowerCase() == 'acc manager' || raccess.name.toLowerCase() == 'sales/account')) {
            continue;
          }
        }

        if (!$.isEmptyObject(raccess) && raccess.name.toLowerCase() == 'sales') {
          this.cms.accessList["Registration"] = this.allPages["Registration"];
          break;
        }

        var find = ' ';
        var rep = new RegExp(find, 'g');
        var text = access.name.replace(rep, '_');
        text = text.replace("$", '-');

        this.cms.accessList[text] = this.allPages[text];
      }
    } else {
      if (!$.isEmptyObject(raccess) && (raccess.name.toLowerCase() == 'sales' || raccess.name.toLowerCase() == 'sales/account')) {
        this.cms.accessList["Registration"] = this.allPages["Registration"];
      } else {
        this.cms.accessList = this.allPages;
      }
    }
  };

  engineAccesses(accesses: any) {
    var orgObj = !$.isEmptyObject(this.selectedOrg) ? this.selectedOrg : this.orgs[0];
    var currentEngines = [];

    if (orgObj && orgObj.engines != undefined && orgObj.engines != "") {
      for (var i = 0; i < orgObj.engines.length; i++) {
        currentEngines.push(orgObj.engines[i].name);
      }

      accesses = this.processEngines(currentEngines, accesses);
    } else {
      accesses = this.processEngines([], accesses);
    }

    return accesses;
  };

  processEngines(currentEngines: any, accesses: any) {
    var indexes = [];
    var newAccesses = [];

    if (accesses && accesses.length > 0) {
      accesses.forEach(function (currentPage, index) {
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

  headerPart() {
    if (this.dmDatas[0].length > 0) {

    }
  };

  accountPage() {

  };

  domainDatas = function () {
    this.headerService.getDomainMenus(this.domainName).subscribe(domainDatas => {
      this.dmDatas = domainDatas;
      this.cms.rAcesss = !$.isEmptyObject(domainDatas[2]) && domainDatas[2].hasOwnProperty("role") ? domainDatas[2]["role"] : {};

      if (domainDatas[1].length > 0) {
        if (domainDatas[1][0].hasOwnProperty('organizations')) {
          this.orgs = domainDatas[1][0]['organizations'];
          this.cms.organizations = domainDatas[1][0]['organizations'];
          //this.selectedOrg = this.orgs[0];
        }
      }

      if (domainDatas[1] && domainDatas[1].length > 0) {
        this.pageList();
        this.loadMenu();
      }
    });
  };

  ngOnInit() {
    this.domainName = "ili";
    this.domainDatas();
  };
};

