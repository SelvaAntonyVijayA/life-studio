import { Component, OnInit, OnDestroy, EventEmitter, ContentChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DraggableDirective } from '../../helpers/draggable.directive';


@Component({
  selector: 'app-events',
  outputs: ["dropped"],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private mScrollbarService: MalihuScrollbarService) { }

  organizations: any[] = [];
  selectedOrganization: string = "-1";
  private orgChangeDetect: any;
  public scrollbarOptions = { axis: 'y', theme: 'light-2' };
  oid: string = "";
  eventTiles: any[] = [];
  draggedTiles: any[] = [];
  tileDropped: Object = {};
  @ContentChild(DraggableDirective) dragDir: DraggableDirective;
  droppedTile:Object = {};

  setOrganizations() {
    if (this.organizations.length == 0) {
      this.organizations = this.cms["appDatas"].hasOwnProperty("organizations") ? this.cms["appDatas"]["organizations"] : [];
    }
  };

  private onDrop(event) {
    this.draggedTiles.unshift(event);
    this.droppedTile = event;
  }

  getTileContent(tileObj: any) {
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  setScrollList() {
    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#event_main_container");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#event_main_container"];
    }
  };

  resetEventDatas() {
    this.draggedTiles = [];
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
