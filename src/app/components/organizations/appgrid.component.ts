import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { AppsService } from '../../services/apps.service';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'app-grid',
  templateUrl: './appgrid.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppgridComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @ViewChild('appGrid') appGrid: jqxGridComponent;
  @ViewChild('appWindow') appWindow: jqxWindowComponent;
  @ViewChild('appForm') appForm: NgForm;
  @Output('endAppLoad') onEndAppLoad = new EventEmitter();
  @Output('onSelectApp') onSelectApp = new EventEmitter();
  @Input('languages') languages: any = [];
  dataAdapter: any;
  source: any;
  rowIndex: number;
  appId: string;
  app: object = { name: "", authenticated: "-1", pin: "", googleAnalytics: "", alerts: "", chat: "-1" };
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private appService: AppsService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    private loaderShared: LoaderSharedService) { }

  chatSource: any =
    {
      datafields: [
        { name: 'chatId', type: 'string' },
        { name: 'chatName', type: 'string' },
        { name: 'sno' }
      ],
      localdata: [
        { sno: 0, chatId: '-1', chatName: 'Select Chat' },
        { sno: 1, chatId: '0', chatName: 'Off' },
        { sno: 2, chatId: '1', chatName: 'On' },
        { sno: 3, chatId: '2', chatName: 'Private' }
      ]
    };

  authSource: any =
    {
      datafields: [
        { name: 'authId', type: 'string' },
        { name: 'authName', type: 'string' },
        { name: 'sno' }
      ],
      localdata: [
        { sno: 0, authId: '-1', authName: 'Select Secure Auth.' },
        { sno: 1, authId: '0', authName: 'Pre-approved' },
        { sno: 2, authId: '1', authName: 'Email' },
        { sno: 3, authId: '4', authName: 'Email-Auto Approve' },
        { sno: 4, authId: '2', authName: 'Username' },
        { sno: 5, authId: '3', authName: 'No Security' },
        { sno: 6, authId: '5', authName: 'Late Registration' }
      ]
    };

  chatAdaptor: any = new jqx.dataAdapter(this.chatSource, {
    autoBind: true
  });

  authAdaptor: any = new jqx.dataAdapter(this.authSource, {
    autoBind: true
  });

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
        this.appId = "";
        this.app = { name: "", authenticated: "-1", pin: "", googleAnalytics: "", alerts: "", chat: "-1" };
        this.appWindow.setTitle("Add Apps");
        this.appWindow.position({ x: 600, y: 90 });
        this.appWindow.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this App.?", "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              var datarow = this.appGrid.getrowdata(this.rowIndex)
              this.deleteApp(datarow["_id"], (res) => {
                if (res) {
                  this.appId = "";
                  this.utils.iAlert('success', '', 'Apps deleted successfully');
                  this.reloadGrid();
                  this.updateButtons('delete');
                  this.appWindow.close();
                }
              });
            }
          })
        } else {
          this.utils.iAlert('error', 'Error', 'Please select the App!!!');
        }
      }
    });
  };

  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'authenticated', type: 'string' },
    { name: 'chat', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'aname', value: 'authenticated', values: { source: this.authAdaptor.records, value: 'authId', name: 'authName' } },
    { name: 'cname', value: 'chat', values: { source: this.chatAdaptor.records, value: 'chatId', name: 'chatName' } },
    { name: 'logo', type: 'string' },
    { name: 'startScreenImage', type: 'string' },
    { name: 'website', type: 'string' },
    { name: 'organizationId', type: 'string' },
    { name: 'autoApprove', type: 'string' },
    { name: 'pin', type: 'string' },
    { name: 'googleAnalytics', type: 'string' },
    { name: 'alerts' },
    { name: 'languages' },
    { name: 'publishing' }
  ];

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
        text: 'logo', hidden: true, datafield: 'logo', sortable: false
      },
      {
        text: 'startScreenImage', hidden: true, datafield: 'startScreenImage', sortable: false
      },
      {
        text: 'website', hidden: true, datafield: 'website', sortable: false
      },
      {
        text: 'organizationId', hidden: true, datafield: 'organizationId', sortable: false
      },
      {
        text: 'autoApprove', hidden: true, datafield: 'autoApprove', sortable: false
      },
      {
        text: 'publishing', hidden: true, datafield: 'publishing', sortable: false
      },
      {
        text: 'languages', hidden: true, datafield: 'languages', sortable: false
      },
      {
        text: 'Name', datafield: 'name', width: 100, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Secure Auth', width: 100, datafield: 'aname', sortable: true, cellsalign: 'left', align: 'center'
      },
      {
        text: 'PIN', editable: false, datafield: 'pin', width: 60, columntype: 'textbox', sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Google Analytics', datafield: 'googleAnalytics', width: 100, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Alerts', datafield: 'alerts', width: 150, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Chat', datafield: 'cname', sortable: true, cellsalign: 'left', align: 'center', width: 60
      },
    ];

  rowdoubleclick(event: any): void {
    let args = event.args;
    this.rowIndex = args.rowindex;
    let datarow = this.appGrid.getrowdata(this.rowIndex);

    if (!this.utils.isEmptyObject(datarow)) {
      this.assingDataToObject(datarow);

      this.updateButtons('Edit');
      this.appWindow.setTitle("Update App");
      this.appWindow.position({ x: 600, y: 90 });
      this.appWindow.open();
      this.emitSelectEvent(datarow);
    }
  };

  emitSelectEvent(data) {
    let rowID = this.appGrid.getrowid(this.rowIndex);
    let appDatas = this.appGrid.getrows();
    let ids = _.pluck(appDatas, '_id');
    let obj = {};
    obj["_id"] = rowID;
    obj["ids"] = ids;
    obj["name"] = data["name"];
    obj["chat"] = (data["chat"] == "1" || data["chat"] == "2") ? true : false;

    if (!this.utils.isNullOrEmpty(data["languages"])) {
      this.languages = data["languages"];
      obj["languages"] = data["languages"];
    } else {
      this.languages = [];
      obj["languages"] = [];
    }

    this.onSelectApp.emit(obj);
  }

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    let data = event.args.row;

    if (!this.utils.isEmptyObject(data)) {
      this.assingDataToObject(data);
      this.emitSelectEvent(data);

      setTimeout(() => {
        this.updateButtons('Select');
      }, 0);
    }
  };

  onRowUnselect(event: any): void {
  };

  addWindowOpen() {
  };

  ngAfterViewInit(): void {
    let value = this.appGrid.getrows();
  };

  onBindingComplete(event: any): void {
    let appDatas = this.appGrid.getrows();
    let obj = {};

    if (appDatas.length > 0) {
      this.appGrid.selectrow(0);
      let rowID = this.appGrid.getrowid(0);
      let ids = _.pluck(appDatas, '_id');

      obj["_id"] = rowID;
      obj["ids"] = ids;
    } else {
      obj["ids"] = [];
    }

    this.onEndAppLoad.emit(obj);
  };

  assingDataToObject(data: object) {
    this.appId = data["_id"];
    this.app = { name: data["name"] };

    if (!this.utils.isNullOrEmpty(data["languages"])) {
      this.languages = data["languages"];
    } else {
      this.languages = [];
    }

    if (!this.utils.isNullOrEmpty(data["alerts"])) {
      this.app["alerts"] = data["alerts"];
    } else {
      this.app["alerts"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["authenticated"])) {
      this.app["authenticated"] = data["authenticated"];
    } else {
      this.app["authenticated"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["chat"])) {
      this.app["chat"] = data["chat"];
    } else {
      this.app["chat"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["googleAnalytics"])) {
      this.app["googleAnalytics"] = data["googleAnalytics"];
    } else {
      this.app["googleAnalytics"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["pin"])) {
      this.app["pin"] = data["pin"];
    } else {
      this.app["pin"] = "";
    }
  };

  addWindowClose() {
    this.app = { name: "", authenticated: "-1", pin: "", googleAnalytics: "", alerts: "", chat: "-1" };
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

  geAppObject(appObj: object) {
    var obj = {};
    obj["name"] = appObj["name"];

    if (appObj["authenticated"] != "-1") {
      obj["authenticated"] = appObj["authenticated"];
    } else {
      obj["authenticated"] = "";
    }

    if (appObj["chat"] != "-1") {
      obj["chat"] = appObj["chat"];
    } else {
      obj["chat"] = "";
    }

    obj["pin"] = appObj["pin"];
    obj["googleAnalytics"] = appObj["googleAnalytics"];
    obj["alerts"] = appObj["alerts"];
    obj["organizationId"] = this.organizationId;
    obj["languages"] = [];

    if (obj["authenticated"] == "4") {
      obj["autoApprove"] = true;
    } else {
      obj["autoApprove"] = false;
    }

    return obj;
  };

  saveApp(id: any, appObj: object, cb?: any) {
    var obj = this.geAppObject(appObj);

    if (id.length > 12) {
      this.appService.updateApp(id, obj)
        .then(res => {
          if (res) {
            cb(res)
          }
        });

    } else {
      this.appService.saveApp(obj, this.orgType)
        .then(res => {
          if (res) {
            cb(res)
          }
        });
    }
  };

  deleteApp(id: any, cb?: any) {
    this.appService.deleteApp(id)
      .then(res => {
        if (res) {
          cb(true);
        }
      });
  };

  onSubmit() {
    var obj = this.app;

    this.saveApp(this.appId, obj, (res) => {
      if (res) {

        if (this.appId.length > 12) {
          this.utils.iAlert('success', '', 'Apps updated successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Apps saved successfully!!!');
        }

        this.appId = res._id;
        this.appGrid.refreshdata();
        this.reloadGrid();

        this.appWindow.close();
      }
    });
  };

  reloadGrid() {
    let dataSource = {
      datatype: "json",
      id: '_id',
      url: '/cms/apps/list/' + this.organizationId + '/' + 'admin',
      datafields: this.datafields,
    }

    let adapter = new jqx.dataAdapter(dataSource);

    this.appGrid.source(adapter);
  }

  onFormReset() {
    this.appForm.resetForm();
    this.app = { name: "", authenticated: "-1", pin: "", googleAnalytics: "", alerts: "", chat: "-1" };
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("organizationId") && !this.utils.isNullOrEmpty(cHObj["organizationId"]["currentValue"])) {
      let obj = cHObj["organizationId"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(obj["previousValue"]) && obj["previousValue"] !== obj["currentValue"]) {
        this.appGrid.refreshdata();

        this.reloadGrid();
      }

      if (obj["firstChange"]) {
        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/cms/apps/list/' + this.organizationId + '/' + 'admin',
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.appGrid.source(this.dataAdapter);
        }
      }
    }

    if (cHObj.hasOwnProperty("languages") && cHObj["languages"]["currentValue"].length > 0) {
      let widgetObj = cHObj["languages"];

      if (!widgetObj["firstChange"] && this.utils.isArray(widgetObj["previousValue"]) && this.utils.isArray(widgetObj["currentValue"])) {
        var prev = widgetObj["previousValue"];
        var cur = widgetObj["currentValue"];
        var isDiffer = this.utils.checkIfArraysEqual(this.languages, cur);

        if (!isDiffer) {
          this.languages = cur;
          this.reloadGrid();
        }
      }

      if (widgetObj["firstChange"] && this.utils.isArray(widgetObj["firstChange"]) && widgetObj["firstChange"].length > 0) {
      }
    }
  };

  ngOnInit() {
  }
}
