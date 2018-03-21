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

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
  encapsulation: ViewEncapsulation.None
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
  isGrid: boolean = false;
  orgId: string;
  org: object = { type: "", name: '', type_id: '', packageId: "" };
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;
  dataAdapter: any;
  source: any;
  organizationTypes: any;
  packages: any;
  packageSource: any =
    {
      datatype: 'json',
      datafields: [
        { name: '_id', type: 'string' },
        { name: 'name', type: 'string' }
      ],
      url: '/package/list',
      async: false
    };
  typeSource: any =
    {
      datatype: 'json',
      datafields: [
        { name: '_id', type: 'string' },
        { name: 'name', type: 'string' }
      ],
      url: '/organizationtype/list',
      async: false
    };
  packageAdaptor: any = new jqx.dataAdapter(this.packageSource, {
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
  typeAdaptor: any = new jqx.dataAdapter(this.typeSource, {
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
  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'type_id', type: 'string' },
    { name: 'packageId', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'typeName', value: 'type_id', values: { source: this.typeAdaptor.records, value: 'type_id', name: 'typeName' } },
    { name: 'packageName', value: 'packageId', values: { source: this.packageAdaptor.records, value: 'packageId', name: 'packageName' } },
    { name: 'engines', type: 'string' },
    { name: 'publishing', type: 'boolean' },
  ];

  ngAfterViewInit(): void {
  };

  deleterow(rowid: any, rowdata: any, commit: any): void {
    if (rowid.length > 12) {
      this.deleteOrganization(rowid, (res) => {
        if (res) {
          this.utils.iAlert('success', '', 'Organization deleted successfully');
          commit(true);
          this.orgGrid.source(this.dataAdapter)
        } else {
          commit(false);
        }
      });
    } else {
      commit(true);
    }
  }

  updaterow(rowid: any, rowdata: any, commit: any): void {

  };

  snorenderer = (row: number, column: any, value: string): string => {
    var id = parseInt(value) + 1;

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
        text: 'Name', datafield: 'name', width: 220, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Type', displayfield: 'typeName', width: 90, columntype: 'dropdownlist', datafield: 'type_id',
        sortable: true, cellsalign: 'left', align: 'center',
        createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ autoDropDownHeight: true, source: this.typeAdaptor.records, displayMember: 'typeName', valueMember: 'type_id' });
        }
      },
      {
        text: 'Package', displayfield: 'packageName', columntype: 'dropdownlist', datafield: 'packageId',
        sortable: true, cellsalign: 'left', align: 'center', width: 90,
        createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ autoDropDownHeight: true, source: this.packageAdaptor.records, displayMember: 'packageName', valueMember: 'packageId' });
        }
      },
      {
        text: 'publishing', datafield: 'publishing', hidden: true, cellsalign: 'left', align: 'center',
        sortable: false
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
      this[name].style.cssText = 'padding: 3px; margin: 2px; float: left; border: none'

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

    container.appendChild(fragment)
    toolBar[0].appendChild(container);

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
        this.addOrg.position({ x: 100, y: 120 });
        this.addOrg.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Organization?", "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              var datarow = this.orgGrid.getrowdata(this.rowIndex)
              this.deleteOrganization(datarow["_id"], (res) => {
                if (res) {
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
    var data = event.args.row;
    this.orgId = data["_id"];
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

    this.isGrid = true;
    this.updateButtons('Select');
  };

  orgGridOnRowUnselect(event: any): void {
    var index = event.args.rowindex;
  };

  orgDoubleClick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;
    var datarow = this.orgGrid.getrowdata(this.rowIndex)
    this.isGrid = true;
    this.updateButtons('Edit');
    this.addOrg.setTitle("Update Organization");
    this.addOrg.position({ x: 100, y: 120 });
    this.addOrg.open();
  }

  onBindingComplete(event: any): void {
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
        this.organizationTypes.push({ _id: "", name: "Select type" })
      });
  };

  getPackages() {
    this.orgService.getPackages()
      .then(packages => {
        this.packages = packages;
        this.packages.push({ _id: "", name: "Select package" })
      });
  };

  getOrgObject(orgObj: object) {
    var obj = {};

    obj["name"] = orgObj["name"];
    obj["type_id"] = orgObj["type_id"];
    obj["packageId "] = orgObj["packageId"];

    return obj;
  }

  saveOrganization(id: any, orgObj: object, cb?: any) {
    var obj = this.getOrgObject(orgObj);
    var type = "";

    if (!this.utils.isNullOrEmpty(orgObj["type"])) {
      type = orgObj["type"];
    }

    if (id.length > 12) {
      this.orgService.updateOrganization(id, obj)
        .then(res => {
          if (res) {
            cb(true)
          }
        });

    } else {
      this.orgService.saveOrganization(obj, type)
        .then(res => {
          if (res) {
            cb(true)
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

  }

  addClose() {

  }

  onSubmit() {
    var obj = this.org;
    var typeObj = _.findWhere(this.organizationTypes, { _id: obj["type_id"] });
    obj["type"] = typeObj["name"];

    this.saveOrganization(this.orgId, obj, (res) => {
      if (res) {
        if (this.orgId.length > 12) {
          this.utils.iAlert('success', '', 'Organization saved successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Organization updated successfully!!!');
        }

        this.orgGrid.source(this.dataAdapter);
        this.addOrg.close();
      }
    });
  }

  onFormReset() {
    this.org = { name: '', packageId: '', type_id: '' };
    //this.orgForm.resetForm({ name: '', packageId: '', type_id: '' });
  }

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.getOrganizationTypes();
      this.getPackages();
      this.source = {
        datatype: "json",
        id: '_id',
        url: "/organization/list",
        datafields: this.datafields
      };

      if (!this.dataAdapter) {
        this.dataAdapter = new jqx.dataAdapter(this.source);
      } else {
        this.orgGrid.source(this.dataAdapter);
      }

      //this.loaderShared.showSpinner(true);
      this.loaderShared.showSpinner(false);
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
