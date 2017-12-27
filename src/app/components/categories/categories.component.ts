import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CategoryService } from '../../services/category.service';
import { Utils } from '../../helpers/utils';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

export class CategoriesComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private categoryService: CategoryService,
    private mScrollbarService: MalihuScrollbarService,
    private e1: ElementRef,
    private renderer: Renderer) {
    this.utils = Utils;
  }
  
  private orgChangeDetect: any;
  scrollbarOptions: Object = { axis: 'y', theme: 'light-2' };
  utils: any;
  groupType: string = "list";
  oid: string = "";
  
  /* Detail and short view change for categories */
  changeGroupView() {
    this.groupType = this.groupType === "list" ? "details" : "list";
  };

  /* Intialize scroll bar for the component elements */
  setScrollList() {
    //this.destroyScroll();

    this.mScrollbarService.initScrollbar('#main-container-categories', this.scrollbarOptions);
    this.mScrollbarService.initScrollbar('#category-selected-tiles', this.scrollbarOptions);

    if (this.cms["appDatas"].hasOwnProperty("scrollList")) {
      this.cms["appDatas"]["scrollList"].push("#main-container-categories");
      this.cms["appDatas"]["scrollList"].push("#category-selected-tiles");
    } else {
      this.cms["appDatas"]["scrollList"] = ["#main-container-categories", "#category-selected-tiles"];
    }
  };

  /* Destroy Scroll */
  destroyScroll() {
    this.cms.destroyScroll(["#main-container-categories", "#category-selected-tiles"]);
  };

  resetCategoryContents() {
    this.groupType = "list";
    this.oid = "";
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.resetCategoryContents();
      this.setScrollList();
      this.oid = Cookie.get('oid');
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
