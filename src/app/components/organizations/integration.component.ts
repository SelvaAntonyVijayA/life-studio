import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { IntegrationService } from '../../services/integration.service';

@Component({
  selector: 'integration-grid',
  templateUrl: './integration.component.html'
})
export class IntegrationComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('appId') appId: string;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @Input('widgetIds') widgetIds: any;
  selectedWidgetIds: any;
  dataAdapter: any;
  source: any;
  typeSource: any;
  typeAdaper: any;
  rowIndex: number = -1;
  inteObj: object = { userName: "", password: "", code: "", typeId: "", appId: "" };
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;
  @ViewChild('integrationGrid') integrationGrid: jqxGridComponent;
  @ViewChild('integrationWindow') integrationWindow: jqxWindowComponent;
  @ViewChild('integrationForm') integrationForm: NgForm;
  integrationId: string;
  integrationTypes: any;
  @Output('onSelectIntegration') onSelectIntegration = new EventEmitter();
  @Output('onIntegrationloadComplete') onIntegrationloadComplete = new EventEmitter();
  fields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' }
  ];
  datafields: any;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private e1: ElementRef,
    private renderer: Renderer2,
    private integrationService: IntegrationService,
    public utils: Utils,
    private loaderShared: LoaderSharedService) { }

  ngOnInit() {
  }

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
      createButtons('l_addButton', toTheme('jqx-icon-plus')),
      createButtons('l_deleteButton', toTheme('jqx-icon-delete')),
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
        this.integrationId = "";
        this.inteObj = { userName: "", password: "", code: "", typeId: "", appId: "" };
        this.integrationWindow.setTitle("Add integration");
        this.integrationWindow.position({ x: 550, y: 160 });
        this.integrationWindow.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          let datarow = this.integrationGrid.getrowdata(this.rowIndex);
          let integrationId = datarow["_id"];
          let plAssigned = [];
          let recordDeleteMsg = 'Are you sure you want to delete this integration?';

          this.utils.iAlertConfirm("confirm", "Confirm", recordDeleteMsg, "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              this.deleteIntegration(integrationId, (res) => {
                if (res) {
                  this.integrationId = "";
                  this.utils.iAlert('success', '', 'integration has been deleted successfully');
                  this.reloadGrid();
                  this.updateButtons('delete');
                  this.integrationWindow.close();
                }
              });
            }
          });
        } else {
          this.utils.iAlert('error', 'Error', 'Please select the integration!!!');
        }
      }
    });
  };

  groupsrenderer() {

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
        text: 'UserName', datafield: 'userName', width: 105, sortable: true, cellsalign: 'left',
        align: 'center'
      },
      {
        text: 'Password', datafield: 'password', width: 70, sortable: true, cellsalign: 'left',
        align: 'center'
      },
      {
        text: 'code', datafield: 'code', width: 90, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Type', editable: false, datafield: 'typeName', width: 60, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'appId', hidden: true, datafield: 'appId', sortable: false
      },
      {
        text: 'widgetIds', hidden: true, datafield: 'widgetIds', sortable: false
      }
    ];

  rowdoubleclick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;

    if (this.rowIndex != -1) {
      var datarow = this.integrationGrid.getrowdata(this.rowIndex);
      this.assingDataToObject(datarow);
      this.emitSelectEvent();
      this.updateButtons('Edit');
      this.integrationWindow.setTitle("Update Integration");
      this.integrationWindow.position({ x: 550, y: 160 });
      this.integrationWindow.open();
    }
  };

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;

    if (this.rowIndex != -1) {
      var data = event.args.row;
      this.assingDataToObject(data);
      this.emitSelectEvent();

      setTimeout(() => {
        this.updateButtons('Select');
      }, 0);
    }
  };

  emitSelectEvent() {
    if (this.rowIndex != -1) {
      let rowID = this.integrationGrid.getrowid(this.rowIndex);
      let rowdata = this.integrationGrid.getrowdata(this.rowIndex);

      if (!this.utils.isEmptyObject(rowdata)) {
        let obj = {};
        obj["_id"] = rowID;
        obj["widgetIds"] = rowdata["widgetIds"];
        this.selectedWidgetIds = rowdata["widgetIds"];
        this.integrationId = rowID;

        this.onSelectIntegration.emit(obj);
      }
    }
  }

  onRowUnselect(event: any): void {
  };

  addWindowOpen() {
  };

  ngAfterViewInit(): void {
    let value = this.integrationGrid.getrows();
  };

  onBindingComplete(event: any): void {
    let obj = {};
    let appDatas = this.integrationGrid.getrows();
    let ids = _.pluck(appDatas, '_id');
    obj["ids"] = ids;

    if (ids.length > 0) {
      this.integrationGrid.selectrow(0);
      this.onIntegrationloadComplete.emit(obj);
    }
  };

  assingDataToObject(data: object) {
    this.inteObj = {};

    if (!this.utils.isEmptyObject(data)) {
      if (!this.utils.isNullOrEmpty(data["_id"])) {
        this.integrationId = data["_id"];
      }

      if (!this.utils.isNullOrEmpty(data["userName"])) {
        this.inteObj = { userName: data["userName"] };
      }

      if (!this.utils.isNullOrEmpty(data["code"])) {
        this.inteObj["code"] = data["code"];
      } else {
        this.inteObj["code"] = "";
      }

      if (!this.utils.isNullOrEmpty(data["password"])) {
        this.inteObj["password"] = data["password"];
      } else {
        this.inteObj["password"] = "";
      }

      if (!this.utils.isNullOrEmpty(data["typeId"])) {
        this.inteObj["typeId"] = data["typeId"];
      } else {
        this.inteObj["typeId"] = "";
      }

      if (!this.utils.isNullOrEmpty(data["appId"])) {
        this.inteObj["appId"] = data["appId"];
      } else {
        this.inteObj["appId"] = "";
      }
    }
  };

  addWindowClose() {
    this.inteObj = { userName: "", password: "", code: "", typeId: "", appId: "" };
    this.updateButtons('End Edit');
  };

  updateButtons(action: string): void {
    if (this.myAddButton) {
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
    }
  };

  geAppObject(data: object) {
    var obj = {};

    obj["userName"] = data["userName"];
    obj["appId"] = this.appId;

    if (!this.utils.isNullOrEmpty(data["code"])) {
      obj["code"] = data["code"];
    } else {
      obj["code"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["password"])) {
      obj["password"] = data["password"];
    } else {
      obj["password"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["typeId"])) {
      obj["typeId"] = data["typeId"];
    } else {
      obj["typeId"] = "";
    }

    return obj;
  };

  saveIntegration(id: any, appObj: object, cb?: any) {
    var obj = this.geAppObject(appObj);

    if (id.length > 12) {
      this.integrationService.updateIntegration(id, obj)
        .then(res => {
          if (res) {
            cb(res)
          }
        });

    } else {
      this.integrationService.saveIntegration(obj, this.orgType)
        .then(res => {
          if (res) {
            cb(res)
          }
        });
    }
  };

  deleteIntegration(integrationId: any, cb?: any) {
    this.integrationService.deleteIntegration(integrationId)
      .then(res => {
        if (res) {
          cb(true);
        }
      });
  };

  onSubmit() {
    var obj = this.inteObj;

    this.saveIntegration(this.integrationId, obj, (res) => {
      if (res) {

        if (this.integrationId.length > 12) {
          this.utils.iAlert('success', '', 'integration updated successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'integration saved successfully!!!');
        }

        this.integrationId = res._id;
        this.integrationGrid.refreshdata();
        this.reloadGrid();

        this.integrationWindow.close();
      }
    });
  };

  reloadGrid() {
    this.datafields = [
      { name: '_id', type: 'string' },
      { name: 'userName', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'typeId', type: 'string', map: 'typeId' },
      { name: 'typeName', value: 'status', values: { source: this.typeAdaper.records, value: '_id', name: 'name' } },
      { name: 'password' },
      { name: 'widgetIds' },
      { name: 'appId', type: 'string' }
    ];

    let dataSource = {
      datatype: "json",
      id: '_id',
      url: '/integration/list/' + this.appId,
      datafields: this.datafields
    }

    let adapter = new jqx.dataAdapter(dataSource);

    this.integrationGrid.source(adapter);
  };

  onFormReset() {
    this.integrationForm.resetForm();
    this.inteObj = { userName: "", password: "", code: "", typeId: "", appId: "" };
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("appId") && !this.utils.isNullOrEmpty(cHObj["appId"]["currentValue"])) {
      let objApp = cHObj["appId"];
      var prevAppId = objApp["previousValue"];
      var curAppId = objApp["currentValue"];

      if (!objApp["firstChange"] && !this.utils.isNullOrEmpty(prevAppId) && prevAppId !== curAppId) {
        this.reloadGrid();
      }

      if (!objApp["firstChange"] && this.utils.isNullOrEmpty(prevAppId) && !this.utils.isNullOrEmpty(curAppId)) {
        this.reloadGrid();
      }

      if (objApp["firstChange"]) {
        this.typeSource =
          {
            datatype: 'json',
            datafields: this.fields,
            url: '/integrationtype/list/',
            async: false
          };

        if (!this.typeAdaper) {
          this.typeAdaper = new jqx.dataAdapter(this.typeSource, {
            autoBind: true
          });

          this.integrationTypes = this.typeAdaper.records;
          this.integrationTypes.unshift({ _id: "", name: "Select type" });
        }

        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/integration/list/' + this.appId
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.integrationGrid.source(this.dataAdapter);
        }
      }
    }

    if (cHObj.hasOwnProperty("widgetIds") && cHObj["widgetIds"]["currentValue"].length > 0) {
      let widgetObj = cHObj["widgetIds"];

      if (!widgetObj["firstChange"] && this.utils.isArray(widgetObj["previousValue"]) && this.utils.isArray(widgetObj["currentValue"])) {
        var prev = widgetObj["previousValue"];
        var cur = widgetObj["currentValue"];
        var isDiffer = this.utils.checkIfArraysEqual(this.selectedWidgetIds, cur);

        if (!isDiffer) {
          this.selectedWidgetIds = cur;
          this.reloadGrid();
        }
      }

      if (widgetObj["firstChange"] && this.utils.isArray(widgetObj["firstChange"]) && widgetObj["firstChange"].length > 0) {
      }
    }
  }
}
