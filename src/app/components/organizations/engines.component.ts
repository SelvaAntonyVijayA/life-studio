import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { OrganizationsService } from '../../services/organizations.service';

@Component({
  selector: 'engines-grid',
  templateUrl: './engines.component.html'
})
export class EnginesComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @Input('engines') engines: any;
  @Input('appIds') appIds: any;
  @Output('onEngineAssignDone') doneEvent = new EventEmitter();
  @ViewChild('engineGrid') engineGrid: jqxGridComponent;
  assignButton: jqwidgets.jqxButton;
  dataAdapter: any;
  source: any;
  rowIndex: number;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    private orgService: OrganizationsService,
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
      let enginesList = [];
      let publishing = false;
      let selectedIndexes = this.engineGrid.getselectedrowindexes();

      let length = selectedIndexes.length;

      for (let i = 0; i < length; i++) {
        let index = selectedIndexes[i];
        var datarow = this.engineGrid.getrowdata(index);

        var engineObj = {};
        engineObj["id"] = datarow["_id"];
        engineObj["name"] = datarow["name"];

        if (datarow.name.toLowerCase() == "publishing") {
          publishing = true;
        }

        enginesList.push(engineObj);
      }

      let obj = {};
      obj["engines"] = enginesList;
      obj["publishing"] = publishing;

      if (this.appIds.length > 0) {
        obj["appIds"] = this.appIds;
      } else {
        obj["appIds"] = [];
      }

      this.orgService.updateOrganization(this.organizationId, obj)
        .then(res => {
          if (res) {
            this.utils.iAlert('success', '', 'Engines are assigned successfully');
            this.doneEvent.emit(enginesList);
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
    var datarow = this.engineGrid.getrowdata(this.rowIndex);
  };

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    if (Array.isArray(event.args.rowindex)) {

      if (event.args.rowindex.length > 0) {
        this.processEngineRightsSelectAll(event.args.rowindex);
      }
    } else {

      this.rowIndex = event.args.rowindex;
      let data = event.args.row;
      let rowdata = this.engineGrid.getrowdata(this.rowIndex);

      var engine = "";
      if (rowdata["name"].toLowerCase() == "basic stream" || rowdata["name"].toLowerCase() == "advanced stream") {
        engine = rowdata["name"].toLowerCase() == "basic stream" ? "Advanced Stream" : "Basic Stream";

        this.selectUnselectRowbyColumn(engine);
      }
    }
  };

  processEngineRightsSelectAll(indexes) {
    let engineRowIds = [];
    let engines = this.engines;
    let basicChk = false;

    if (Array.isArray(engines) && indexes && indexes.length > 0) {
      var rowsCount = indexes.length;
      
      for (var i = 0; i < rowsCount; i++) {
        let index = indexes[i];
        let rowdata = this.engineGrid.getrowdata(index);

        if (rowdata["name"].toLowerCase() == "advanced stream") {
          let basicIndex = engines.map(function (e) {
            return e['name'];
          }).indexOf("Basic Stream");

          if (basicIndex != -1) {
            basicChk = true;
            //this.engineGrid.selectrow(index);
            this.engineGrid.unselectrow(index)
          } else {
            this.engineGrid.selectrow(index);
          }
        }

        if (rowdata["name"].toLowerCase() == "basic stream") {
          let advIndex = engines.map(function (e) {
            return e['name'];
          }).indexOf("Advanced Stream");

          if (advIndex != -1 || !basicChk) {
            // this.engineGrid.selectrow(index);
            this.engineGrid.unselectrow(index)
          }

          if (basicChk) {

          }
        }

      }
    }
  };

  selectUnselectRowbyColumn(cellValue: string) {
    var rows = this.engineGrid.getrows();
    var rowsCount = rows.length;

    for (var i = 0; i < rowsCount; i++) {
      var value = this.engineGrid.getcellvalue(i, "name");
      if (value == cellValue) {
        this.engineGrid.unselectrow(i)
        break;
      };
    };
  };

  onRowUnselect(event: any): void {
    this.rowIndex = event.args.rowindex;
    var data = event.args.row;
  };

  reloadGrid() {
    let dataSource = {
      datatype: "json",
      id: '_id',
      url: '/engine/list',
      datafields: this.datafields,
    }

    let adapter = new jqx.dataAdapter(dataSource);

    this.engineGrid.source(adapter);
  }

  onBindingComplete(event: any): void {
    var indexes = [];
    this.engineGrid.clearselection();

    if (Array.isArray(this.engines)) {
      let length = this.engines.length;

      for (let i = 0; i < length; i++) {
        let record = this.engines[i];
        let rIndex = this.engineGrid.getrowboundindexbyid(record["id"]);

        if (rIndex != -1) {
          indexes.push(rIndex);

          this.engineGrid.selectrow(rIndex);
        }
      }
    }
  }

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("organizationId") && !this.utils.isNullOrEmpty(cHObj["organizationId"]["currentValue"])) {
      let obj = cHObj["organizationId"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(obj["previousValue"]) && obj["previousValue"] !== obj["currentValue"]) {
        this.engineGrid.refreshdata();

        this.reloadGrid();
      }

      if (obj["firstChange"]) {
        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/engine/list',
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.engineGrid.source(this.dataAdapter);
        }
      }
    }
  };

  ngOnInit() {
  }
}
