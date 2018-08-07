import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { LivestreamService } from '../../services/livestream.service';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'stream-grid',
  templateUrl: './stream.component.html'
})

export class StreamComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('engines') engines: any;
  @Input('appId') appId: any;
  @Input('appName') appName: any;
  @Input('isChat') isChat;
  @Input('locationId') locationId: any;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @Input('isAdvancedStream') isAdvancedStream: boolean = false;
  @ViewChild('streamGrid') streamGrid: jqxGridComponent;
  @ViewChild('streamWindow') streamWindow: jqxWindowComponent;
  @ViewChild('streamForm') streamForm: NgForm;
  @Output('onSelectStream') onSelectStream = new EventEmitter();
  dataAdapter: any;
  isAdvancedDisabled: boolean = false;
  source: any;
  rowIndex: number;
  streamObj: object = {
    name: "", organizationId: "", locationId: "", url: "", urlAndroid: "", urlWeb: "",
    reportAbuse: "", isAdvanced: false, chat: false, createdApp: {}
  };
  streamId: string;
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private streamService: LivestreamService,
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
        if (this.appId == "" || typeof this.appId == 'undefined' || this.appId == null) {
          this.utils.iAlert('error', 'Error', 'No app is selected');
          return false;
        }

        if (this.locationId == "" || typeof this.locationId == 'undefined' || this.locationId == null) {
          this.utils.iAlert('error', 'Error', 'No location is selected');
          return false;
        }

        this.streamId = "";
        this.streamObj = {
          name: "", organizationId: "", locationId: "", url: "", urlAndroid: "", urlWeb: "",
          reportAbuse: "", isAdvanced: false, chat: false, createdApp: {}
        };

        if (this.isAdvancedStream) {
          this.isAdvancedDisabled = false;
        } else {
          this.isAdvancedDisabled = true;
        }

        this.streamWindow.setTitle("Add Stream");
        //this.streamWindow.position({ x: 600, y: 90 });
        this.streamWindow.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this stream.?", "Yes", "No", (res) => {
            if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
              var datarow = this.streamGrid.getrowdata(this.rowIndex)
              this.deleteStream(datarow["_id"], (res) => {
                if (res) {
                  this.streamId = "";
                  this.utils.iAlert('success', '', 'Stream deleted successfully');
                  this.reloadGrid();
                  this.updateButtons('delete');
                  this.streamWindow.close();
                }
              });
            }
          })
        } else {
          this.utils.iAlert('error', 'Error', 'Please select the stream!!!');
        }
      }
    });
  };

  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'urlAndroid', type: 'string' },
    { name: 'urlWeb', type: 'string' },
    { name: 'reportAbuse', type: 'string' },
    { name: 'isAdvanced', type: 'boolean' },
    { name: 'organizationId', type: 'string' },
    { name: 'createdApp' },
    { name: 'createdBy' },
    { name: 'userId', type: 'string' },
    { name: 'locationId', type: 'string' }
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
        text: 'locationId', hidden: true, datafield: 'locationId', sortable: false
      },
      {
        text: 'userId', hidden: true, datafield: 'userId', sortable: false
      },
      {
        text: 'createdApp', hidden: true, datafield: 'createdApp', sortable: false
      },
      {
        text: 'organizationId', hidden: true, datafield: 'organizationId', sortable: false
      },
      {
        text: 'createdBy', hidden: true, datafield: 'createdBy', sortable: false
      },
      {
        text: 'Title', datafield: 'name', width: 140, sortable: true, cellsalign: 'left', align: 'center'
      },
      {
        text: 'Stream Url', width: 160, datafield: 'url', sortable: true, cellsalign: 'left',
        align: 'center'
      },
      {
        text: 'Andriod Stream Url', Title: "", editable: false, datafield: 'urlAndroid', width: 150, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Web Stream Url', datafield: 'urlWeb', width: 155, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Report Abuse', datafield: 'reportAbuse', width: 150, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'isAdvanced', datafield: 'isAdvanced', threestatecheckbox: true, columntype: 'checkbox', sortable: true, cellsalign: 'left',
        align: 'center', width: 75
      },
    ];

  rowdoubleclick(event: any): void {
    let args = event.args;
    this.rowIndex = args.rowindex;
    let datarow = this.streamGrid.getrowdata(this.rowIndex);

    if (!this.utils.isEmptyObject(datarow)) {
      this.assingDataToObject(datarow);

      if (this.isAdvancedStream) {
        this.isAdvancedDisabled = false;
      } else {
        this.isAdvancedDisabled = true;
      }

      this.updateButtons('Edit');
      this.streamWindow.setTitle("Update stream");
      //this.streamWindow.position({ x: 600, y: 90 });
      this.streamWindow.open();
      this.emitSelectEvent();
    }
  };

  emitSelectEvent() {
    let rowID = this.streamGrid.getrowid(this.rowIndex);
    let streamDatas = this.streamGrid.getrows();
    let ids = _.pluck(streamDatas, '_id');
    let obj = {};
    obj["_id"] = rowID;
    obj["ids"] = ids;

    this.onSelectStream.emit(obj);
  }

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    let data = event.args.row;

    if (!this.utils.isEmptyObject(data)) {
      this.assingDataToObject(data);
      this.emitSelectEvent();

      setTimeout(() => {
        this.updateButtons('Edit');
      }, 0);
    }
  };

  onRowUnselect(event: any): void {
  };

  addWindowOpen() {
  };

  ngAfterViewInit(): void {
    let value = this.streamGrid.getrows();
  };

  onBindingComplete(event: any): void {
    /*this.streamGrid.selectrow(0);
    var rowID = this.streamGrid.getrowid(0);
    let streamDatas = this.streamGrid.getrows();
    let ids = _.pluck(streamDatas, '_id');
    let obj = {};
    obj["_id"] = rowID;
    obj["ids"] = ids;

     this.onEndAppLoad.emit(obj);*/
  };

  assingDataToObject(data: object) {
    this.streamId = data["_id"];

    if (!this.utils.isNullOrEmpty(data["name"])) {
      this.streamObj["name"] = data["name"];
    } else {
      this.streamObj["name"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["url"])) {
      this.streamObj["url"] = data["url"];
    } else {
      this.streamObj["url"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["urlAndroid"])) {
      this.streamObj["urlAndroid"] = data["urlAndroid"];
    } else {
      this.streamObj["urlAndroid"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["urlWeb"])) {
      this.streamObj["urlWeb"] = data["urlWeb"];
    } else {
      this.streamObj["urlWeb"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["reportAbuse"])) {
      this.streamObj["reportAbuse"] = data["reportAbuse"];
    } else {
      this.streamObj["reportAbuse"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["isAdvanced"])) {
      this.streamObj["isAdvanced"] = data["isAdvanced"];
    } else {
      this.streamObj["isAdvanced"] = false;
    }
  };

  addWindowClose() {
    this.streamObj = {
      name: "", organizationId: "", locationId: "", url: "", urlAndroid: "", urlWeb: "",
      reportAbuse: "", isAdvanced: false, chat: false, createdApp: {}
    };

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

  getStreamObject(streamObj: object) {
    var obj = {};

    obj["name"] = streamObj["name"];
    obj["url"] = streamObj["url"];
    obj["urlAndroid"] = streamObj["urlAndroid"];
    obj["urlWeb"] = streamObj["urlWeb"];
    obj["reportAbuse"] = streamObj["reportAbuse"];
    obj["organizationId"] = this.organizationId;
    obj["locationId"] = this.locationId;
    obj["chat"] = this.isChat;
    obj["isAdvanced"] = streamObj["isAdvanced"];

    if (this.streamId.length > 12) {
      obj["updatedOn"] = (new Date()).toUTCString();
    } else {
      obj["createdOn"] = (new Date()).toUTCString();
      obj["createdApp"] = {
        "id": this.appId,
        "name": this.appName
      };
    }

    return obj;
  };

  saveStream(id: any, streamObj: object, cb?: any) {
    var obj = this.getStreamObject(streamObj);

    if (id.length > 12) {
      this.streamService.updateStream(id, obj)
        .subscribe(res => {
          if (res) {
            cb(res)
          }
        });

    } else {
      this.streamService.saveStream(obj)
        .subscribe(res => {
          if (res) {
            cb(res)
          }
        });
    }
  };

  deleteStream(id: any, cb?: any) {
    this.streamService.deleteStream(id)
      .subscribe(res => {
        if (res) {
          cb(true);
        }
      });
  };

  onSubmit() {
    var obj = this.streamObj;

    if (this.appId == "" || typeof this.appId == 'undefined' || this.appId == null) {
      this.utils.iAlert('error', 'Error', 'No app is selected');
      return false;
    }

    if (this.locationId == "" || typeof this.locationId == 'undefined' || this.locationId == null) {
      this.utils.iAlert('error', 'Error', 'No location is selected');
      return false;
    }

    this.saveStream(this.streamId, obj, (res) => {
      if (res) {

        if (this.streamId.length > 12) {
          this.utils.iAlert('success', '', 'Stream updated successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Stream saved successfully!!!');
        }

        this.streamId = res._id;
        this.streamGrid.refreshdata();
        this.reloadGrid();

        this.streamWindow.close();
      }
    });
  };

  reloadGrid() {
    var url = '/livestream/list/' + this.organizationId + "/" + this.appId

    if (!this.utils.isNullOrEmpty(this.locationId)) {
      url += "/" + this.locationId;
    }

    let dataSource = {
      datatype: "json",
      id: '_id',
      url: url,
      datafields: this.datafields,
    }

    let adapter = new jqx.dataAdapter(dataSource);

    this.streamGrid.source(adapter);
  }

  onFormReset() {
    this.streamForm.resetForm();
    this.streamObj = {
      name: "", organizationId: "", locationId: "", url: "", urlAndroid: "", urlWeb: "",
      reportAbuse: "", isAdvanced: false, chat: false, createdApp: {}
    };
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
        var url = '/livestream/list/' + this.organizationId + "/" + this.appId

        if (!this.utils.isNullOrEmpty(this.locationId)) {
          url += "/" + this.locationId;
        }

        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: url,
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.streamGrid.source(this.dataAdapter);
        }
      }
    }

    if (cHObj.hasOwnProperty("locationId") && !this.utils.isNullOrEmpty(cHObj["locationId"]["currentValue"])) {
      let obj = cHObj["locationId"];
      var prev = obj["previousValue"];
      var cur = obj["currentValue"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(prev) && prev !== cur) {
        this.reloadGrid();
      }

      if (!obj["firstChange"] && this.utils.isNullOrEmpty(prev) && !this.utils.isNullOrEmpty(cur)) {
        this.reloadGrid();
      }

      if (obj["firstChange"]) {
        this.locationId = cur;

        var url = '/livestream/list/' + this.organizationId + "/" + this.appId

        if (!this.utils.isNullOrEmpty(this.locationId)) {
          url += "/" + this.locationId;
        }

        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: url,
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.streamGrid.source(this.dataAdapter);
        }
      }
    }
  };

  ngOnInit() {
  }
}

