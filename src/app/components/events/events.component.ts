import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ContentChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { Utils } from '../../helpers/utils';


@Component({
  selector: 'app-events',
  outputs: ["dropped"],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService) {
    this.utils = Utils;
  }
  
          /* Variables Intialization*/

  organizations: any[] = [];
  selectedOrganization: string = "-1";
  private orgChangeDetect: any;
  public scrollbarOptions = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  eventTiles: any[] = [];
  //draggedTiles: any[] = [];
  tileDropped: Object = {};
  @ContentChild(DraggableDirective) dragDir: DraggableDirective;
  droppedTile: Object = {};
  event: Object = {};
  dragIndex: number = -1;
  utils: any;
  //currObj: any = this;
            
          /* Organizations Intialization */

  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };
          /* Setting for default dragged tile */

  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(),
      "tile": tile, "type": "-1", "activityTitle": "",
      "shortDescription": "", "activityDate": ""
    };

    return dragged;
  };
  
          /* Setting dragged tile */

  setDragTile(triggerType: any, dragTile: any, type: string) {
    this.resetTriggerTypes(dragTile, type);

    if (type == "activate") {
      dragTile["type"] = triggerType;

      if (triggerType == "manual" || triggerType == "delay" || triggerType == "time") {
        dragTile["stopType"] = "-1";
      }

      if (triggerType == "delay") {
        dragTile["delayToActivate"] = "";
      }

      if (triggerType == "time") {
        dragTile["timeToActivate"] = "";
      }
    }

    if (type == "deactivate") {
      dragTile["stopType"] = triggerType;

      if (triggerType == "aftertile" || triggerType == "aftertrigger") {
        dragTile["delayToDeActivate"] = "";
      } else if (triggerType == "time") {
        dragTile["timeToDeActivate"] = "";
      }
    }
  }
  
          /* Resetting dragged tile trigger resetting */

  resetTriggerTypes(dragTile: any, type: string) {
    if (type == "activate") {
      delete dragTile["stopType"];
      delete dragTile["delayToActivate"];
      delete dragTile["timeToActivate"];
    }

    delete dragTile["delayToDeActivate"];
    delete dragTile["timeToDeActivate"];
  };

          /* Dragged tile on drop*/

  private onDrop(event, isDynamic) {
    var draggedTile = this.setDefaultDraggedTile(event);

    if (this.event.hasOwnProperty("draggedTiles")) {
      if (this.dragIndex === -1) {
        this.event["draggedTiles"].push(draggedTile);
      } else {
        var currIdx = this.dragIndex;

        if (!isDynamic) {
          this.event["draggedTiles"].splice(currIdx, 1);
        } else {
          this.event["draggedTiles"][currIdx] = draggedTile;
        }

        this.dragIndex = -1;
      }
    } else {
      this.event["draggedTiles"] = [draggedTile];
    }

    this.droppedTile = event;
  };
  
           /* Deleting current dragged tile */

  deleteDraggedTile(idx: number) {
    this.droppedTile = {};
    var totalIdx = this.event["draggedTiles"].length - 1;
    var currIdx = totalIdx - idx;

    var tile = this.event["draggedTiles"][currIdx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.event["draggedTiles"].splice(currIdx, 1);
  };

  getTileContent(tileObj: any) {
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };
            /* Dragged tile by uniqueId */

  trackByUniqueId(index: number, obj: any, currObj: any) {
    return obj["uniqueId"];
  };
            
            /* Setting Drag Index for every tile index change */

  setDragIndex(idx: number, obj: any) {
    if (this.dragIndex !== -1 && !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("eventDragContainer")) {
      var totalIdx = this.event["draggedTiles"].length - 1;

      this.dragIndex = !idx ? -1 : totalIdx - idx;
    }
  };

  getUniqueId() {
    var uniqueId = Date.now() + Math.floor(1000 + Math.random() * 9000);

    return uniqueId;
  };

            /* Adding Dynamic draggable */

  addDraggable(idx: number) {
    var dragged = { "uniqueId": this.getUniqueId(), "eventDragContainer": true };
    var totalIdx = this.event["draggedTiles"].length - 1;


    if (this.dragIndex === -1) {
      this.dragIndex = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
      this.event["draggedTiles"].splice(this.dragIndex, 0, dragged);
    } else if (this.dragIndex > -1) {
      var fromIdx = this.dragIndex;
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.event["draggedTiles"], fromIdx, toIdx);
        var move = this.event["draggedTiles"];
        //this.dragIndex = toIdx;
      }
    }
  };

          /* Intial scroll list intialization */

  setScrollList() {
    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#event_main_container");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#event_main_container"];
    }
  };

  moveUpDown(move: string, idx: number) {
    var totalIdx = this.event["draggedTiles"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx; 
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.event["draggedTiles"], fromIdx, toIdx);
  };

  resetEventDatas() {
    //this.draggedTiles = [];
    this.dragIndex = -1;
    this.droppedTile = {};
    this.event = {};
    this.oid = "";
  };

  replicateTile(obj: any){ 
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile")? obj["tile"] : {};
    var replicatedTile = this.setDefaultDraggedTile(replicateTile);
    this.event["draggedTiles"].push(replicatedTile);
  };

  ngOnInit() {
    this.setScrollList();

    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.resetEventDatas();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
      this.selectedOrganization = this.oid;
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.cms.destroyScroll(["#event_main_container"]);
  };
}
