import { Component, OnInit, OnDestroy, EventEmitter, ContentChild } from '@angular/core';
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

  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(),
      "tile": tile, "type": "-1", "activityTitle": "",
      "shortDescription": "", "activityDate": ""
    };

    return dragged;
  };

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

  resetTriggerTypes(dragTile: any, type: string) {
    if (type == "activate") {
      delete dragTile["stopType"];
      delete dragTile["delayToActivate"];
      delete dragTile["timeToActivate"];
    }

    delete dragTile["delayToDeActivate"];
    delete dragTile["timeToDeActivate"];
  }

  private onDrop(event) {
    var draggedTile = this.setDefaultDraggedTile(event);

    if (this.event.hasOwnProperty("draggedTiles")) {
      if (this.dragIndex === -1) {
        this.event["draggedTiles"].push(draggedTile);
      } else {
        var currIdx = this.dragIndex;
        this.event["draggedTiles"][currIdx] = draggedTile;
        this.dragIndex = -1;
      }
    } else {
      this.event["draggedTiles"] = [draggedTile];
    }

    this.droppedTile = event;
  };

  deleteDraggedTile(idx: number) {
    this.droppedTile = {};

    var tile = this.event["draggedTiles"][idx]["tile"];
    this.droppedTile = !this.utils.isEmptyObject(tile) ? Object.assign({}, tile) : {};
    this.event["draggedTiles"].splice(idx, 1);
  };

  getTileContent(tileObj: any) {
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  trackByUniqueId(index: number, obj: any) {
    return obj["uniqueId"];
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
      //var halfIndex = (totalIdx) / 2;
      //var isDecimalIdx = this.utils.isDecimal(halfIndex);
      var toIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx - 1 : (totalIdx - idx) - 1 === this.dragIndex ? this.dragIndex : this.dragIndex > totalIdx - idx ? totalIdx - idx : (totalIdx - idx) - 1;

      if (fromIdx !== toIdx) {
        this.utils.arrayMove(this.event["draggedTiles"], fromIdx, toIdx);
        var move = this.event["draggedTiles"];
        this.dragIndex = toIdx;
      }
    }
  };

  setScrollList() {
    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#event_main_container");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#event_main_container"];
    }
  };

  resetEventDatas() {
    //this.draggedTiles = [];
    this.droppedTile = {};
  };

  ngOnInit() {
    this.setScrollList();

    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
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
