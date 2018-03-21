import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { AppsService } from '../../services/apps.service';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import * as _ from 'underscore';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'app-grid',
  templateUrl: './appgrid.component.html',
  styleUrls: ['./appgrid.component.css']
})
export class AppgridComponent implements OnInit {
  @Input('id') id: string;
  @Input('obj') obj: object;
  @Input('height') height: string;
  @Input('width') width: string;
  dataAdapter: any;
  source: any;

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private appService: AppsService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,

    private loaderShared: LoaderSharedService) { }

  @ViewChild('appGrid') appGrid: jqxGridComponent;

  chatSource: any =
    {
      datafields: [
        { name: 'chat', type: 'string' },
        { name: 'option', type: 'string' },
        { name: 'sno' }
      ],
      localdata: [
        { sno: 1, chat: '0', option: 'Off' },
        { sno: 2, chat: '1', option: 'On' },
        { sno: 3, chat: '2', option: 'Private' }
      ]
    };

  authSource: any =
    {
      datafields: [
        { name: 'authenticated', type: 'string' },
        { name: 'auth', type: 'string' },
        { name: 'sno' }
      ],
      localdata: [
        { sno: 1, authenticated: '0', auth: 'Pre-approved' },
        { sno: 2, authenticated: '1', auth: 'Email' },
        { sno: 3, authenticated: '4', auth: 'Email-Auto Approve' },
        { sno: 4, authenticated: '2', auth: 'Username' },
        { sno: 5, authenticated: '3', auth: 'No Security' },
        { sno: 6, authenticated: '5', auth: 'Late Registration' }
      ]
    };

  chatAdaptor: any = new jqx.dataAdapter(this.chatSource, {
    autoBind: true
  });

  authAdaptor: any = new jqx.dataAdapter(this.authSource, {
    autoBind: true
  });

  datafields: any = [
    { name: '_id', type: 'string' },
    { name: 'authenticated', type: 'string' },
    { name: 'chat', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'authname', value: 'authenticated', values: { source: this.authAdaptor.records, value: 'authenticated', name: 'auth' } },
    { name: 'chatname', value: 'chat', values: { source: this.chatAdaptor.records, value: 'chat', name: 'option' } },
    { name: 'logo', type: 'string' },
    { name: 'startScreenImage', type: 'string' },
    { name: 'website', type: 'string' },
    { name: 'organizationId', type: 'string' },
    { name: 'autoApprove', type: 'string' },
    { name: 'pin', type: 'string' },
    { name: 'googleAnalytics', type: 'string' },
    { name: 'alerts', type: 'string' },
    { name: 'languages', type: 'string' },
    { name: 'publishing', type: 'string' }
  ];

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
        text: 'logo', hidden: true, datafield: 'logo', sortable: false
      },
      {
        text: 'authenticated', hidden: true, datafield: 'authenticated', sortable: false
      },
      {
        text: 'chat', hidden: true, datafield: 'chat', sortable: false
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
        text: 'Secure Auth', displayfield: 'authname', width: 150, columntype: 'dropdownlist', datafield: 'auth',
        sortable: true, cellsalign: 'left', align: 'center',
        createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ autoDropDownHeight: true, source: this.authAdaptor.records, displayMember: 'auth', valueMember: 'authenticated' });
        }
      },
      {
        text: 'PIN', editable: false, datafield: 'pin', width: 70, columntype: 'textbox', sortable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Google Analytics', datafield: 'googleAnalytics', width: 140, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Alerts', datafield: 'alerts', width: 140, columntype: 'textbox', sortable: true, editable: true,
        cellsalign: 'left', align: 'center'
      },
      {
        text: 'Chat', displayfield: 'option', columntype: 'dropdownlist', datafield: 'chatname',
        sortable: true, cellsalign: 'left', align: 'center', width: 100,
        createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ autoDropDownHeight: true, source: this.chatAdaptor.records, displayMember: 'option', valueMember: 'chat' });
        }
      },
    ];


  Rowdoubleclick(event: any): void {
    //  let _id = event.args.row._id;

    this.appGrid.beginrowedit(event.args.rowindex);

    // Do Something
  }

  onRowSelect(event: any): void {
    // let _id = event.args.row._id;

    // Do Something
  }

  onRowUnselect(event: any): void {
    //let _id = event.args.row._id;

    // Do Something
  }

  onRowBeginEdit(event: any): void {
    //let _id = event.args.row._id;
    alert('start')
    // Do Something
  }

  onRowEndEdits(event: any): void {
    //let _id = event.args.row._id;
    alert('end')

    // Do Something
  }

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("id") && !this.utils.isNullOrEmpty(cHObj["id"]["currentValue"])) {
      let obj = cHObj["id"];

      if (!obj["firstChange"] && !this.utils.isNullOrEmpty(obj["previousValue"]) && obj["previousValue"] !== obj["currentValue"]) {
        this.appGrid.refreshdata();

        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/cms/apps/list/' + this.id + '/' + 'admin',
        };

        this.dataAdapter = new jqx.dataAdapter(this.source);
      }

      if (obj["firstChange"]) {
        this.source = {
          datatype: "json",
          id: '_id',
          datafields: this.datafields,
          url: '/cms/apps/list/' + this.id + '/' + 'admin',
        };

        this.dataAdapter = new jqx.dataAdapter(this.source);
      }
    }
  }

  ngOnInit() {
  }

}
