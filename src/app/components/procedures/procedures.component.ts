import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { Utils } from '../../helpers/utils';
import { ProcedureService } from '../../services/procedure.service';

declare var $: any;
declare var combobox: any;

@Component({
  selector: 'procedures',
  templateUrl: './procedures.component.html',
  styleUrls: ['./procedures.component.css']
})
export class ProceduresComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private procedureService: ProcedureService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private renderer: Renderer) {
    this.utils = Utils;
  }

  organizations: any[] = [];
  private orgChangeDetect: any;
  oid: string = "";
  utils: any; 
  draggedTiles: any[] = [];
  tileDropped: Object = {};
  tilesToUpdate: any[] = [];
  isMerge: Object = {};
  droppedTile: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  procedureFilter: Object = {
    "procedureSearch": "",
    "procedureCategory": { "_id": "-1", "fieldName": "category" },
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"],
        "type": ["categoryName"]
      }
    },
  };

  procedures :any [] = [];
  dragIndex: number = -1;

  getTileContent(tileObj: any) {
    
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    //this.destroyScroll();

    this.mScrollbarService.initScrollbar('#dragged-procedure-tiles', this.scrollbarOptions);
    
    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#dragged-procedure-tiles");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#dragged-procedure-tiles"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#dragged-procedure-tiles"]);
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  resetProcedureDatas(){
    this.resetSort();
    this.resetProcedure();
    this.procedures = [];
    this.oid = "";
  };

  resetSort(){
    this.procedureFilter["procedureSearch"] = ""
    this.procedureFilter["procedureCategory"]["_id"] = "-1";
    this.procedureFilter["sort"]["selected"] = "date_desc";
    this.procedureFilter["sort"]["isAsc"] = false;
  };

  resetProcedure(mergeReset?: string){
    this.dragIndex = -1;
    this.droppedTile = {};
    this.isMerge = {};
    this.tilesToUpdate = [];
    this.draggedTiles = [];

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.setScrollList();
      this.resetProcedureDatas();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
    });
  };
}
