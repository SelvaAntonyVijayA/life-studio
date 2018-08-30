import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Inject, Renderer2, ViewChild, EventEmitter, AfterViewInit, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { OrganizationsService } from '../../services/organizations.service';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxInputComponent } from '../../grid/jqwidgets-ts/angular_jqxinput';
import { jqxDropDownListComponent } from '../../grid/jqwidgets-ts/angular_jqxdropdownlist';
import { jqxComboBoxComponent } from '../../grid/jqwidgets-ts/angular_jqxcombobox';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { LanguageService } from '../../services/language.service';
import { EnginesService } from '../../services/engines.service';
import { LocationService } from '../../services/location.service';
import { IntegrationService } from '../../services/integration.service';
import { LivestreamService } from '../../services/livestream.service';

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
  org: any = { type: "", name: '', type_id: '', packageId: "" };
  gridAddButton: jqwidgets.jqxButton;
  gridDeleteButton: jqwidgets.jqxButton;
  searchDropdown: jqwidgets.jqxDropDownList;
  searchInput: jqwidgets.jqxInput;
  organizationTypes: any;
  packages: any;
  engines: Array<object> = [];
  languages: Array<string> = [];
  widgetIds: Array<string> = [];
  appId: string = "";
  appName: string = "";
  locationId: string = "";
  integrationId: string = "";
  appIds: Array<string> = [];
  isChat: boolean = false;
  isAdvancedStream: boolean = false;
  isLoadedGrid: boolean = false;
  dropDownSource: Object[] = [{ name: 'Name', id: "name" }, { name: 'Type', id: "type" }, { name: 'Package', id: "package" }];
  fields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' }
  ];

  packageSource = {
    datatype: 'json',
    datafields: this.fields,
    url: '/package/list',
    async: false
  };

  typeSource = {
    datatype: 'json',
    datafields: this.fields,
    url: '/organizationtype/list',
    async: false
  };

  packageAdaptor = new jqx.dataAdapter(this.packageSource, {
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

  typeAdaptor = new jqx.dataAdapter(this.typeSource, {
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

  datafields = [
    { name: '_id', type: 'string' },
    { name: 'type_id', type: 'string' },
    { name: 'packageId', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'type', value: 'type_id', values: { source: this.typeAdaptor.records, value: 'type_id', name: 'typeName' } },
    { name: 'package', value: 'packageId', values: { source: this.packageAdaptor.records, value: 'packageId', name: 'packageName' } },
    { name: 'engines', type: 'string' },
    { name: 'publishing', type: 'boolean' },
  ];

  source = {
    datatype: "json",
    id: '_id',
    url: "/organization/list",
    datafields: this.datafields
  };

  orgAdaptor = new jqx.dataAdapter(this.source);

  ngAfterViewInit(): void {
  };

  resetGrid() {
    this.engines = [];
    this.languages = [];
    this.widgetIds = [];
    this.appId = "";
    this.appName = "";
    this.locationId = "";
    this.integrationId = "";
    this.appIds = [];
    this.isChat = false;
    this.isAdvancedStream = false;
  }

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

  orgRendered(e: any): void {
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

    let createControls = (name: string, id: string): any => {
      this[name] = document.createElement('div');
      this[name].style.cssText = 'cursor: pointer; margin-top: 5px; float: left;'

      let iconDiv = document.createElement('div');
      iconDiv.id = id;
      iconDiv.style.cssText = 'margin: 4px; width: 16px; height: 16px;'

      this[name].appendChild(iconDiv);

      return this[name];
    }

    let createInput = (name: string, id: string): any => {
      this[name] = document.createElement('input');
      this[name].id = id;
      this[name].style.cssText = 'margin-left:10px; padding-left: 5px; margin-top: 5px; float: left;'

      return this[name];
    }

    let createLabel = (name: string, text: string): any => {

      this[name] = document.createElement('div');
      this[name].style.cssText = 'cursor: pointer; margin-right:5px;  margin-top: 11px; float: left;'

      let sp = document.createElement('span');
      sp.textContent = text;

      this[name].appendChild(sp);

      return this[name];
    }

    let buttons = [
      createButtons('addButton', toTheme('jqx-icon-plus')),
      createButtons('deleteButton', toTheme('jqx-icon-delete')),
      createLabel('searchlabel', 'Look in'),
      createControls('search', 'drpSearch'),
      createInput('inputsearch', 'inputSearch')
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

    let drpoptions: jqwidgets.DropDownListOptions =
    {
      source: this.dropDownSource,
      displayMember: "name",
      valueMember: "id",
      dropDownHeight: "80",
      selectedIndex: "0",
      placeHolder: "Look in",
      width: 80,
      height: 23
    }

    let inputOptions: jqwidgets.InputOptions =
    {
      placeHolder: 'Search...', height: 25, width: 160
    }

    this.gridAddButton = jqwidgets.createInstance(buttons[0], 'jqxButton', addButtonOptions);
    this.gridDeleteButton = jqwidgets.createInstance(buttons[1], 'jqxButton', otherButtonsOptions);
    this.searchDropdown = jqwidgets.createInstance(buttons[3], "jqxDropDownList", drpoptions);
    this.searchInput = jqwidgets.createInstance(buttons[4], "jqxInput", inputOptions)
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

    this.searchDropdown.addEventHandler('change', (event) => {
      let args = event.args;

      if (args) {
        let label = args.item.value;

        this.applyFilter(this.searchInput.val());
      }
    });

    this.searchInput.addEventHandler('input', (event) => {
      let args = event.args;
      this.orgGrid.clearfilters();

      if (event.target.value.length >= 2) {
        this.applyFilter(this.searchInput.val());
      }
    });

    this.gridAddButton.addEventHandler('click', (event: any) => {
      if (!this.gridAddButton.disabled) {
        this.orgId = "";
        this.org = { name: '', packageId: '', type_id: '' };
        this.addOrg.setTitle("Add Organization");
        //this.addOrg.position({ x: 85, y: 100 });
        this.addOrg.open();
      }
    });

    this.gridDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.gridDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Organization?", "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              let datarow = this.orgGrid.getrowdata(this.rowIndex);

              this.deleteOrganization(datarow["_id"], (res) => {
                if (res) {
                  this.resetGrid();
                  this.isOrgGrid = false;
                  this.isEngineGrid = false;
                  this.isAppGrid = false;
                  this.orgId = "";
                  this.utils.iAlert('success', '', 'Organization deleted successfully');
                  this.orgGrid.source(this.orgAdaptor);
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


  applyFilter(searchText?: string) {
    this.orgGrid.clearfilters();
    let searchColumnIndex = parseInt(this.searchDropdown.getSelectedIndex());
    let datafield = '';

    switch (searchColumnIndex) {
      case 0:
        datafield = 'name';
        break;
      case 1:
        datafield = 'type';
        break;
      case 2:
        datafield = 'package';
        break;
    }

    let filtergroup = new jqx.filter();
    let filter_or_operator = 1;
    let filtervalue = searchText;
    let filtercondition = 'contains';
    let filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
    filtergroup.addfilter(filter_or_operator, filter);
    this.orgGrid.addfilter(datafield, filtergroup);
    this.orgGrid.applyfilters();
  }

  orgGridOnRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    let data = event.args.row;

    if (!this.utils.isEmptyObject(data)) {
      this.resetGrid();
      this.assignDataToObject(data);
      this.isOrgGrid = true;
      this.updateButtons('Select');
    }
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

    let engineObj = _.findWhere(this.engines, { name: "Advanced Stream" });
    this.isAdvancedStream = !this.utils.isEmptyObject(engineObj) ? true : false;
  };

  orgGridOnRowUnselect(event: any): void {
    var index = event.args.rowindex;
  };

  orgDoubleClick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;
    var datarow = this.orgGrid.getrowdata(this.rowIndex);

    if (!this.utils.isEmptyObject(datarow)) {
      this.assignDataToObject(datarow);
      this.isOrgGrid = true;
      this.updateButtons('Edit');
      this.addOrg.setTitle("Update Organization");
      //this.addOrg.position({ x: 85, y: 100 });
      this.addOrg.open();
    }
  };

  onBindingComplete(event: any): void {
    let orgDatas = this.orgGrid.getrows();
    this.isLoadedGrid = true;

    setTimeout(() => {
      this.loaderShared.showSpinner(false);
    }, 0);
  };

  onEndAppLoad(appObj: any): void {
    this.appIds = appObj["ids"];

    if (this.appIds.length == 0) {
      this.appId = "";
      this.appName = "";
      this.integrationId = "";
      this.widgetIds = [];
      this.isChat = false;
      this.languages = [];
    }

    this.isEngineGrid = true;
  };

  onEngineAssignDone(engines: any): void {
    this.engines = engines;
    this.orgGrid.source(this.orgAdaptor);
  };

  onLanguageAssignDone(languages: any): void {
    this.languages = languages;
  };

  onIntegrationWidgetDone(widgetIds: any): void {
    this.widgetIds = widgetIds;
  };

  onSelectApp(appObj: any) {
    this.appIds = appObj["ids"];
    this.appId = appObj["_id"];
    this.appName = appObj["name"];
    this.isChat = appObj["chat"];
    this.languages = appObj["languages"];
    this.isAppGrid = true;
  }

  onSelectLocation(obj: any) {
    this.locationId = obj["_id"];
  }

  onSelectIntegration(obj: any) {
    this.integrationId = obj["_id"];
    this.widgetIds = obj["widgetIds"];
  }

  onIntegrationloadComplete(obj: any) {
    let ids = obj["ids"];

    if (ids.length == 0) {
      this.integrationId = "";
      this.widgetIds = [];
    }
  }

  updateButtons(action: string): void {
    switch (action) {
      case 'Select':
        this.gridAddButton.setOptions({ disabled: false });
        this.gridDeleteButton.setOptions({ disabled: false });
        break;
      case 'Unselect':
        this.gridAddButton.setOptions({ disabled: false });
        this.gridDeleteButton.setOptions({ disabled: true });
        break;
      case 'Edit':
        this.gridAddButton.setOptions({ disabled: true });
        this.gridDeleteButton.setOptions({ disabled: true });
        break;
      case 'End Edit':
        this.gridAddButton.setOptions({ disabled: false });
        this.gridDeleteButton.setOptions({ disabled: false });
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

  addOpen(e: any) {

  };

  addClose(e: any) {
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
          this.resetGrid();
          this.orgId = res._id;
          this.orgGrid.clearselection();
          this.isOrgGrid = false;
          this.isEngineGrid = false;
          this.isAppGrid = false;

          let rIndex = this.orgGrid.getrowboundindexbyid(this.orgId);

          if (rIndex != -1) {
            this.orgGrid.selectrow(rIndex);
          }

          this.utils.iAlert('success', '', 'Organization saved successfully!!!');
        }

        this.orgGrid.source(this.orgAdaptor);
        this.addOrg.close();
      }
    });
  };

  onFormReset() {
    this.orgForm.resetForm();
    this.org = { name: '', packageId: '', type_id: '' };
  };

  pageLoad() {
    this.packages = [];
    this.organizationTypes = [];

    if (this.isLoadedGrid) {
      this.orgGrid.updatebounddata();
    }

    this.packages = this.packageAdaptor.records;
    this.packages.unshift({ _id: "", name: "Select package" });

    this.organizationTypes = this.typeAdaptor.records;
    this.organizationTypes.unshift({ _id: "", name: "Select type" });

    setTimeout(() => {
      this.loaderShared.showSpinner(false);
    }, 0);
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.pageLoad();
      }
    });
  };

  ngOnChanges(cHObj: any) {
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
