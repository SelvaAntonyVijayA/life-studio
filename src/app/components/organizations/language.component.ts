import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { LanguageService } from '../../services/language.service';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'language-grid',
  templateUrl: './language.component.html'
})
export class LanguageComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('languages') languages: any;
  @Input('appId') appId: any;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @ViewChild('langGrid') langGrid: jqxGridComponent;
  @ViewChild('langWindow') langWindow: jqxWindowComponent;
  @ViewChild('langForm') langForm: NgForm;
  @Output('onLanguageAssignDone') doneEvent = new EventEmitter();
  dataAdapter: any;
  source: any;
  rowIndex: number;
  langObj: object = { name: "", code: "" };
  langId: string;
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;
  assignButton: jqwidgets.jqxButton;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private langService: LanguageService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
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
      iconDiv.style.cssText = 'margin: 4px; width: 16px; height: 16px;'
      iconDiv.className = cssClass;

      this[name].appendChild(iconDiv);
      return this[name];
    }

    let buttons = [
      createButtons('assignButton', toTheme('jqx-icon-plus')),
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

    let assignButtonOptions: jqwidgets.ButtonOptions =
      {
        width: 80, height: 25, value: 'Assign',
        imgSrc: '/img/add.png',
        imgPosition: 'center', textPosition: 'center',
        textImageRelation: 'imageBeforeText'
      }

    this.assignButton = jqwidgets.createInstance(buttons[0], 'jqxButton', assignButtonOptions);
    this.myAddButton = jqwidgets.createInstance(buttons[1], 'jqxButton', addButtonOptions);
    this.myDeleteButton = jqwidgets.createInstance(buttons[2], 'jqxButton', otherButtonsOptions);

    let AssignTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Assign languages to apps'
      }

    let addTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Add'
      }

    let deleteTooltopOptions: jqwidgets.TooltipOptions =
      {
        position: 'bottom', content: 'Delete'
      }

    let myAssignToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[0], 'jqxTooltip', AssignTooltopOptions);
    let myDeleteToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[1], 'jqxTooltip', deleteTooltopOptions);
    let myAddToolTip: jqwidgets.jqxTooltip = jqwidgets.createInstance(buttons[2], 'jqxTooltip', addTooltopOptions);

    this.assignButton.addEventHandler('click', (event: any) => {
      if (this.appId == "" || typeof this.appId == 'undefined' || this.appId == null) {
        this.utils.iAlert('error', 'Error', 'No app is selected');
        return false;
      }

      let langNames = [];
      let publishing = false;
      let selectedIndexes = this.langGrid.getselectedrowindexes();
      let length = selectedIndexes.length;

      for (let i = 0; i < length; i++) {
        let index = selectedIndexes[i];
        var datarow = this.langGrid.getrowdata(index);

        langNames.push(datarow["name"]);
      }

      var obj = {
        "languages": langNames
      };

      this.langService.assignLanguageToApp(this.appId, obj)
        .then(res => {
          if (res) {
            this.utils.iAlert('success', '', 'Langugage are assigned successfully');
            this.doneEvent.emit(langNames);
          }
        });
    });

    this.myAddButton.addEventHandler('click', (event: any) => {
      if (!this.myAddButton.disabled) {
        this.langId = "";
        this.langObj = { name: "", code: "" };

        this.langWindow.setTitle("Add language");
        this.langWindow.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this Language.?", "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              var datarow = this.langGrid.getrowdata(this.rowIndex)
              this.deletelang(datarow["_id"], (res) => {
                if (res) {
                  this.langId = "";
                  this.utils.iAlert('success', '', 'Language deleted successfully!!!');
                  this.reloadGrid();
                  this.updateButtons('delete');
                  this.langWindow.close();
                }
              });
            }
          })
        } else {
          this.utils.iAlert('error', 'Error', 'Please select the Language!!!');
        }
      }
    });
  };

  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'code', type: 'string' }
  ];

  isNumberRenderer = (row: number, column: any, value: string): string => {
    var id = parseInt(value) + 1;

    return '<span style="margin-left: 4px; margin-top: 9px; float: left;">' + id + '</span>';
  };

  columns: any[] =
    [
      {
        text: 'SNo.', dataField: '', columntype: 'number', width: 50, editable: false,
        sortable: false, cellsalign: 'left', align: 'center', cellsrenderer: this.isNumberRenderer
      },
      {
        text: '_id', hidden: true, datafield: '_id', sortable: false
      },
      {
        text: 'Name', datafield: 'name', width: 130, sortable: true, cellsalign: 'left', align: 'center'
      },
      {
        text: 'Code', width: 70, datafield: 'code', sortable: true, cellsalign: 'left',
        align: 'center'
      }
    ];

  rowdoubleclick(event: any): void {
    let args = event.args;
    this.rowIndex = args.rowindex;
    let datarow = this.langGrid.getrowdata(this.rowIndex);

    if (!this.utils.isEmptyObject(datarow)) {
      this.assingDataToObject(datarow);
      this.updateButtons('Edit');
      this.langWindow.setTitle("Update Language");
      this.langWindow.open();
    }
  };

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    let data = event.args.row;

    if (!this.utils.isEmptyObject(data)) {
      this.assingDataToObject(data);
    }
    // this.updateButtons('Select');
  };

  onRowUnselect(event: any): void {
  };

  addWindowOpen() {
  };

  ngAfterViewInit(): void {
    let value = this.langGrid.getrows();
  };

  onBindingComplete(event: any): void {
    var indexes = [];
    var rowID = this.langGrid.getrowid(0);
    let langDatas = this.langGrid.getrows();
    this.langGrid.clearselection();
    let length = this.languages.length;

    for (let i = 0; i < length; i++) {
      let record = this.languages[i];
      var langData = _.findWhere(langDatas, { name: record });

      if (langData) {
        let rIndex = this.langGrid.getrowboundindexbyid(langData["_id"]);

        if (rIndex > 0) {
          indexes.push(rIndex);

          this.langGrid.selectrow(rIndex);
        }
      }
    }
  };

  assingDataToObject(data: object) {
    this.langId = data["_id"];

    if (!this.utils.isNullOrEmpty(data["name"])) {
      this.langObj["name"] = data["name"];
    } else {
      this.langObj["name"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["code"])) {
      this.langObj["code"] = data["code"];
    } else {
      this.langObj["code"] = "";
    }
  };

  addWindowClose() {
    this.langObj = { name: "", code: "" };

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

  getlangObject(langObj: object) {
    var obj = {};

    obj["name"] = langObj["name"];
    obj["code"] = langObj["code"];

    if (this.langId.length > 12) {
      obj["updatedOn"] = (new Date()).toUTCString();
    } else {
      obj["createdOn"] = (new Date()).toUTCString();
    }

    return obj;
  };

  savelang(id: any, langObj: object, cb?: any) {
    var obj = this.getlangObject(langObj);

    if (id.length > 12) {
      this.langService.updateLanguage(id, obj)
        .then(res => {
          if (res) {
            cb(res)
          }
        });

    } else {
      this.langService.saveLanguage(obj)
        .then(res => {
          if (res) {
            cb(res)
          }
        });
    }
  };

  deletelang(id: any, cb?: any) {
    this.langService.deleteLanguage(id)
      .then(res => {
        if (res) {
          cb(true);
        }
      });
  };

  onSubmit() {
    var obj = this.langObj;

    this.savelang(this.langId, obj, (res) => {
      if (res) {

        if (this.langId.length > 12) {
          this.utils.iAlert('success', '', 'Langugage updated successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Langugage saved successfully!!!');
        }

        this.langId = res._id;
        this.reloadGrid();
        this.langWindow.close();
      }
    });
  };

  reloadGrid() {
    let dataSource = {
      datatype: "json",
      id: '_id',
      url: '/language/list',
      datafields: this.datafields,
    }

    let adapter = new jqx.dataAdapter(dataSource);

    this.langGrid.source(adapter);
  }

  onFormReset() {
    this.langForm.resetForm();
    this.langObj = { name: "", code: "" };
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("organizationId") && !this.utils.isNullOrEmpty(cHObj["organizationId"]["currentValue"])) {
      let obj = cHObj["organizationId"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(obj["previousValue"]) && obj["previousValue"] !== obj["currentValue"]) {
        //  this.langGrid.refreshdata();

        // this.reloadGrid();
      }

      if (obj["firstChange"]) {
        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/language/list',
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.langGrid.source(this.dataAdapter);
        }
      }
    }
  };

  ngOnInit() {
  }
}
