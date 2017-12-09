import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { Utils } from '../../helpers/utils';
import { EventService } from '../../services/event.service';
import { TileService } from '../../services/tile.service';
//declare var swal: any;
declare var $: any;
declare var combobox: any;
declare var editableSelect: any;

@Component({
  selector: 'app-events',
  outputs: ["dropped"],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private eventService: EventService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private renderer: Renderer,
    private tileService: TileService
  ) {
    this.utils = Utils;
  }


  /* Variables Intialization */
  organizations: any[] = [];
  selectedOrganization: string = "-1";
  private orgChangeDetect: any;
  //tileData = new EventEmitter<any>();
  oid: string = "";
  eventTiles: any[] = [];
  draggedTiles: any[] = [];
  tileDropped: Object = {};
  @ContentChild(DraggableDirective) dragDir: DraggableDirective;
  droppedTile: Object = {};
  event: Object = {};
  art: string = "";
  dragIndex: number = -1;
  intervalId: any = -1;
  utils: any;
  eventStart: any = "";
  availableEnd: any = "";
  groupType: string = "list";
  eventName: string = "";
  events: any[] = [];
  eventCategories: any[] = [];
  eventCalendar: boolean = false;
  languageList: any[] = [];
  selectedLanguage: string = "en";
  //selectedEventCategory: string = "-1";
  isMerge: Object = {};
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  @ViewChild('evtCategory') evtCategory: ElementRef;
  eventFilter: Object = {
    "eventSearch": "",
    "eventCategory": { "_id": "-1", "fieldName": "category" },
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"],
        "type": ["categoryName"]
      }
    },
  };

  selectedEvent: Object = {};

  /* Organizations Intialization */
  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  /* Setting for default dragged tile */
  setDefaultDraggedTile(tile: any) {
    var dragged = {
      "uniqueId": this.getUniqueId(), "tile": {},
      "triggerdata": {
        "type": "-1",
        "evtTileToActivate": false,
        "evtTileToDeactivate": false,
        "evtTileNotActivated": false
      },
      "activityTitle": "",
      "shortDescription": "",
      "activityDate": "",
      "dontShowTime": false,
    };

    if (tile && !this.utils.isEmptyObject(tile)) {
      var currTile = {
        "_id": tile.hasOwnProperty("_id") ? tile["_id"] : "-1",
        "title": tile.hasOwnProperty("title") && !this.utils.isNullOrEmpty(tile["title"]) ? tile["title"] : "",
        "art": tile.hasOwnProperty("art") && !this.utils.isNullOrEmpty(tile["art"]) ? tile["art"] : ""
      }

      dragged["tile"] = currTile;
    }

    return dragged;
  };

  setSelectedDraggedTile(dragTile: any) {
    var triggerData = dragTile && dragTile.hasOwnProperty("triggerdata") ? dragTile["triggerdata"] : {};
    var currTile = {};

    if (!this.utils.isEmptyObject(dragTile) && dragTile.hasOwnProperty("tileData")) {
      currTile = dragTile["tileData"];
    }

    var dragged = {
      "uniqueId": this.getUniqueId(),
      "tile": currTile,
      "activityTitle": dragTile && dragTile.hasOwnProperty("activityTitle") ? dragTile.activityTitle : "",
      "shortDescription": dragTile && dragTile.hasOwnProperty("shortDescription") ? dragTile.shortDescription : "",
      "activityDate": dragTile && dragTile.hasOwnProperty("activityDate") ? this.utils.toLocalDateTime(dragTile.activityDate) : "",
      "dontShowTime": dragTile && dragTile.hasOwnProperty("dontShowTime") && typeof dragTile.dontShowTime === "boolean" ? dragTile.dontShowTime : false,
      "triggerdata": {}
    };

    var isTriggerDisable = !this.utils.isEmptyObject(dragTile) && dragTile.hasOwnProperty("tileActivate") && !dragTile["tileActivate"] ? true : false;
    isTriggerDisable = !this.utils.isEmptyObject(dragTile) && dragTile.hasOwnProperty("tileDeActivate") && dragTile["tileDeActivate"] ? false : isTriggerDisable;

    dragged["isTriggerDisable"] = isTriggerDisable;

    if (dragTile && dragTile.hasOwnProperty('tileActivate') && typeof dragTile.tileActivate === "boolean") {
      dragged["activate"] = dragTile.tileActivate;
    }

    if (dragTile && dragTile.hasOwnProperty('tileDeActivate') && typeof dragTile.tileDeActivate === "boolean") {
      dragged["deActivate"] = dragTile.tileDeActivate;
    }

    if (dragTile && dragTile.hasOwnProperty('status')) {
      dragged["status"] = dragTile.status;
    }

    if (triggerData.hasOwnProperty("deactivatedTime")) {
      dragged["triggerdata"]["deactivatedTime"] = this.utils.toLocalDateTime(triggerData["deactivatedTime"]);
    }

    if (triggerData.hasOwnProperty("deactivated")) {
      dragged["triggerdata"]["deactivated"] = triggerData["deactivated"];
    }

    if (triggerData.hasOwnProperty("setActiveTileId")) {
      dragged["triggerdata"]["setActiveTileId"] = triggerData["setActiveTileId"];
    }

    if (triggerData.hasOwnProperty("availableFrom")) {
      dragged["triggerdata"]["availableFrom"] = this.utils.toLocalDateTime(triggerData["availableFrom"]);
    }

    if (triggerData.hasOwnProperty("type")) {
      dragged["triggerdata"]["type"] = triggerData["type"];

      if (triggerData["type"] === "manual" || triggerData["type"] === "delay" || triggerData["type"] === "time") {
        dragged["triggerdata"]["stopType"] = triggerData.hasOwnProperty("stopType") ? triggerData["stopType"] : "-1";

        if (triggerData["type"] === "delay") {
          dragged["triggerdata"]["delayToActivate"] = triggerData.hasOwnProperty("delayToActivate") ? triggerData["delayToActivate"] : "";
        }

        if (triggerData["type"] === "time") {
          dragged["triggerdata"]["timeToActivate"] = triggerData.hasOwnProperty("timeToActivate") ? this.utils.toLocalDateTime(triggerData["timeToActivate"]) : "";
        }

        if (triggerData["stopType"] !== "-1" && (triggerData["stopType"] === "aftertile" || triggerData["stopType"] === "aftertile")) {
          dragged["triggerdata"]["delayToDeActivate"] = triggerData.hasOwnProperty("delayToDeActivate") && !this.utils.isNullOrEmpty(triggerData["delayToDeActivate"]) ? this.utils.toLocalDateTime(triggerData["delayToDeActivate"]) : "";
        }

        if (triggerData["stopType"] !== "-1" && triggerData["stopType"] === "time") {
          dragged["triggerdata"]["timeToDeActivate"] = triggerData.hasOwnProperty("timeToDeActivate") && !this.utils.isNullOrEmpty(triggerData["timeToDeActivate"]) ? this.utils.toLocalDateTime(triggerData["timeToDeActivate"]) : "";
        }
      }
    } else {
      dragged["triggerdata"]["type"] = "-1";
    }

    dragged = this.setActivateDeactivate(dragged);

    return dragged;
  };

  setActivateDeactivate(currDragTile: any) {
    currDragTile["triggerdata"]["evtTileToActivate"] = false;
    currDragTile["triggerdata"]["evtTileToDeactivate"] = false;
    currDragTile["triggerdata"]["evtTileNotActivated"] = false;

    var availableFrom = currDragTile['triggerdata'].hasOwnProperty('availableFrom') ? currDragTile['triggerdata']['availableFrom'] : "";

    if (!this.utils.isEmptyObject(currDragTile)) {
      if (currDragTile['triggerdata'].hasOwnProperty('deactivatedTime') && currDragTile.hasOwnProperty('deActivate') && currDragTile['deActivate']) {
        currDragTile["triggerdata"]["evtTileToActivate"] = true;
      } else if (currDragTile.hasOwnProperty('activate') && currDragTile.hasOwnProperty('deActivate') && !currDragTile['activate'] && !currDragTile['deActivate']) {
        currDragTile["triggerdata"]["evtTileToDeactivate"] = true;
      } else if (((availableFrom === '') || currDragTile.hasOwnProperty('activate') && !currDragTile['activate'])) {
        currDragTile["triggerdata"]["evtTileNotActivated"] = true;
      }
    }

    return currDragTile;
  };

  /* Detail and short view change for events */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
  };

  /* Setting dragged tile */
  setDragTile(triggerType: any, triggerData: any, type: string) {
    this.resetTriggerTypes(triggerData, type);

    if (type == "activate") {
      triggerData["type"] = triggerType;

      if (triggerType == "manual" || triggerType == "delay" || triggerType == "time") {
        triggerData["stopType"] = "-1";
      }

      if (triggerType == "delay") {
        triggerData["delayToActivate"] = "";
      }

      if (triggerType == "time") {
        triggerData["timeToActivate"] = "";
      }
    }

    if (type == "deactivate") {
      triggerData["stopType"] = triggerType;

      if (triggerType == "aftertile" || triggerType == "aftertrigger") {
        triggerData["delayToDeActivate"] = "";
      } else if (triggerType == "time") {
        triggerData["timeToDeActivate"] = "";
      }
    }
  };

  /* Resetting dragged tile trigger resetting */
  resetTriggerTypes(triggerData: any, type: string) {
    if (type == "activate") {
      delete triggerData["stopType"];
      delete triggerData["delayToActivate"];
      delete triggerData["timeToActivate"];
    }

    delete triggerData["delayToDeActivate"];
    delete triggerData["timeToDeActivate"];
  };

  /* Dragged tile on drop */
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
    /*if (tileObj.hasOwnProperty("draggedTiles")) {
      this.setDraggedTiles(tileObj["draggedTiles"]);
    }*/
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

  /*getDate(dat: any) {
    var corsus = dat;
  };*/

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

  /* Destroy Scroll */
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
    this.resetEvent();
    this.events = [];
    this.oid = "";
  };

  resetEvent(mergeReset?: string) {
    this.dragIndex = -1;
    this.droppedTile = {};
    this.event = {};
    this.eventName = "";
    this.eventStart = "";
    this.availableEnd = "";
    this.selectedLanguage = "en";
    this.eventCalendar = false;
    $(this.evtCategory.nativeElement).combobox("setvalue", "-1");
    //this.selectedEventCategory = "-1";
    this.isMerge = {};

    if (mergeReset && mergeReset === "reset") {
      this.isMerge = { "status": "merge" };
      this.clearInterval();
    }
  };

  replicateTile(obj: any) {
    var replicateTile = !this.utils.isEmptyObject(obj) && obj.hasOwnProperty("tile") ? obj["tile"] : {};
    var replicatedTile = this.setDefaultDraggedTile(replicateTile);
    this.event["draggedTiles"].push(replicatedTile);
  };

  dateWithin = function (startDate: any, endDate: any, checkDate: any) {
    var s, e, c;

    s = Date.parse(startDate);
    e = Date.parse(endDate);
    c = Date.parse(checkDate);

    if ((c <= e && c >= s)) {
      return true;
    }

    return false;
  };

  /* Save Event */
  saveEvent() {
    var id = this.event.hasOwnProperty("obj") && this.event["obj"].hasOwnProperty("_id") ? this.event["obj"]["_id"] : "-1";
    var selectedLanguage = this.selectedLanguage;
    var eventData = this.getEventObj(id);

    if (this.utils.isNullOrEmpty(eventData[name])) {
      alert('You must at least enter an Event name');
      return false;
    }

    if ($.trim($('.custom_combobox_input').val()) == '') {
      alert('Please select a type for the Event');
      return false;
    }

    if (this.utils.isNullOrEmpty(this.eventStart) || this.utils.isNullOrEmpty(this.availableEnd)) {
      alert('Oops! You need to complete the Event dates above first');
      return false;
    }

    if (!this.checkAppDate()) {
      return false;
    }

    if (!this.checkTriggerDateTime()) {
      return false;
    }

    var triggerChk = this.checkTriggerTime();

    if (!triggerChk) {
      alert('The Activate date has to be within the Events dates above');
      return false;
    }

    eventData["tiles"] = this.getDraggedTiles();

    if (eventData.hasOwnProperty("calendar") && eventData["calendar"]) {
      var activityCalendarResult = this.checkCalendarDate(eventData["tiles"]);

      if (!activityCalendarResult) {
        alert('Activity Date is empty');
        return false;
      }
    }

    var isActivityDateChk = this.checkActivityTime();

    if (!isActivityDateChk) {
      alert('Activity date should be within Event dates above');
      return false;
    }

  };

  checkActivityTime() {
    var activityChk = true;
    var draggedTiles = this.event.hasOwnProperty("draggedTiles") && this.event["draggedTiles"].length > 0 ? this.event["draggedTiles"] : [];

    for (let i = 0; i < draggedTiles.length; i++) {
      var dragTileObj = draggedTiles[i];

      if (!dragTileObj.hasOwnProperty["eventDragContainer"]) {
        var dateActivity = dragTileObj.hasOwnProperty("activityDate") && !this.utils.isNullOrEmpty(dragTileObj["activityDate"]) ? dragTileObj["activityDate"] : "";

        if (!this.utils.isNullOrEmpty(dateActivity)) {
          var isValidate = this.dateWithin(this.eventStart, this.availableEnd, dateActivity);

          if (activityChk) {
            activityChk = isValidate;
          }
        }
      }
    }

    return activityChk;
  };

  checkCalendarDate = function (currTiles: any[]) {
    var result = true;

    for (let i = 0; i < currTiles.length; i++) {
      var tileObj = currTiles[i];

      if ((!this.utils.isEmptyObject(tileObj) && tileObj.hasOwnProperty("activityDate")) && this.utils.isNullOrEmpty(tileObj["activityDate"])) {
        result = false;
      }
    }

    return result;
  };

  checkTriggerTime() {
    var triggerChk = true;
    var eventStartDate = !this.utils.isNullOrEmpty(this.eventStart) ? (new Date(this.eventStart)) : "";
    var untilDate = !this.utils.isNullOrEmpty(this.availableEnd) ? (new Date(this.availableEnd)) : "";
    var draggedTiles = this.event.hasOwnProperty("draggedTiles") && this.event["draggedTiles"].length > 0 ? this.event["draggedTiles"] : [];

    for (let i = 0; i < draggedTiles.length; i++) {
      var dragTileObj = draggedTiles[i];

      if (!dragTileObj.hasOwnProperty["eventDragContainer"]) {

        if (dragTileObj["triggerdata"].hasOwnProperty("timeToActivate") && !this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["timeToActivate"])) {
          var activateTime = (new Date(dragTileObj["triggerdata"]["timeToActivate"]));

          if (activateTime < eventStartDate || activateTime > untilDate) {
            triggerChk = false;
          }
        } else if (dragTileObj["triggerdata"].hasOwnProperty("timeToActivate") && this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["timeToActivate"])) {
          triggerChk = false;
        }
      }
    }

    return triggerChk;
  };

  checkAppDate() {
    var triggerChk = true;
    var chkSelect = false;
    //var availableDate = $.trim($('#txtAvailDateTime').val()) == "" ? "" : (new Date($('#txtAvailDateTime').val()));
    var eventStartDate = !this.utils.isNullOrEmpty(this.eventStart) ? (new Date(this.eventStart)) : "";
    var untilDate = !this.utils.isNullOrEmpty(this.availableEnd) ? (new Date(this.availableEnd)) : "";

    if (!this.utils.isNullOrEmpty(eventStartDate) && !this.utils.isNullOrEmpty(untilDate) && untilDate < eventStartDate) {
      alert('The Event start date must be lesser than the Until date');
      triggerChk = false;
      chkSelect = true;
    }

    if (!this.utils.isNullOrEmpty(eventStartDate) && !this.utils.isNullOrEmpty(untilDate) && eventStartDate > untilDate) {
      alert('The Until date date must be greater than the start date');
      triggerChk = false;
      chkSelect = true;
    }

    if (!this.utils.isNullOrEmpty(eventStartDate) && !this.utils.isNullOrEmpty(untilDate)) {
      if ((untilDate < eventStartDate) && !chkSelect) {
        alert('The Event start date has to be within the dates above');
        triggerChk = false;
      }
    }

    return triggerChk;
  };

  checkTriggerDateTime() {
    var triggerChk = true;
    var chkSelect = false;
    var draggedTiles = this.event.hasOwnProperty("draggedTiles") && this.event["draggedTiles"].length > 0 ? this.event["draggedTiles"] : [];
    var eventStartDate = !this.utils.isNullOrEmpty(this.eventStart) ? (new Date(this.eventStart)) : "";
    var untilDate = !this.utils.isNullOrEmpty(this.availableEnd) ? (new Date(this.availableEnd)) : "";

    for (let i = 0; i < draggedTiles.length; i++) {
      var dragTileObj = draggedTiles[i];
      if (!dragTileObj.hasOwnProperty["eventDragContainer"]) {
        var activateType = dragTileObj["triggerdata"].hasOwnProperty("type") && dragTileObj["triggerdata"]["type"] !== "-1" ? dragTileObj["triggerdata"]["type"] : "-1";
        var deActiveType = dragTileObj["triggerdata"].hasOwnProperty("stopType") && dragTileObj["triggerdata"]["stopType"] !== "-1" ? dragTileObj["triggerdata"]["stopType"] : "-1";
        var activeTime: any = '';
        var deActivateTime: any = '';

        if (activateType === 'time') {
          activeTime = dragTileObj["triggerdata"].hasOwnProperty("timeToActivate") && !this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["timeToActivate"]) ? dragTileObj["triggerdata"]["timeToActivate"] : "";

          if (!this.utils.isNullOrEmpty(activeTime)) {
            alert('The activate date can not be empty');
            triggerChk = false;

            return false;
          } else {
            activeTime = (new Date(activeTime));
          }
        }

        if (deActiveType === 'time') {
          deActivateTime = dragTileObj["triggerdata"].hasOwnProperty("timeToDeActivate") && !this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["timeToDeActivate"]) ? dragTileObj["triggerdata"]["timeToDeActivate"] : "";

          if (!this.utils.isNullOrEmpty(deActivateTime)) {
            deActivateTime = (new Date(deActivateTime));
          }
        }

        if (!this.utils.isNullOrEmpty(eventStartDate) && !this.utils.isNullOrEmpty(untilDate) && !this.utils.isNullOrEmpty(activeTime)) {
          if ((eventStartDate > activeTime) || (untilDate < activeTime)) {
            alert('The activate date has to be within the Events dates above');
            chkSelect = true;
            triggerChk = false;

            return false;
          }
        }

        if (!this.utils.isNullOrEmpty(eventStartDate) && !this.utils.isNullOrEmpty(untilDate) && !this.utils.isNullOrEmpty(activeTime) && !this.utils.isNullOrEmpty(deActivateTime)) {
          if (deActivateTime < activeTime && !chkSelect) {
            alert('The activate date must be lesser than the Deactivate date');
            triggerChk = false;

            return false;
          }
        }
      }
    }


    return triggerChk;
  };

  /* Fetching event data form user entered */
  getEventObj(evtId: string) {
    var currEvtData = {};
    currEvtData["name"] = this.utils.trim(this.eventName);
    currEvtData["category"] = this.evtCategory.nativeElement.value;
    currEvtData["type"] = 'event';
    currEvtData["art"] = "/img/tilist_art.jpg";

    //tilist.availableStart = $.toUTCDateTime($('#txtAvailDateTime').val());
    currEvtData["eventStart"] = !this.utils.isNullOrEmpty(this.eventStart) ? this.utils.toUTCDateTime(this.eventStart) : "";
    currEvtData["availableEnd"] = !this.utils.isNullOrEmpty(this.availableEnd) ? this.utils.toUTCDateTime(this.availableEnd) : "";
    currEvtData["organizationId"] = this.oid;
    currEvtData["dateCreated"] = evtId !== "-1" && this.event.hasOwnProperty("obj") && this.event["obj"].hasOwnProperty("dateCreated") ? this.event["obj"]["dateCreated"] : (new Date()).toUTCString();
    currEvtData["dateUpdated"] = (new Date()).toUTCString();
    currEvtData["calendar"] = this.eventCalendar;

    /*tilist.background_landscape = $('.background_landscape').val();
    tilist.background_portrait = $('.background_portrait').val();
    tilist.background = $('.background').val();
    tilist.defaultActivityIcon = $('.activity_icon').val();
    tilist.timelineBackgroundColor = $('.timeline-bg-color').val();
    tilist.timelineFontColor = $('.timeline-font-color').val();
    tilist.titleFontColor = $('.title-font-color').val();
    tilist.descFontColor = $('.desc-font-color').val(); */

    return currEvtData;
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
    var eventTypeElem = this.evtCategory;
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
                } else {
                  alert("Category not saved");
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

  /* Select Event */
  selectEvent(e: any, obj: any) {
    e.preventDefault();
    e.stopPropagation();
    //this.selectedEvent = obj;
    //this.renderer.setElementClass(elem.target, 'selected', true);
    //this.renderer.setElementClass(elem.srcElement, 'selected', true);
    ///var drgTiles = [];
    this.clearInterval();
    this.resetEvent();
    //this.event["obj"] = obj;
    this.draggedTiles = [];

    if (obj && obj.hasOwnProperty("tiles")) {
      for (let i = 0; i < obj.tiles.length; i++) {
        this.draggedTiles.push(obj.tiles[i]["_id"]);
      }
    }

    this.eventService.getEventByTiles(obj._id)
      .then(evtObj => {
        if (evtObj && evtObj[0]) {
          this.assignEventDatas(evtObj[0]);
          this.updateTileInterval();
        }
      });

    //elem.stopPropagation();
  };

  updateTileInterval() {
    if (this.intervalId === -1) {
      this.intervalId = setInterval(() => {
        this.updateTileList()
      }, 1000);

    } else {
      this.clearInterval();
      this.updateTileInterval();
    }
  }

  clearInterval() {
    if (this.intervalId !== -1) {
      clearInterval(this.intervalId);

      this.intervalId = -1;
    }
  }

  /*objectMatching() {

  };*/

  /*getEventObject() {

  };*/

  /*setDraggedTiles(draggedTiles: any) {
    if (typeof draggedTiles === "object") {
      if (this.utils.isArray(draggedTiles)) {
        for (let i = 0; i < draggedTiles.length; i++) {
          this.assignDragged(draggedTiles[i]);
        }
      } else {
        this.assignDragged(draggedTiles);
      }
    }
  };*/

  assignDragged(currTile: any) {
    var draggedTile = this.setSelectedDraggedTile(currTile);

    if (this.event.hasOwnProperty("draggedTiles")) {
      this.event["draggedTiles"].push(draggedTile);
    } else {
      this.event["draggedTiles"] = [draggedTile];
    }
  };

  newEvent(e: any) {
    this.resetEvent("reset");
  };

  resetOrgTiles() {
    var currEvent = this.event;
    var obj = Object.assign({}, currEvent);
    var triggeredData = currEvent;

    delete triggeredData["evtTileToActivate"];
    delete triggeredData["evtTileToDeactivate"];
    delete triggeredData["evtTileNotActivated"];
    delete obj["tile"];
    delete obj["uniqueId"];
  };

  updateTileList() {
    var obj1 = {};
    var obj2 = {};

    if (!this.utils.isEmptyObject(this.event) && this.event.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.event["obj"])) {
      var obj1Sring = JSON.stringify(this.event["obj"]);
      obj1Sring = obj1Sring.replace(/&#39;/g, "'");
      obj1 = JSON.parse(this.utils.htmlDecode(obj1Sring));

      if (obj1.hasOwnProperty("tiles") && obj1["tiles"].length > 0) {
        for (let i = 0; i < obj1["tiles"].length; i++) {
          delete obj1["tiles"][i]['tileData']
        }
      }

      delete obj1['createdBy'];
      delete obj1['dateCreated'];
      delete obj1['dateUpdated'];

      this.eventService.getEventByTiles(obj1["_id"])
        .then(evtObj => {
          if (evtObj && evtObj[0]) {
            var currEventobj = evtObj.length > 0 ? evtObj.map(x => Object.assign({}, x)) : [];
            obj2 = currEventobj[0];
            var obj2Sring = JSON.stringify(obj2);
            obj2 = JSON.parse(this.utils.htmlDecode(obj2Sring));

            for (let i = 0; i < obj2["tiles"].length; i++) {
              delete obj2["tiles"][i]['tileData']
            }

            delete obj2['createdBy'];
            delete obj2['dateCreated'];
            delete obj2['dateUpdated'];

            var isEventModified = this.newEventCompare();

            var currObj = this.checkActivityObj(obj1, obj2);
            obj1 = currObj.obj1;
            obj2 = currObj.obj2;

            var result = this.utils.compareObj(obj1, obj2);

            if (!result && !isEventModified) {
              if (confirm("The event has been updated by another user, click proceed to apply the changes") === true) {
                this.assignEventDatas(evtObj[0]);
              }
            } else if (isEventModified) {
              this.assignEventDatas(evtObj[0]);
            }
          }
        });
    }
  };

  assignEventDatas(objEvent: Object) {
    this.event["obj"] = objEvent;
    this.draggedTiles = [];

    if (!this.utils.isEmptyObject(objEvent)) {
      this.eventName = objEvent.hasOwnProperty("name") ? objEvent["name"] : "";
      this.eventStart = objEvent.hasOwnProperty("eventStart") ? this.utils.toLocalDateTime(objEvent["eventStart"]) : "";
      this.availableEnd = objEvent.hasOwnProperty("availableEnd") ? this.utils.toLocalDateTime(objEvent["availableEnd"]) : "";
      this.selectedLanguage = "en";
      $(this.evtCategory.nativeElement).combobox('setvalue', (objEvent.hasOwnProperty("category") && objEvent["category"]) ? objEvent["category"] : '-1');
      //this.e1.nativeElement.querySelector('#eventCategory')
      this.event["draggedTiles"] = [];

      if (objEvent.hasOwnProperty("tiles") && objEvent["tiles"].length > 0) {
        var currTiles = objEvent["tiles"];

        for (let i = currTiles.length - 1; 0 <= i; i--) {
          if (currTiles[i].hasOwnProperty("_id")) {
            this.draggedTiles.push(currTiles[i]["_id"]);
            this.assignDragged(currTiles[i]);
          }
        }
      }
    }
  };

  newEventCompare() {
    var id = this.event.hasOwnProperty("obj") && this.event["obj"].hasOwnProperty("_id") ? this.event["obj"]["_id"] : "-1";
    var selectedLanguage = this.selectedLanguage;
    var obj1 = this.getCompareValues();
    var obj1Sring = JSON.stringify(obj1);
    obj1 = JSON.parse(this.utils.htmlDecode(obj1Sring));

    var obj2 = {};

    if (!this.utils.isEmptyObject(this.event) && this.event.hasOwnProperty("obj") && !this.utils.isEmptyObject(this.event["obj"])) {
      var evtObj = this.event["obj"];
      obj2 = Object.assign({}, evtObj);
      var obj2Sring = JSON.stringify(obj2);
      obj2 = JSON.parse(this.utils.htmlDecode(obj2Sring));
      obj2["eventStart"] = obj2.hasOwnProperty("eventStart") ? this.utils.toUTCDateTime(obj2["eventStart"]) : "";
      obj2["availableEnd"] = obj2.hasOwnProperty("availableEnd") ? this.utils.toUTCDateTime(obj2["availableEnd"]) : "";

      var currTiles = obj2.hasOwnProperty("tiles") && obj2["tiles"].length > 0 ? obj2["tiles"] : [];
      for (let i = 0; i < currTiles.length; i++) {
        var tileData = currTiles[i];

        if (tileData.hasOwnProperty("availableFrom")) {
          tileData["triggerdata"]["availableFrom"] = this.utils.toUTCDateTime(tileData["triggerdata"]["availableFrom"]);
        }

        if (tileData.hasOwnProperty("deactivatedTime")) {
          tileData["triggerdata"]["deactivatedTime"] = this.utils.toUTCDateTime(tileData["triggerdata"]["deactivatedTime"]);
        }

        if (tileData.hasOwnProperty("triggerdata") && tileData["triggerdata"].hasOwnProperty("type")) {
          if (tileData["triggerdata"]["type"] === 'delay') {
            delete tileData["triggerdata"]["timeToActivate"];
          } else if (tileData["triggerdata"]["type"] === 'time') {
            if (tileData["triggerdata"].hasOwnProperty("timeToActivate")) {
              tileData["triggerdata"]["timeToActivate"] = this.utils.toUTCDateTime(tileData["triggerdata"]["timeToActivate"]);
            }

            if (tileData["triggerdata"].hasOwnProperty("timeToDeActivate")) {
              tileData["triggerdata"]["timeToDeActivate"] = this.utils.toUTCDateTime(tileData["triggerdata"]["timeToDeActivate"]);
            }

            delete tileData["triggerdata"]["delayToActivate"];
          }

          if (tileData["triggerdata"]["type"] === 'manual') {
            delete tileData["triggerdata"]["delayToActivate"];
          }

          if (tileData["triggerdata"]["type"] === 'always') {
            if (tileData["triggerdata"].hasOwnProperty("availableFrom") && !this.utils.isNullOrEmpty(tileData["triggerdata"]["availableFrom"])) {
              tileData["triggerdata"]["availableFrom"] = this.utils.toUTCDateTime(tileData["triggerdata"]["availableFrom"]);
            }
          }

          if (tileData["triggerdata"].hasOwnProperty("stopType")) {
            if (tileData["triggerdata"]["stopType"] === 'aftertile' || tileData["triggerdata"]["stopType"] === 'aftertrigger') {
              if (tileData["triggerdata"].hasOwnProperty("delayToDeActivate") && !this.utils.isNullOrEmpty(tileData["triggerdata"]["delayToDeActivate"])) {
                tileData["triggerdata"]["delayToDeActivate"] = tileData["triggerdata"]["delayToDeActivate"];
              } else {
                delete tileData["triggerdata"]["delayToDeActivate"];
                delete tileData["triggerdata"]['stopType'];
              }
            } else if (tileData["triggerdata"]["stopType"] === "time") {
              if (tileData["triggerdata"].hasOwnProperty("timeToDeActivate") && !this.utils.isNullOrEmpty(tileData["triggerdata"]["timeToDeActivate"])) {
                tileData["triggerdata"]["timeToDeActivate"] = tileData["triggerdata"]["timeToDeActivate"];
              } else {
                delete tileData["triggerdata"]["timeToDeActivate"];
                delete tileData["triggerdata"]['stopType'];
              }
            }
          } else {
            delete tileData["triggerdata"]["delayToDeActivate"];
            delete tileData["triggerdata"]["timeToDeActivate"];
          }
        }

        if (tileData.hasOwnProperty("activityDate") && !this.utils.isNullOrEmpty(tileData["activityDate"])) {
          tileData["activityDate"] = this.utils.toUTCDateTime(tileData["activityDate"]);
        }

        delete tileData['tileData'];
        delete tileData['tileActivate'];
        delete tileData['tileDeActivate'];
        delete tileData['status'];
      }

      delete obj2['notification'];
      delete obj2['smart'];
      delete obj2['createdBy'];
      delete obj2['dateCreated'];
      delete obj2['dateUpdated'];
      delete obj2['Apps'];
      delete obj2['isRoleBased'];
      delete obj2['defaultActivityIcon'];
      delete obj2['art'];
      delete obj2['background_landscape'];
      delete obj2['background_portrait'];
      delete obj2['background'];
      delete obj2['top_banner'];
      delete obj2['topBannerUrl'];
      delete obj2['scrollIconsUnder'];
      delete obj2['scrollIconsOver'];
      delete obj2['descFontColor'];
      delete obj2['timelineBackgroundColor'];
      delete obj2['timelineFontColor'];
      delete obj2['titleFontColor'];
      delete obj2['timeLine'];
      delete obj2['doubleWidthSquareDetails'];
      delete obj2['webBackground'];

      if (selectedLanguage !== "en") {
        delete obj2["name"];
      }

      for (let i = 0; i < this.languageList.length; i++) {
        var currLang = this.languageList[i];

        if (currLang["code"] !== selectedLanguage) {
          delete obj1[currLang["code"]];
          delete obj2[currLang["code"]];
        }
      }

      delete obj1['background_landscape'];
      delete obj1['background_portrait'];
      delete obj1['Apps'];
      delete obj1['isRoleBased'];

      var currObj = this.checkActivityObj(obj2, obj1);
      obj1 = currObj.obj2;
      obj2 = currObj.obj1;
    }

    return this.utils.compareObj(obj1, obj2);
  };

  checkActivityObj(obj1: Object, obj2: Object) {
    var activityChk = false;
    var hideDateChk = false;
    var newTiles = {};

    if (obj1 && !obj1.hasOwnProperty("calendar")) {
      delete obj2["calendar"];
    }

    if (obj1 && !obj1.hasOwnProperty("defaultActivityIcon")) {
      delete obj2["defaultActivityIcon"];
    }

    if (obj2 && !obj2.hasOwnProperty("calendar")) {
      delete obj1["calendar"];
    }

    if (obj2 && !obj2.hasOwnProperty("defaultActivityIcon")) {
      delete obj1["defaultActivityIcon"];
    }

    if (obj1.hasOwnProperty("tiles") && obj1["tiles"].length > 0) {
      for (let i = 0; i < obj1["tiles"].length; i++) {
        var objTileData = obj1["tiles"][i];
        activityChk = objTileData.hasOwnProperty("activityTitle") || objTileData.hasOwnProperty("shortDescription") || objTileData.hasOwnProperty("activityDate") ? true : false;
        hideDateChk = objTileData.hasOwnProperty("dontShowTime") ? true : false;

        var currObj = {};
        currObj["activityChk"] = activityChk;
        currObj["hideDateChk"] = hideDateChk;

        newTiles[objTileData._id] = currObj;
      }
    }

    if (obj2.hasOwnProperty("tiles") && obj2["tiles"].length > 0) {
      for (let i = 0; i < obj2["tiles"].length; i++) {
        var objTileData = obj2["tiles"][i];
        var tileKeys = Object.keys(newTiles);
        var tileIndex = tileKeys.indexOf(objTileData._id);
        var obj = tileIndex != -1 ? newTiles[objTileData._id] : {};

        if (!this.utils.isEmptyObject(obj)) {

          if (!obj["activityChk"]) {
            delete objTileData["activityTitle"];
            delete objTileData["shortDescription"];
            delete objTileData["activityDate"];
          }

          if (!obj["hideDateChk"]) {
            delete objTileData["dontShowTime"];
          }
        }
      }
    }

    delete obj1["availableStart"];
    delete obj2["availableStart"];

    return { "obj1": obj1, "obj2": obj2 };
  };

  getCompareValues() {
    var id = this.event.hasOwnProperty("obj") && this.event["obj"].hasOwnProperty("_id") ? this.event["obj"]["_id"] : "-1";
    var selectedLanguage = this.selectedLanguage;
    var tilist = {};

    tilist["_id"] = id;
    tilist["name"] = this.utils.trim(this.eventName);
    tilist["category"] = this.evtCategory.nativeElement.value;
    tilist["type"] = "event";
    //tilist.art = $('.tilist_art').val();
    //tilist.availableStart = $.toUTCDateTime($('#txtAvailDateTime').val());
    tilist["eventStart"] = !this.utils.isNullOrEmpty(this.eventStart) ? this.utils.toUTCDateTime(this.eventStart) : "";
    tilist["availableEnd"] = !this.utils.isNullOrEmpty(this.availableEnd) ? this.utils.toUTCDateTime(this.availableEnd) : "";
    tilist["organizationId"] = this.oid;
    tilist["tiles"] = this.getDraggedTiles();

    if (id !== '-1' && selectedLanguage != "en") {
      tilist[selectedLanguage] = this.event["obj"][selectedLanguage] ? this.event["obj"][selectedLanguage] : {};
      tilist[selectedLanguage].name = this.eventName;
      delete tilist["name"];
    }

    if (selectedLanguage == "en") {
      if (tilist["name"].trim() == '' && $('.custom_combobox_input').val().trim() == '' && tilist["tiles"].length === 0) {
        tilist = {};
      }
    }

    return tilist;
  };

  getLanguages() {
    if (this.languageList.length === 0) {
      this.tileService.getLanguages()
        .then(langs => {
          this.languageList = langs;
        });
    }
  };

  getDraggedTiles() {
    var currDraggedTiles = [];
    var drgTiles = this.event.hasOwnProperty("draggedTiles") && this.event["draggedTiles"].length > 0 ? this.event["draggedTiles"] : [];
    var position = 1;

    for (let i = 0; i < drgTiles.length; i++) {
      var tile = {};
      tile["triggerdata"] = {};
      var dragTileObj = drgTiles[i];

      if (!dragTileObj.hasOwnProperty["eventDragContainer"]) {
        tile["_id"] = dragTileObj.hasOwnProperty("tile") && dragTileObj["tile"].hasOwnProperty("_id") ? dragTileObj["tile"]["_id"] : "-1";

        if (tile["_id"] !== "-1" && dragTileObj["triggerdata"].hasOwnProperty("type") && dragTileObj["triggerdata"]["type"] !== "-1") {
          tile["triggerdata"]["type"] = dragTileObj["triggerdata"]["type"];

          if (tile["triggerdata"]["type"] == "always") {
            tile["triggerdata"]["position"] = position;
            position++;
          }

          if (tile["triggerdata"]["type"] == 'delay') {
            tile["triggerdata"]["delayToActivate"] = dragTileObj["triggerdata"].hasOwnProperty("delayToActivate") ? dragTileObj["triggerdata"]["delayToActivate"] : "";
          }

          if (tile["triggerdata"]["type"] == 'time') {
            tile["triggerdata"]["timeToActivate"] = dragTileObj["triggerdata"].hasOwnProperty("timeToActivate") ? this.utils.toUTCDateTime(dragTileObj["triggerdata"]["timeToActivate"]) : "";
          }

          if (dragTileObj["triggerdata"].hasOwnProperty("stopType") && dragTileObj["triggerdata"]["stopType"] !== "-1") {
            tile["triggerdata"]["stopType"] = dragTileObj["triggerdata"]["stopType"];

            if (tile["triggerdata"]["stopType"] === "aftertile" || tile["triggerdata"]["stopType"] == 'aftertrigger') {
              if (dragTileObj["triggerdata"].hasOwnProperty("delayToDeActivate") && !this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["delayToDeActivate"])) {
                tile["triggerdata"]["delayToDeActivate"] = dragTileObj["triggerdata"]["delayToDeActivate"];
              } else {
                delete tile["triggerdata"]["stopType"];
              }
            } else if (tile["triggerdata"]["stopType"] === "time") {
              if (dragTileObj["triggerdata"].hasOwnProperty("timeToDeActivate") && !this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["timeToDeActivate"])) {
                tile["triggerdata"]["timeToDeActivate"] = this.utils.toUTCDateTime(dragTileObj["triggerdata"]["timeToDeActivate"]);
              } else {
                delete tile["triggerdata"]["stopType"];
              }
            }
          }

          if (tile["triggerdata"]["type"] === 'always') {
            if (dragTileObj["triggerdata"].hasOwnProperty("availableFrom") && !this.utils.isNullOrEmpty(dragTileObj["triggerdata"]["availableFrom"])) {
              tile["triggerdata"]["availableFrom"] = this.utils.toUTCDateTime(dragTileObj["triggerdata"]["availableFrom"]);
            } else {
              tile["triggerdata"]["availableFrom"] = this.utils.toUTCDateTime(this.event["eventStart"]);
            }
          }

          if (dragTileObj["triggerdata"].hasOwnProperty("setActiveTileId")) {
            tile["triggerdata"]["setActiveTileId"] = dragTileObj["triggerdata"]["setActiveTileId"];
          }

          if (dragTileObj["triggerdata"].hasOwnProperty("deactivatedTime")) {
            tile["triggerdata"]["deactivatedTime"] = this.utils.toUTCDateTime(dragTileObj["triggerdata"]["deactivatedTime"]);
          }

          if (dragTileObj["triggerdata"].hasOwnProperty("deactivated") && dragTileObj["triggerdata"]["deactivated"]) {
            tile["triggerdata"]["deactivated"] = true;
          }

          tile["showName"] = !this.utils.isNullOrEmpty(dragTileObj["activityTitle"]) ? true : false;
          tile["activityTitle"] = dragTileObj["activityTitle"];
          tile["shortDescription"] = dragTileObj["shortDescription"];
          tile["activityDate"] = !this.utils.isNullOrEmpty(dragTileObj["activityDate"]) ? this.utils.toUTCDateTime(dragTileObj["activityDate"]) : "";
          tile["dontShowTime"] = dragTileObj["dontShowTime"];

          currDraggedTiles.push(tile);

        } else {
          continue;
        }
      }
    }

    return currDraggedTiles;
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
      this.getLanguages();
      this.selectedOrganization = this.oid;
      //this.setEventType();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
    this.clearInterval();
  };
}
