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

  public organizations: Object[] = [];
  public organizationTypes: Object[] = [];
  public packages: Object[] = [];
  private orgChangeDetect: any;

  @ViewChild('orgGrid') orgGrid: jqxGridComponent;
  @ViewChild('selectedRowIndex') selectedRowIndex: ElementRef;
  @ViewChild('unselectedRowIndex') unselectedRowIndex: ElementRef;
  rowIndex: number;
  myAddButton: jqwidgets.jqxButton;
  myEditButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;
  myCancelButton: jqwidgets.jqxButton;
  myUpdateButton: jqwidgets.jqxButton;

  ngAfterViewInit(): void {
  };

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
        pack.package = pack.name;
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
        typeObj.type = typeObj.name;
        typeObj.type_id = typeObj._id;

        data.push(typeObj);
      }

      return data;
    }
  });

  addrow(rowid: any, rowdata: any, position: any, commit: any): void {
    commit(true);
  }

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
    this.saveOrganization(rowid, rowdata, (res) => {
      if (res) {
        if (rowid.length > 12) {
          this.utils.iAlert('success', '', 'Organization saved successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Organization updated successfully!!!');
        }
        commit(true);
        this.orgGrid.source(this.dataAdapter)
      } else {
        commit(false);
      }
    });
  }

  source = {
    datatype: "json",
    id: '_id',
    datafields: [
      { name: '_id', type: 'string' },
      { name: 'type_id', type: 'string' },
      { name: 'packageId', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'type', value: 'type_id', values: { source: this.typeAdaptor.records, value: 'type_id', name: 'type' } },
      { name: 'package', value: 'packageId', values: { source: this.packageAdaptor.records, value: 'packageId', name: 'package' } },
      { name: 'engines', type: 'string' },
      { name: 'publishing', type: 'boolean' },
    ],
    url: "/organization/list",
    addrow: this.addrow,
    updaterow: this.updaterow,
    deleterow: this.deleterow
  };

  dataAdapter = new jqx.dataAdapter(this.source);

  snorenderer = (row: number, column: any, value: string): string => {
    var id = parseInt(value) + 1;

    return '<span style="margin-left: 4px; margin-top: 9px; float: left;">' + id + '</span>';
  };

  columns: any[] =
    [
      {
        text: 'SNo.', dataField: '', columntype: 'number', width: 100, editable: false,
        sortable: false, cellsalign: 'left', align: 'center', cellsrenderer: this.snorenderer
      },
      {
        text: '_id', hidden: true, datafield: '_id', sortable: false
      },
      {
        text: 'Name', datafield: 'name', width: 140, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center',
        validation: (cell: any, value: any): any => {
          if (value == '') {
            return { result: false, message: 'Name is required!' };
          }

          return true;
        }
      },
      {
        text: 'Type', displayfield: 'type', width: 120, columntype: 'dropdownlist', datafield: 'type_id',
        sortable: true, cellsalign: 'left', align: 'center',
        createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ autoDropDownHeight: true, source: this.typeAdaptor.records, displayMember: 'type', valueMember: 'type_id' });
        }
      },
      {
        text: 'Package', displayfield: 'package', columntype: 'dropdownlist', datafield: 'packageId',
        sortable: true, cellsalign: 'left', align: 'center', width: 140,
        createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ autoDropDownHeight: true, source: this.packageAdaptor.records, displayMember: 'package', valueMember: 'packageId' });
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
      createButtons('editButton', toTheme('jqx-icon-edit')),
      createButtons('deleteButton', toTheme('jqx-icon-delete')),
      createButtons('cancelButton', toTheme('jqx-icon-cancel')),
      createButtons('updateButton', toTheme('jqx-icon-save'))
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
    this.myEditButton = jqwidgets.createInstance(buttons[1], 'jqxButton', otherButtonsOptions);
    this.myDeleteButton = jqwidgets.createInstance(buttons[2], 'jqxButton', otherButtonsOptions);
    this.myCancelButton = jqwidgets.createInstance(buttons[3], 'jqxButton', otherButtonsOptions);
    this.myUpdateButton = jqwidgets.createInstance(buttons[4], 'jqxButton', otherButtonsOptions);

    let addTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Add'
      }
    let editTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Edit'
      }
    let deleteTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Delete'
      }
    let updateTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Save Changes'
      }
    let cancelTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Cancel'
      }

    let myAddToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[0], 'jqxTooltip', addTooltopOptions);
    let myEditToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[1], 'jqxTooltip', editTooltopOptions);
    let myDeleteToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[2], 'jqxTooltip', deleteTooltopOptions);
    let myCancelToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[3], 'jqxTooltip', cancelTooltopOptions);
    let myUpdateToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[4], 'jqxTooltip', updateTooltopOptions);

    this.myAddButton.addEventHandler('click', (event: any) => {
      if (!this.myAddButton.disabled) {
        //add new empty row.
        this.orgGrid.addrow(null, {}, 'first')
        //select the first row and clear the selection.
        this.orgGrid.clearselection();
        //this.orgGrid.selectrow(0);
        //edit the new row.
        this.orgGrid.beginrowedit(0);
      }
    });

    this.myEditButton.addEventHandler('click', (event: any) => {
      if (!this.myEditButton.disabled) {
        this.orgGrid.beginrowedit(this.rowIndex);
        this.updateButtons('edit');
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Organization?", "Yes", "No", (res) => {
          if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
            this.orgGrid.deleterow(this.rowIndex);
            this.updateButtons('delete');
          }
        })
      }
    });

    this.myCancelButton.addEventHandler('click', (event: any) => {
      if (!this.myCancelButton.disabled) {
        //cancel changes.
        this.orgGrid.endrowedit(this.rowIndex, true);
      }
    });

    this.myUpdateButton.addEventHandler('click', (event: any) => {
      if (!this.myUpdateButton.disabled) {
        //save changes.
        this.orgGrid.endrowedit(this.rowIndex, false);
      }
    });
  };

  getOrganizations() {
    this.orgService.organizationList()
      .then(org => {
        this.organizations = org;
      });
  };

  orgGridOnRowSelect(event: any): void {
    this.selectedRowIndex.nativeElement.innerHTML = event.args.rowindex;
    this.rowIndex = event.args.rowindex;
    this.updateButtons('Select');
  };

  orgGridOnRowUnselect(event: any): void {
    this.unselectedRowIndex.nativeElement.innerHTML = event.args.rowindex;
    //this.updateButtons('Unselect');
  };

  orgDoubleClick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;

    this.orgGrid.beginrowedit(this.rowIndex);
    this.updateButtons('Edit');
  }

  beginRowEdit(event: any): void {
    this.updateButtons('Edit');
  };

  endRowEdit(event: any): void {
    this.updateButtons('End Edit');
  };

  onBindingComplete(event: any): void {
  }

  updateButtons(action: string): void {
    switch (action) {
      case 'Select':
        this.myAddButton.setOptions({ disabled: false });
        this.myDeleteButton.setOptions({ disabled: false });
        this.myEditButton.setOptions({ disabled: false });
        this.myCancelButton.setOptions({ disabled: true });
        this.myUpdateButton.setOptions({ disabled: true });
        break;
      case 'Unselect':
        this.myAddButton.setOptions({ disabled: false });
        this.myDeleteButton.setOptions({ disabled: true });
        this.myEditButton.setOptions({ disabled: true });
        this.myCancelButton.setOptions({ disabled: true });
        this.myUpdateButton.setOptions({ disabled: true });
        break;
      case 'Edit':
        this.myAddButton.setOptions({ disabled: true });
        this.myDeleteButton.setOptions({ disabled: true });
        this.myEditButton.setOptions({ disabled: true });
        this.myCancelButton.setOptions({ disabled: false });
        this.myUpdateButton.setOptions({ disabled: false });
        break;
      case 'End Edit':
        this.myAddButton.setOptions({ disabled: false });
        this.myDeleteButton.setOptions({ disabled: false });
        this.myEditButton.setOptions({ disabled: false });
        this.myCancelButton.setOptions({ disabled: true });
        this.myUpdateButton.setOptions({ disabled: true });
        break;
    }
  };

  getOrganizationTypes() {
    this.orgService.organizationTypeList()
      .then(orgTypes => {
        this.organizationTypes = orgTypes;
      });
  };

  getPackages() {
    this.orgService.getPackages()
      .then(packages => {
        this.packages = packages;
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

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.getOrganizations();
      this.loaderShared.showSpinner(true);
      this.loaderShared.showSpinner(false);
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
