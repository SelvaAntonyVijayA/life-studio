import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Inject, Renderer2, ViewChild, EventEmitter, AfterViewInit, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { OrganizationsService } from '../../services/organizations.service';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { LanguageService } from '../../services/language.service';
import { EnginesService } from '../../services/engines.service';
import { LocationService } from '../../services/location.service';
import { IntegrationService } from '../../services/integration.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [LanguageService, LocationService, LanguageService, IntegrationService]
})
export class OrganizationsComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private orgService: OrganizationsService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    private loaderShared: LoaderSharedService
  ) {
  }

  private orgChangeDetect: any;
  @ViewChild('orgGrid') orgGrid: jqxGridComponent;
  @ViewChild('addOrg') addOrg: jqxWindowComponent;
  @ViewChild('orgForm') orgForm: NgForm;

  rowIndex: number;
  isOrgGrid: boolean = false;
  isEngineGrid: boolean = false;
  isAppGrid: boolean = false;
  orgId: string;
  type: string;
  org: object = { type: "", name: '', type_id: '', packageId: "" };
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;
  dataAdapter: any;
  source: any;
  organizationTypes: any;
  packages: any;
  packageSource: any;
  typeSource: any;
  packageAdaptor: any;
  typeAdaptor: any;
  datafields: any;
  engines: Array<object> = [];
  widgetIds: Array<string> = [];
  appId: string = "";
  locationId: string = "";
  integrationId: string = "";
  appIds: Array<string> = [];
  fields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' }
  ];

  ngAfterViewInit(): void {

  };

  snorenderer = (row: number, column: any, value: string): string => {
    let id = parseInt(value) + 1;

    return '<span style="margin-left: 4px; margin-top: 9px; float: left;">' + id + '</span>';
  };

  columns: any[] =
    [
      {
        text: 'SNo.', dataField: '', columntype: 'number', width: 50, editable: false,
        sortable: false, cellsalign: 'left', align: 'center', cellsrenderer: this.snorenderer
      },
      {
        text: '_id', hidden: true, datafield: '_id', sortable: false
      },
      {
        text: 'Name', datafield: 'name', width: 195, columntype: 'textbox', sortable: true,
        editable: true, cellsalign: 'left', align: 'center'
      },
      {
        text: 'Type', width: 70, datafield: 'type', sortable: true, cellsalign: 'left',
        align: 'center',

      },
      {
        text: 'Package', datafield: 'package', sortable: true, cellsalign: 'left', align: 'center',
        width: 70,
      },
      {
        text: 'publishing', datafield: 'publishing', hidden: true, cellsalign: 'left',
        align: 'center', sortable: false
      },
      {
        text: 'engines', datafield: 'engines', hidden: true, cellsalign: 'left', align: 'center',
        sortable: false
      }
    ];

  ready = (): void => {
  };

  orgRendered(): void {
  };

  renderToolbar = (toolBar: any): void => {
    let theme = jqx.theme;

    let toTheme = (className: string): string => {
      if (theme == '') return className;
      return className + ' ' + className + '-' + theme;
    }

    // appends buttons to the status bar.
    let container = document.createElement('div');
    let fragment = document.createDocumentFragment();

    container.style.cssText = 'overflow: hidden; position: hidden; height: "100%"; width: "100%"'

    let createButtons = (name: string, cssClass: string): any => {
      this[name] = document.createElement('div');
      this[name].style.cssText = 'cursor: pointer; padding: 3px; margin: 2px; float: left; border: none'

      let iconDiv = document.createElement('div');
      iconDiv.style.cssText = 'margin: 4px; width: 16px; height: 16px;'
      iconDiv.className = cssClass;

      this[name].appendChild(iconDiv);
      return this[name];
    }

    let buttons = [
      createButtons('addButton', toTheme('jqx-icon-plus')),
      createButtons('deleteButton', toTheme('jqx-icon-delete')),
    ];

    for (let i = 0; i < buttons.length; i++) {
      fragment.appendChild(buttons[i]);
    }

    container.appendChild(fragment);

    if (toolBar && toolBar.length > 0) {
      toolBar[0].appendChild(container);
    }

    let addButtonOptions: jqwidgets.ButtonOptions =
      {
        height: 25, width: 25
      }
    let otherButtonsOptions: jqwidgets.ButtonOptions =
      {
        disabled: true, height: 25, width: 25
      }

    this.myAddButton = jqwidgets.createInstance(buttons[0], 'jqxButton', addButtonOptions);
    this.myDeleteButton = jqwidgets.createInstance(buttons[1], 'jqxButton', otherButtonsOptions);

    let addTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Add'
      }

    let deleteTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Delete'
      }

    let myAddToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[0], 'jqxTooltip', addTooltopOptions);
    let myDeleteToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[1], 'jqxTooltip', deleteTooltopOptions);

    this.myAddButton.addEventHandler('click', (event: any) => {
      if (!this.myAddButton.disabled) {
        this.orgId = "";
        this.org = { name: '', packageId: '', type_id: '' };
        this.addOrg.setTitle("Add Organization");
        this.addOrg.position({ x: 85, y: 100 });
        this.addOrg.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Organization?", "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              let datarow = this.orgGrid.getrowdata(this.rowIndex);

              this.deleteOrganization(datarow["_id"], (res) => {
                if (res) {
                  this.orgId = "";
                  this.utils.iAlert('success', '', 'Organization deleted successfully');
                  this.orgGrid.source(this.dataAdapter);
                  this.updateButtons('delete');
                  this.addOrg.close();
                }
              });
            }
          })
        } else {
          this.utils.iAlert('error', 'Error', 'Please select the organization!!!');
        }
      }
    });
  };

  orgGridOnRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    let data = event.args.row;
    this.assignDataToObject(data);
    this.isOrgGrid = true;
    this.updateButtons('Select');
  };

  assignDataToObject(data: object) {
    this.orgId = data["_id"];
    this.type = data["type"];
    this.engines = data["engines"];
    this.org = { name: data["name"] };

    if (!this.utils.isNullOrEmpty(data["packageId"])) {
      this.org["packageId"] = data["packageId"];
    } else {
      this.org["packageId"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["type_id"])) {
      this.org["type_id"] = data["type_id"];
    } else {
      this.org["type_id"] = "";
    }
  };

  orgGridOnRowUnselect(event: any): void {
    var index = event.args.rowindex;
  };

  orgDoubleClick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;
    var datarow = this.orgGrid.getrowdata(this.rowIndex);
    this.assignDataToObject(datarow);
    this.isOrgGrid = true;
    this.updateButtons('Edit');
    this.addOrg.setTitle("Update Organization");
    this.addOrg.position({ x: 85, y: 100 });
    this.addOrg.open();
  };

  onBindingComplete(event: any): void {
    let orgDatas = this.orgGrid.getrows();
  };

  onEndAppLoad(appObj: any): void {
    this.appIds = appObj["ids"];
    this.isEngineGrid = true;
  };

  onEngineAssignDone(engines: any): void {
    this.engines = engines;
    this.orgGrid.source(this.dataAdapter);
  };

  onIntegrationWidgetDone(widgetIds: any): void {
    this.widgetIds = widgetIds;
  };

  onSelectApp(appObj: any) {
    this.appIds = appObj["ids"];
    this.appId = appObj["_id"];
    this.isAppGrid = true;
  }

  onSelectLocation(obj: any) {
    this.locationId = obj["_id"];
  }

  onSelectIntegration(obj: any) {
    this.integrationId = obj["_id"];
    this.widgetIds = obj["widgetIds"];
  }

  updateButtons(action: string): void {
    switch (action) {
      case 'Select':
        this.myAddButton.setOptions({ disabled: false });
        this.myDeleteButton.setOptions({ disabled: false });
        break;
      case 'Unselect':
        this.myAddButton.setOptions({ disabled: false });
        this.myDeleteButton.setOptions({ disabled: true });
        break;
      case 'Edit':
        this.myAddButton.setOptions({ disabled: true });
        this.myDeleteButton.setOptions({ disabled: true });
        break;
      case 'End Edit':
        this.myAddButton.setOptions({ disabled: false });
        this.myDeleteButton.setOptions({ disabled: false });
        break;
    }
  };

  getOrganizationTypes() {
    this.orgService.organizationTypeList()
      .then(orgTypes => {
        this.organizationTypes = orgTypes;
        this.organizationTypes.unshift({ _id: "", name: "Select type" })
      });
  };

  getPackages() {
    this.orgService.getPackages()
      .then(packages => {
        this.packages = packages;
        this.packages.unshift({ _id: "", name: "Select package" })
      });
  };

  getOrgObject(orgObj: object) {
    let obj = {};

    obj["name"] = orgObj["name"];
    obj["type_id"] = orgObj["type_id"];
    obj["packageId"] = orgObj["packageId"];

    return obj;
  };

  saveOrganization(id: any, orgObj: object, cb?: any) {
    let obj = this.getOrgObject(orgObj);
    let type = "";

    if (!this.utils.isNullOrEmpty(orgObj["type"])) {
      type = orgObj["type"];
    }

    if (id.length > 12) {
      this.orgService.updateOrganization(id, obj)
        .then(res => {
          if (res) {
            cb(res)
          }
        });

    } else {
      this.orgService.saveOrganization(obj, type)
        .then(res => {
          if (res) {
            cb(res)
          }
        });
    }
  };

  deleteOrganization(id: any, cb?: any) {
    this.orgService.deleteOrganization(id)
      .then(res => {
        if (res) {
          cb(true);
        }
      });
  };

  addOpen() {

  };

  addClose() {
    this.org = { name: '', packageId: '', type_id: '' };
    this.updateButtons('End Edit');
  };

  onSubmit() {
    let obj = this.org;
    let typeObj = _.findWhere(this.organizationTypes, { _id: obj["type_id"] });
    obj["type"] = typeObj["name"];
    this.type = typeObj["name"];

    this.saveOrganization(this.orgId, obj, (res) => {
      if (res) {

        if (this.orgId.length > 12) {
          this.utils.iAlert('success', '', 'Organization updated successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Organization saved successfully!!!');
        }

        this.orgId = res._id;
        this.orgGrid.source(this.dataAdapter);
        this.addOrg.close();
      }
    });
  };

  onFormReset() {
    this.orgForm.resetForm();
    this.org = { name: '', packageId: '', type_id: '' };
  };

  pageLoad() {
    this.packageSource =
      {
        datatype: 'json',
        datafields: this.fields,
        url: '/package/list',
        async: false
      };

    this.typeSource =
      {
        datatype: 'json',
        datafields: this.fields,
        url: '/organizationtype/list',
        async: false
      };

    if (!this.packageAdaptor) {
      this.packageAdaptor = new jqx.dataAdapter(this.packageSource, {
        autoBind: true,
        beforeLoadComplete: (records: any[]): any[] => {
          let pck = new Array();

          for (let i = 0; i < records.length; i++) {
            let pack = records[i];
            pack.packageName = pack.name;
            pack.packageId = pack._id;

            pck.push(pack);
          }

          return pck;
        }
      });

      this.packages = this.packageAdaptor.records;
      this.packages.unshift({ _id: "", name: "Select package" });
    }

    if (!this.typeAdaptor) {
      this.typeAdaptor = new jqx.dataAdapter(this.typeSource, {
        autoBind: true,
        beforeLoadComplete: (records: any[]): any[] => {
          let data = new Array();

          for (let i = 0; i < records.length; i++) {
            let typeObj = records[i];
            typeObj.typeName = typeObj.name;
            typeObj.type_id = typeObj._id;

            data.push(typeObj);
          }

          return data;
        }
      });

      this.organizationTypes = this.typeAdaptor.records;
      this.organizationTypes.unshift({ _id: "", name: "Select type" });
    }

    this.datafields = [
      { name: '_id', type: 'string' },
      { name: 'type_id', type: 'string' },
      { name: 'packageId', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'type', value: 'type_id', values: { source: this.typeAdaptor.records, value: 'type_id', name: 'typeName' } },
      { name: 'package', value: 'packageId', values: { source: this.packageAdaptor.records, value: 'packageId', name: 'packageName' } },
      { name: 'engines', type: 'string' },
      { name: 'publishing', type: 'boolean' },
    ];

    this.source = {
      datatype: "json",
      id: '_id',
      url: "/organization/list",
      datafields: this.datafields
    };

    if (!this.dataAdapter) {
      this.orgGrid.source(this.source);
    } else {
      this.orgGrid.clearselection();
      this.orgGrid.source(this.dataAdapter);
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.pageLoad();
        this.loaderShared.showSpinner(false);
      }
    });
  };

  ngOnChanges(cHObj: any) {
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
