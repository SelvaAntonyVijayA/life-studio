import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
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
  constructor(private headerService: HeaderService, private pageLib: DomainPageLib, private cms: Common) {

  }

  domainName: string = "ili";
  dmDatas: any[] = [];
  allPages: any = {};
  orgs: Organization[] = [];
  defaultOrg = -1;
  selectedOrg: Organization;
  
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
    if (this.dmDatas[0].length > 0) {
      var pages = {};
      var menuKeys = Object.keys(this.dmDatas[0][0].menus);

      for (let ky of menuKeys) {
        var menuDatas = Object.keys(this.dmDatas[0][0].menus[ky]);
        for (var i = 0; i < menuDatas.length; i++) {
          if (menuDatas[i].toLowerCase() != "main") {
            pages[menuDatas[i]] = {};
          }

          var menuNames = Object.keys(this.dmDatas[0][0].menus[ky][menuDatas[i]]);

          for (var j = 0; j < menuNames.length; j++) {
            var menuNm = this.dmDatas[0][0].menus[ky][menuDatas[i]][menuNames[j]];

            /*if ((cms.accessList && cms.accessList[menuNm]) || menuDatas[i].toLowerCase() == "tools" || menuNm instanceof Array) {
            }*/
          }
        }
      }

    }
  };

  getAssignedPageRefresh() {
    var accesses = this.dmDatas[1][0].assignedAccess;
    accesses = this.engineAccesses(accesses);
  };


  engineAccesses(accesses: any) {
    for (let ky of accesses) {
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

      if (domainDatas[1].length > 0) {
        if (domainDatas[1][0].hasOwnProperty('organizations')) {
          this.orgs = domainDatas[1][0]['organizations'];
          this.selectedOrg = this.orgs[0];
        }
      }

      if (domainDatas[1] && domainDatas[1].length > 0) {
        //this.pageList();
        //this.getAssignedPageRefresh();
      }

      //this.cms.rAcesss = $.isEmptyObject(domainDatas[2]) && domainDatas[2].hasOwnProperty("role") ? domainDatas[2]["role"] : {};
    });
  };

  ngOnInit() {
    this.domainName = "ili";
    this.domainDatas();
  };
};

