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
  selector: 'integrationwidgets-grid',
  templateUrl: './integrationwidgets.component.html'
})
export class IntegrationwidgetsComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @Input('widgetIds') widgetIds: any = [];
  @Input('appId') appId: any;
  @Input('integrationId') integrationId: any;
  @Output('onIntegrationWidgetDone') doneEvent = new EventEmitter();
  @ViewChild('iwGrid') iwGrid: jqxGridComponent;
  assignButton: jqwidgets.jqxButton;
  dataAdapter: any;
  source: any;
  rowIndex: number;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    private integrationService: IntegrationService,
    private loaderShared: LoaderSharedService) { }

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
      this[name].style.cssText = 'cursor: pointer; padding: 0px; margin-top: 5px; float: left; border: none'

      let iconDiv = document.createElement('div');
      iconDiv.style.cssText = 'margin-top: 5px; width: 16px; height: 16px;'
      iconDiv.className = cssClass;

      this[name].appendChild(iconDiv);
      return this[name];
    }

    let buttons = [
      createButtons('assignButton', toTheme('jqx-icon-plus')),
    ];

    for (let i = 0; i < buttons.length; i++) {
      fragment.appendChild(buttons[i]);
    }

    container.appendChild(fragment)
    toolBar[0].appendChild(container);

    let addButtonOptions: jqwidgets.ButtonOptions =
      {
        width: 80, height: 25, value: 'Assign',
        imgSrc: '/img/add.png',
        imgPosition: 'center', textPosition: 'center',
        textImageRelation: 'imageBeforeText'
      }

    this.assignButton = jqwidgets.createInstance(buttons[0], 'jqxButton', addButtonOptions);

    let addTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Assign engines to organizations'
      }

    let myAddToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[0], 'jqxTooltip', addTooltopOptions);

    this.assignButton.addEventHandler('click', (event: any) => {
      let publishing = false;
      this.widgetIds = [];

      if (!this.integrationId || this.integrationId.length < 12) {
        this.utils.iAlert('error', 'Error', 'Integration not selected');
        return false;
      }

      let selectedIndexes = this.iwGrid.getselectedrowindexes();

      let length = selectedIndexes.length;

      for (let i = 0; i < length; i++) {
        let index = selectedIndexes[i];
        var datarow = this.iwGrid.getrowdata(index);

        this.widgetIds.push(datarow["_id"]);
      }

      let obj = {};
      obj["widgetIds"] = this.widgetIds;

      this.integrationService.updateIntegration(this.integrationId, obj)
        .then(res => {
          if (res) {
            this.utils.iAlert('success', '', 'Widgets are assigned successfully');
            this.doneEvent.emit(this.widgetIds);
          }
        });
    });
  };

  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' },
  ];

  columns: any[] =
    [
      {
        text: '_id', hidden: true, datafield: '_id', sortable: false
      },
      {
        text: 'Name', datafield: 'name', width: 132, sortable: true, editable: false,
        cellsalign: 'left', align: 'center'
      },
    ];

  rowdoubleclick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;
    var datarow = this.iwGrid.getrowdata(this.rowIndex);
  };

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    let rowdata = this.iwGrid.getrowdata(this.rowIndex);
  };

  onRowUnselect(event: any): void {
    this.rowIndex = event.args.rowindex;
    var data = event.args.row;
  };

  reloadGrid() {
    let dataSource = {
      datatype: "json",
      id: '_id',
      url: '/integrationwidgets/list/',
      datafields: this.datafields,
    }

    let adapter = new jqx.dataAdapter(dataSource);

    this.iwGrid.source(adapter);
  }

  onBindingComplete(event: any): void {
    this.setWidget();
  }

  setWidget() {
    var indexes = [];
    this.iwGrid.clearselection();
    let length = this.widgetIds.length;

    for (let i = 0; i < length; i++) {
      let id = this.widgetIds[i];
      let rIndex = this.iwGrid.getrowboundindexbyid(id);

      if (rIndex > 0) {
        indexes.push(rIndex);

        this.iwGrid.selectrow(rIndex);
      }
    }
  }

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("appId") && !this.utils.isNullOrEmpty(cHObj["appId"]["currentValue"])) {
      let obj = cHObj["appId"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(obj["previousValue"]) && obj["previousValue"] !== obj["currentValue"]) {
        this.iwGrid.refreshdata();

        this.reloadGrid();
      }

      if (obj["firstChange"]) {
        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/integrationwidgets/list/',
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.iwGrid.source(this.dataAdapter);
        }
      }
    }

    if (cHObj.hasOwnProperty("widgetIds") && !this.utils.isNullOrEmpty(cHObj["widgetIds"]["currentValue"])) {
      let obj = cHObj["widgetIds"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(obj["previousValue"]) && obj["previousValue"] !== obj["currentValue"]) {
      }

      if (obj["firstChange"]) {
      }
    }
  };

  ngOnInit() {
  }
}
