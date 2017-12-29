import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { TileService } from '../../services/tile.service';
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
    private tileService: TileService,
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
  tileCategories: any[] = [];
  selectedCategory: string = "-1";
  tiles: any[] = [];
  tileCount: number = 0;
  tilesByCategory: any[] = [];
  categories: any[] = [];
  category: Object = {};
  categoryFilter: Object = {
    "categorySearch": "",
    "sort": {
      "selected": "date_desc", "isAsc": false, "fieldNames": {
        "date": ["dateUpdated", "dateCreated"],
        "name": ["name"]
      }
    }
  };

  availableStart: any = "";
  availableEnd: any = "";
  art: string = "";
  categoryName: string = "";

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

  /* Tile Categories based on organization*/
  getTilesCategories() {
    this.tileService.getTilesCategories(this.oid).subscribe(tileCat => {
      this.tileCategories = tileCat[0];
      this.tiles = tileCat[1];
    });
  };

  filterTiles(catId: string) {
    if (catId !== "-1") {
      this.tilesByCategory = this.tiles.filter(function (currTile) {
        return currTile.hasOwnProperty("category") && currTile["category"] === catId;
      });

      this.tileCount = this.tilesByCategory.length;
    } else {
      this.tileCount = 0;
      this.tilesByCategory = [];
    }
  };

  resetCategoryContents() {
    this.resetCategory();
    this.groupType = "list";
    this.oid = "";
    this.tileCategories = [];
    this.tiles = [];
    this.tilesByCategory = [];
    this.categories = [];

    this.categoryFilter = {
      "categorySearch": "",
      "sort": {
        "selected": "date_desc", "isAsc": false, "fieldNames": {
          "date": ["dateUpdated", "dateCreated"],
          "name": ["name"]
        }
      }
    };
  };

  resetCategory() {
    this.category = {};
    this.availableStart = "";
    this.availableEnd = "";
    this.art = "";
    this.categoryName = "";
    this.selectedCategory = "-1";
    this.tileCount = 0;
  };

  categoryChange(catId: string) {
    this.selectedCategory = catId;
    this.filterTiles(catId);
  };

  trackByIndex(index: number, obj: any): any {
    return index;
  };

  categoriesList(catId?: string, isNew?: boolean) {
    this.categoryService.categoryList(this.oid, catId).then(categoriesList => {
      if (this.utils.isNullOrEmpty(catId)) {
        this.categories = categoriesList;
      } else if (!this.utils.isNullOrEmpty(catId) && this.utils.isArray(categoriesList) && categoriesList.length > 0) {
        if (!isNew) {
          var catIndex = this.categories.map(function (cat) { return cat['_id']; }).indexOf(categoriesList[0]["_id"]);

          if (catIndex !== -1) {
            this.categories[catIndex] = categoriesList[0];
          }
        } else {
          this.categories.push(categoriesList[0]);
        }

        this.setCategory(categoriesList[0]);
      }
    });
  };

  splitKey(val: string) {
    var splittedVal = val.split("_");

    return splittedVal[0];
  };

  /* Filter Changing */
  filterChange(val: any) {
    var sortOpt = val.split("_");
    this.categoryFilter["sort"]["selected"] = val;
    this.categoryFilter["sort"]["isAsc"] = sortOpt[1] === "asc" ? true : false;
  };

  selectCategory(e: any, catObj: any) {
    e.preventDefault();
    e.stopPropagation();
    this.setCategory(catObj);
  };

  /* Setting selected category data to the DOM */
  setCategory(catObj: any) {
    if (!this.utils.isEmptyObject(catObj)) {
      this.category = catObj;
      this.categoryName = catObj.hasOwnProperty("name") && !this.utils.isNullOrEmpty(catObj["name"]) ? catObj["name"] : "";
      this.availableStart = catObj.hasOwnProperty("availableStart") && !this.utils.isNullOrEmpty(catObj["availableStart"]) ? this.utils.toLocalDateTime(catObj["availableStart"]) : "";
      this.availableEnd = catObj.hasOwnProperty("availableEnd") && !this.utils.isNullOrEmpty(catObj["availableEnd"]) ? this.utils.toLocalDateTime(catObj["availableEnd"]) : "";
      this.art = catObj.hasOwnProperty("art") && !this.utils.isNullOrEmpty(catObj["art"]) ? catObj["art"] : "";
      this.selectedCategory = catObj.hasOwnProperty("category") && !this.utils.isNullOrEmpty(catObj["category"]) ? catObj["category"] : "-1";

      this.filterTiles(this.selectedCategory);
    } else {
      this.resetCategory();
    }
  };

  /*Category Notification Icon Check Conditions */
  categoryNotificationIcon(catObj: any) {
    if (catObj && catObj.hasOwnProperty("notification") && catObj.notification.hasOwnProperty("apps") && catObj.notification.apps.length > 0) {
      for (let i = 0; i < catObj.notification.apps.length; i++) {
        catObj["tileNotifications"] = i === 0 ? catObj.notification.apps[i]["name"] : ", " + catObj.notification.apps[i]["name"];
      }
    }

    if (catObj && catObj.hasOwnProperty("Apps") && catObj.Apps.length > 0) {
      for (let i = 0; i < catObj.Apps.length; i++) {
        catObj["pageApps"] = i === 0 ? catObj.Apps[i]["appName"] : ", " + catObj.Apps[i]["appName"];
      }
    }

    if (catObj && catObj.hasOwnProperty("smart") && catObj.smart.hasOwnProperty("apps") && catObj.smart.apps.length > 0) {
      for (let i = 0; i < catObj.smart.apps.length; i++) {
        catObj["tileSmart"] = i === 0 ? catObj.smart.apps[i]["name"] : ", " + catObj.smart.apps[i]["name"];
      }
    }

    catObj["isRole"] = catObj.hasOwnProperty("isRoleBased") && !this.utils.isNullOrEmpty("isRoleBased") && catObj["isRoleBased"] ? true : false;
  };

  newCategory(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.resetCategory();
  };

  getTiles() {
    var currTiles = [];

    if (this.tilesByCategory.length > 0) {
      for (let i = 0; i < this.tilesByCategory.length; i++) {
        var tileObj = this.tilesByCategory[i];

        var tile = {};
        tile["_id"] = tileObj["_id"];
        currTiles.push(tile);
      }
    }

    return currTiles;
  };

  saveCategory(e: any, isDuplicate?: boolean) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    var categoryObj = {};
    var id = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("_id") ? this.category["_id"] : "-1";

    if (id !== "-1" && !isDuplicate) {
      categoryObj["_id"] = id;
    }

    categoryObj["dateCreated"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("dateCreated") ? this.category["dateCreated"] : (new Date()).toUTCString();
    categoryObj["dateUpdated"] = (new Date()).toUTCString();

    categoryObj["name"] = this.categoryName;
    categoryObj["availableStart"] = this.utils.toUTCDateTime(this.availableStart);
    categoryObj["availableEnd"] = this.utils.toUTCDateTime(this.availableEnd);
    categoryObj["userId"] = "";
    categoryObj["organizationId"] = this.oid;

    categoryObj["art"] = this.art;
    categoryObj["category"] = this.selectedCategory;

    categoryObj["background_landscape"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("background_landscape") ? this.category["background_landscape"] : "";
    categoryObj["background_portrait"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("background_portrait") ? this.category["background_portrait"] : "";
    categoryObj["background"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("background") ? this.category["background"] : "";
    categoryObj["timelineBackgroundColor"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("timelineBackgroundColor") ? this.category["timelineBackgroundColor"] : "";
    categoryObj["timelineFontColor"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("timelineFontColor") ? this.category["timelineFontColor"] : "";
    categoryObj["titleFontColor"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("titleFontColor") ? this.category["titleFontColor"] : "";
    categoryObj["descFontColor"] = !this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("descFontColor") ? this.category["descFontColor"] : "";

    if (this.utils.isNullOrEmpty(categoryObj["name"])) {
      alert('Your must at least enter the Category Name');
      return false;
    }

    if (this.utils.isNullOrEmpty(categoryObj["availableStart"])) {
      categoryObj["availableStart"] = (new Date()).toUTCString();
    }

    if (this.utils.isNullOrEmpty(categoryObj["availableEnd"])) {
      var current = new Date();
      current.setFullYear(current.getFullYear() + 10);
      categoryObj["availableEnd"] = current.toUTCString();
    }

    if (categoryObj["category"] === '-1') {
      alert('Please select a Category');
      return false;
    }

    categoryObj["tiles"] = this.getTiles();

    var isDatesCheck = this.categoryCheckDates();

    if (!isDatesCheck) {
      return false;
    }

    this.save(categoryObj, isDuplicate);
  };

  categoryCheckDates() {
    var result = true;
    var availableStart = !this.utils.isNullOrEmpty(this.availableStart) ? (new Date(this.availableStart)) : "";
    var untilDate = !this.utils.isNullOrEmpty(this.availableEnd) ? (new Date(this.availableEnd)) : "";

    if (!this.utils.isNullOrEmpty(availableStart) && !this.utils.isNullOrEmpty(untilDate)) {
      if (availableStart > untilDate) {
        alert('The Until date date must be greater than the start date');
        result = false;
      } else if (untilDate < availableStart) {
        alert('The Start date must be lesser than until date');
        result = false;
      }
    }

    return result;
  };

  duplicateCategory(e: any) {
    e.preventDefault();
    e.stopPropagation();

    this.saveCategory("", true);
  };

  deleteCategory(e: any) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.utils.isEmptyObject(this.category) && this.category.hasOwnProperty("_id")) {
      var r = confirm("Are you sure want to delete this Category?");

      if (r) {
        var categoryId = this.category["_id"];

        this.categoryService.removeCategory(categoryId).then(deleteRes => {
          if (!this.utils.isEmptyObject(deleteRes) && deleteRes.hasOwnProperty("deleted") && deleteRes["deleted"]) {
            var catIdx = this.categories.map(function (cat) { return cat['_id']; }).indexOf(categoryId);
            this.categories.splice(catIdx, 1);

            this.resetCategory();
            alert("Category Removed");
          }
        });
      }
    } else {
      alert("Category not selected");
    }
  };

  save(categoryObj: Object, isDuplicate: boolean) {
    this.categoryService.saveCategory(categoryObj)
      .then(catResObj => {
        var isNew = categoryObj.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(categoryObj["_id"]) ? false : true;

        var alertMessage = isNew ? "Category Created" : "Category Updated";
        alertMessage = isDuplicate ? "Duplicate Category Created" : alertMessage;

        var alertMessage = isNew ? "Category Created" : "Category Updated";
        alertMessage = isDuplicate ? "Duplicate Category Created" : alertMessage;
        alert(alertMessage);

        if (!this.utils.isEmptyObject(catResObj) && catResObj.hasOwnProperty("_id")) {
          this.categoriesList(catResObj["_id"], isNew);
        }
      });
  };


  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.resetCategoryContents();
      this.setScrollList();
      this.oid = Cookie.get('oid');
      this.getTilesCategories();
      this.categoriesList();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
    this.destroyScroll();
  };
}
