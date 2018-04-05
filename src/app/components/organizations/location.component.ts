import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { LocationService } from '../../services/location.service';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder, NgForm } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'location-grid',
  templateUrl: './location.component.html'
})
export class LocationComponent implements OnInit {
  @Input('orgId') organizationId: string;
  @Input('appId') appId: string;
  @Input('orgtype') orgType: string;
  @Input('height') height: string;
  @Input('width') width: string;
  dataAdapter: any;
  source: any;
  rowIndex: number;
  locationObj: object = { name: "", group: "", phone: "", address: "", city: "", state: "", longitude: "", latitude: "", radius: "", status: "", appId: "" };
  myAddButton: jqwidgets.jqxButton;
  myDeleteButton: jqwidgets.jqxButton;
  @ViewChild('locationGrid') locationGrid: jqxGridComponent;
  @ViewChild('locationWindow') locationWindow: jqxWindowComponent;
  @ViewChild('locationForm') locationForm: NgForm;
  locationId: string;
  @Output('onSelectLocation') onSelectLocation = new EventEmitter();

  statusSource: any =
    {
      datafields: [
        { name: 'id', type: 'string' },
        { name: 'field', type: 'string' }
      ],
      localdata: [
        { id: '', field: 'Select Status' },
        { id: 'yes', field: 'Yes' },
        { id: 'No', field: 'No' },
      ]
    };

  statusAdaptor: any = new jqx.dataAdapter(this.statusSource, {
    autoBind: true
  });

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    private locationService: LocationService,
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
        this.locationId = "";
        this.locationObj = { name: "", group: "", phone: "", address: "", city: "", state: "", longitude: "", latitude: "", radius: "", status: "", appId: "" };
        this.locationWindow.setTitle("Add Location");
        this.locationWindow.position({ x: 150, y: 60 });
        this.locationWindow.open();
      }
    });

    this.myDeleteButton.addEventHandler('click', (event: any) => {
      if (!this.myDeleteButton.disabled) {
        if (this.rowIndex != -1) {
          let datarow = this.locationGrid.getrowdata(this.rowIndex);
          let locationId = datarow["_id"];
          let plAssigned = [];
          let recordDeleteMsg = 'Are you sure you want to delete this location?';

          this.locationService.getPreferredLocation(locationId)
            .then(res => {
              if (res) {
                plAssigned = res && res.length > 0 ? res : [];
              }

              if (plAssigned && plAssigned.length > 0) {
                recordDeleteMsg = 'The selected location has been associated to user as preferred location. This will be disassociated after delete.';
              }

              this.utils.iAlertConfirm("confirm", "Confirm", recordDeleteMsg, "Yes", "No", (res) => {
                if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
                  this.deleteLocation(locationId, plAssigned, (res) => {
                    if (res) {
                      this.locationId = "";
                      this.utils.iAlert('success', '', 'Location has been deleted successfully');
                      this.reloadGrid();
                      this.updateButtons('delete');
                      this.locationWindow.close();
                    }
                  });
                }
              });
            });
        } else {
          this.utils.iAlert('error', 'Error', 'Please select the Location!!!');
        }
      }
    });
  };

  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'groupname', type: 'string', map: 'group' },
    { name: 'sname', value: 'status', values: { source: this.statusAdaptor.records, value: 'id', name: 'field' } },
    { name: 'phone' },
    { name: 'address' },
    { name: 'city' },
    { name: 'state' },
    { name: 'longitude', type: 'string' },
    { name: 'latitude', type: 'string' },
    { name: 'radius', type: 'string' },
    { name: 'appId', type: 'string' }
  ];

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
        text: 'Name', datafield: 'name', width: 90, sortable: true, cellsalign: 'left',
        align: 'center'
      },
      {
        text: 'Group', datafield: 'groupname', width: 60, sortable: true, cellsalign: 'left',
        align: 'center'
      },
      {
        text: 'Phone', editable: false, datafield: 'phone', width: 60, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Address', datafield: 'address', width: 90, sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'City', datafield: 'city', width: 60, sortable: true, cellsalign: 'left',
        align: 'center'
      },
      {
        text: 'Longitude', datafield: 'longitude', sortable: true, cellsalign: 'left', align: 'center',
        width: 65
      },
      {
        text: 'Latitude', datafield: 'latitude', sortable: true, cellsalign: 'left', align: 'center',
        width: 65
      },
      {
        text: 'Radius', datafield: 'radius', sortable: true, cellsalign: 'left', align: 'center',
        width: 60
      }, {
        text: 'Status', datafield: 'sname', sortable: true, cellsalign: 'left', align: 'center',
        width: 50
      },
      {
        text: 'appId', hidden: true, datafield: 'appId', sortable: false
      }

    ];

  rowdoubleclick(event: any): void {
    var args = event.args;
    this.rowIndex = args.rowindex;
    var datarow = this.locationGrid.getrowdata(this.rowIndex);

    if (!this.utils.isEmptyObject(datarow)) {
      this.assingDataToObject(datarow);
      this.emitSelectEvent();
      this.updateButtons('Edit');
      this.locationWindow.setTitle("Update Location");
      this.locationWindow.position({ x: 150, y: 40 });
      this.locationWindow.open();
    }
  };

  onRowSelect(event: any): void {
    this.rowIndex = event.args.rowindex;
    var data = event.args.row;

    if (!this.utils.isEmptyObject(data)) {
      this.assingDataToObject(data);
      this.emitSelectEvent();

      setTimeout(() => {
        this.updateButtons('Select');
      }, 0);
    }
  };

  emitSelectEvent() {
    let rowID = this.locationGrid.getrowid(this.rowIndex);
    let obj = {};
    obj["_id"] = rowID;
    this.locationId = rowID;

    this.onSelectLocation.emit(obj);
  }

  onRowUnselect(event: any): void {
  };

  addWindowOpen() {
  };

  ngAfterViewInit(): void {
    let value = this.locationGrid.getrows();
  };

  onBindingComplete(event: any): void {
    var rowID = this.locationGrid.getrowid(0);
    let appDatas = this.locationGrid.getrows();
    let ids = _.pluck(appDatas, '_id');
    let obj = {};
    obj["_id"] = rowID;
    // obj["ids"] = ids;
    // this.locationGrid.selectrow(0);
  };

  assingDataToObject(data: object) {
    this.locationId = data["_id"];
    this.locationObj = { name: data["name"] };

    if (!this.utils.isNullOrEmpty(data["groupname"])) {
      this.locationObj["group"] = data["groupname"];
    } else {
      this.locationObj["group"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["phone"])) {
      this.locationObj["phone"] = data["phone"];
    } else {
      this.locationObj["phone"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["address"])) {
      this.locationObj["address"] = data["address"];
    } else {
      this.locationObj["address"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["city"])) {
      this.locationObj["city"] = data["city"];
    } else {
      this.locationObj["city"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["state"])) {
      this.locationObj["state"] = data["state"];
    } else {
      this.locationObj["state"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["status"])) {
      this.locationObj["status"] = data["status"];
    } else {
      this.locationObj["status"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["appId"])) {
      this.locationObj["appId"] = data["appId"];
    } else {
      this.locationObj["appId"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["longitude"])) {
      this.locationObj["longitude"] = data["longitude"];
    } else {
      this.locationObj["longitude"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["latitude"])) {
      this.locationObj["latitude"] = data["latitude"];
    } else {
      this.locationObj["latitude"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["radius"])) {
      this.locationObj["radius"] = data["radius"];
    } else {
      this.locationObj["radius"] = "";
    }
  };

  addWindowClose() {
    this.locationObj = { name: "", authenticated: "-1", pin: "", googleAnalytics: "", alerts: "", chat: "-1" };
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

    obj["name"] = data["name"];
    obj["appId"] = this.appId;

    if (!this.utils.isNullOrEmpty(data["group"])) {
      obj["group"] = data["group"];
    } else {
      obj["group"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["phone"])) {
      obj["phone"] = data["phone"];
    } else {
      obj["phone"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["address"])) {
      obj["address"] = data["address"];
    } else {
      obj["address"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["city"])) {
      obj["city"] = data["city"];
    } else {
      obj["city"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["state"])) {
      obj["state"] = data["state"];
    } else {
      obj["state"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["status"])) {
      obj["status"] = data["status"];
    } else {
      obj["status"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["longitude"])) {
      obj["longitude"] = data["longitude"];
    } else {
      obj["longitude"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["latitude"])) {
      obj["latitude"] = data["latitude"];
    } else {
      obj["latitude"] = "";
    }

    if (!this.utils.isNullOrEmpty(data["radius"])) {
      obj["radius"] = data["radius"];
    } else {
      obj["radius"] = "";
    }

    return obj;
  };

  saveLocation(id: any, appObj: object, cb?: any) {
    var obj = this.geAppObject(appObj);

    if (id.length > 12) {
      this.locationService.updateLocation(id, obj)
        .then(res => {
          if (res) {
            cb(res)
          }
        });

    } else {
      this.locationService.saveLocation(obj, this.orgType)
        .then(res => {
          if (res) {
            cb(res)
          }
        });
    }
  };

  deleteLocation(locationId: any, plAssigned: any, cb?: any) {
    let plToRemove = [];
    let obj = {};
    obj["_id"] = locationId;

    for (let i = 0; i < plAssigned.length; i++) {
      plToRemove.push(plAssigned[i]._id);
    }

    obj["preferredLocs"] = plToRemove;

    this.locationService.deleteLocation(obj)
      .then(res => {
        if (res) {
          cb(true);
        }
      });
  };

  onSubmit() {
    var obj = this.locationObj;

    this.saveLocation(this.locationId, obj, (res) => {
      if (res) {

        if (this.locationId.length > 12) {
          this.utils.iAlert('success', '', 'Location updated successfully!!!');
        } else {
          this.utils.iAlert('success', '', 'Location saved successfully!!!');
        }

        this.locationId = res._id;
        this.locationGrid.refreshdata();
        this.reloadGrid();

        this.locationWindow.close();
      }
    });
  };

  reloadGrid() {
    let dataSource = {
      datatype: "json",
      id: '_id',
      url: '/location/list/' + this.appId,
      datafields: this.datafields
    }

    let adapter = new jqx.dataAdapter(dataSource);
    this.locationId = "";
    this.locationGrid.source(adapter);
    this.locationGrid.clearselection();
  }

  onFormReset() {
    this.locationForm.resetForm();
    this.locationObj = { name: "", authenticated: "-1", pin: "", googleAnalytics: "", alerts: "", chat: "-1" };
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
        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/location/list/' + this.appId
        };

        if (!this.dataAdapter) {
          this.dataAdapter = new jqx.dataAdapter(this.source);
        } else {
          this.locationGrid.source(this.dataAdapter);
        }
      }
    }
  }
}
