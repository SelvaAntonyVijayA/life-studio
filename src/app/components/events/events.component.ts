import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { Utils } from '../../helpers/utils';
import { EventService } from '../../services/event.service';
//declare var swal: any;
declare var $: any;
declare var combobox: any;
declare var editableSelect: any;

@Component({
  selector: 'app-events',
  outputs: ["dropped"],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],

})
export class EventsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private eventService: EventService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private renderer: Renderer, ) {
    this.utils = Utils;
  }


  /* Variables Intialization*/

  organizations: any[] = [];
  selectedOrganization: string = "-1";
  private orgChangeDetect: any;
  oid: string = "";
  eventTiles: any[] = [];
  //draggedTiles: any[] = [];
  tileDropped: Object = {};
  @ContentChild(DraggableDirective) dragDir: DraggableDirective;
  droppedTile: Object = {};
  event: Object = {};
  dragIndex: number = -1;
  utils: any;
  eventStart: any = "";
  availableEnd: any = "";
  groupType: string = "list";
  events: any[] = [];
  eventCategories: any[] = [];
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  @ViewChild('mySelect') mySelect: ElementRef;
  eventFilter: Object = {
    "eventSearch": "",
    "eventCategory": { "_id": "-1", "fieldName": "category" },
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"],
        "type": ["categoryName"]
      }
    }
  };

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  }

  /* Setting for default dragged tile */
  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(),
      "tile": tile, "type": "-1", "activityTitle": "",
      "shortDescription": "", "activityDate": ""
    };

    return dragged;
  };

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
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

  getDate(dat: any) {
    var corsus = dat;
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

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    //this.destroyScroll();

    this.mScrollbarService.initScrollbar('#main-container-events', this.scrollbarOptions);
    this.mScrollbarService.initScrollbar('#dragged-event-tiles', this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-events");
      this.cms["appDatas"]["scrollList"].push("#dragged-event-tiles");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-events", "#dragged-event-tiles"];
    }
  };

  destroyScroll() {
    this.cms.destroyScroll(["#event_main_container", "#dragged-event-tiles"]);
  };

  moveUpDown(move: string, idx: number) {
    var totalIdx = this.event["draggedTiles"].length - 1;
    var fromIdx = totalIdx === idx ? 0 : idx === 0 ? totalIdx : totalIdx - idx;
    var toIdx = totalIdx === 0 ? 0 : move === "up" ? fromIdx + 1 : fromIdx - 1;

    this.utils.arrayMove(this.event["draggedTiles"], fromIdx, toIdx);
  };

  resetEventDatas() {
    //this.draggedTiles = [];
    this.eventFilter["eventSearch"] = ""
    this.eventFilter["eventCategory"]["_id"] = "-1";
    this.eventFilter["sort"]["selected"] = "date_desc";
    this.eventFilter["sort"]["isAsc"] = false;
    this.events = [];
    this.dragIndex = -1;
    this.droppedTile = {};
    this.event = {};
    this.oid = "";
  };

  replicateTile(obj: any) {
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile") ? obj["tile"] : {};
    var replicatedTile = this.setDefaultDraggedTile(replicateTile);
    this.event["draggedTiles"].push(replicatedTile);
  };

  /* Save Event */
  saveEvent() {
    var eventStart = this.utils.toUTCDateTime(this.eventStart);
    //var sampTest = this.utils.toLocalDateTime("2017-10-23T10:28:59.000Z");

    /*swal({
      'title': '<h2 style="font-size:15px;">Event Saved Sucessfully</h2>'
    });*/
  };

  /* Fetching Event datas */
  getEvents(eventId?: string) {
    this.eventService.eventList(this.oid, eventId).then(eventList => {
      this.events = eventList;
    });
  };

  /*Event Notification Icon Check Conditions */
  eventNotificationIcon(evt: any) {
    if (evt && evt.hasOwnProperty("notification") && evt.notification.hasOwnProperty("apps") && evt.notification.apps.length > 0) {
      for (let i = 0; i < evt.notification.apps.length; i++) {
        evt["tileNotifications"] = i === 0 ? evt.notification.apps[i]["name"] : ", " + evt.notification.apps[i]["name"];
      }
    }

    if (evt && evt.hasOwnProperty("Apps") && evt.Apps.length > 0) {
      for (let i = 0; i < evt.Apps.length; i++) {
        evt["pageApps"] = i === 0 ? evt.Apps[i]["appName"] : evt.Apps[i]["appName"];
      }
    }

    if (evt && evt.hasOwnProperty("smart") && evt.smart.hasOwnProperty("apps") && evt.smart.apps.length > 0) {
      for (let i = 0; i < evt.Apps.length; i++) {
        evt["tileSmart"] = i === 0 ? evt.Apps[i]["name"] : evt.Apps[i]["name"];
      }
    }
  };

  /* Fetching Event Categories */
  getEventCategories() {
    this.eventService.getEventCategories(this.oid).then(eventCategoriesList => {
      this.eventCategories = eventCategoriesList;
    });
  };

  /* Fetching both event and event categories */
  listEventCategories() {
    this.eventService.eventCategoriesList(this.oid).subscribe(listEvtCat => {
      this.eventCategories = listEvtCat[0];
      this.events = listEvtCat[1];
      this.mergeCategoryName();
    });
  };

  mergeCategoryName() {
    for (let i = 0; i < this.events.length; i++) {
      var evtCatId = this.events[i].hasOwnProperty("category") ? this.events[i]["category"] : "-1";
      var index = -1;

      if (evtCatId !== "-1" && this.eventCategories.length > 0) {
        index = this.eventCategories.map(function (evtCat) { return evtCat['_id']; }).indexOf(evtCatId);
      }

      this.events[i]["categoryName"] = index !== -1 && this.eventCategories[index].hasOwnProperty("name") ? this.eventCategories[index]["name"] : "";
    }
  };

  setEventType() {
    var eventType = this.e1.nativeElement.querySelector('.event_type');
    // var nous = combobox;
  };

  /*selectFilter(e: any) {
    var text = e.target.value;

    if (!this.utils.isNullOrEmpty(text)) {
      let event = new MouseEvent('mousedown', { bubbles: true });
      this.mySelect.nativeElement.dispatchEvent(event);
      //this.mySelect.nativeElement.;

      //let event = new MouseEvent('mousedown', { bubbles: true });
      //this.mySelect.nativeElement.;
      //event.stopPropagation();

      //this.renderer.invokeElementMethod(
      //this.mySelect.nativeElement, 'dispatchEvent', [event]);
    }
  };*/

  setComboBox() {
    var self = this;
    var eventTypeElem = this.mySelect;
    var customCombo = this.e1.nativeElement.querySelector('.custom_combobox');

    if (this.utils.isNullOrEmpty(customCombo)) {
      $(eventTypeElem.nativeElement).combobox({
        selectchange: function (e, ui) {
          if ($.trim(ui.inputbox.val()) == '') {
            return;
          }

          var isConfirm = confirm("The entered category didn't match with existing, would you like to add press OK.");

          if (isConfirm) {
            var currEventCategory = ui.value;
            var eventCatObj = {
              "name": ui.value,
              "organizationId": self.oid
            };

            self.eventService.saveEventCategory(eventCatObj)
              .then(catObj => {
                if (!self.utils.isEmptyObject(catObj) && catObj.hasOwnProperty("_id")) {
                  eventCatObj["_id"] = catObj["_id"];
                  self.eventCategories.push(eventCatObj);
                } else if (!self.utils.isEmptyObject(catObj) && catObj.hasOwnProperty("error")) {
                  console.log(catObj.error)
                }
              });
          } else {
            ui.element.val("");
            ui.inputbox.val("");
            ui.inputbox.data("ui-autocomplete").term = "";
          }
        }
      });
    }
  };

  /* Filter Changing */
  filterChange(val: any, fieldName: string) {
    if (fieldName === "eventCategory") {
      this.eventFilter[fieldName]["_id"] = val;
    }

    if (fieldName === "sort") {
      var sortOpt = val.split("_");
      this.eventFilter[fieldName]["selected"] = val;
      this.eventFilter[fieldName]["isAsc"] = sortOpt[1] === "asc" ? true : false;
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.setComboBox();
      this.setScrollList();
      this.resetEventDatas();
      this.setOrganizations();
      this.oid = Cookie.get('oid');
      //this.getEvents();
      //this.getEventCategories();
      this.listEventCategories();
      this.selectedOrganization = this.oid;
      //this.setEventType();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
