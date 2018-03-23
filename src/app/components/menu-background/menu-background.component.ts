import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, EventEmitter, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../../helpers/utils';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PageService } from '../../services/page.service';

@Component({
  selector: 'menu-background',
  templateUrl: './menu-background.component.html',
  styleUrls: ['./menu-background.component.css'],
  outputs: ["menuBgContent"]
})

export class MenuBackgroundComponent implements OnInit {
  constructor(
    private e1: ElementRef,
    public utils: Utils,
    private modalService: BsModalService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private pageService: PageService
  ) {

  }

  /* Data inputs and variables */
  modalRef: BsModalRef;
  @ViewChild('menuBgLib') menuBgLib: ModalDirective;
  @ViewChild('filept') filePt: ElementRef;
  @ViewChild('fileBgp') fileBgp: ElementRef;
  @ViewChild('fileBgl') fileBgl: ElementRef;
  @ViewChild('fileTp') fileTp: ElementRef;
  @ViewChild('fileTi') fileTi: ElementRef;
  @Input('show-modal') showModal: boolean = false;
  @Input('pageData') pageData: Object = {};
  menuBgContent = new EventEmitter<any>();
  menuBgGroupNames: string[] = [];
  groupBgIdx: number = -1;
  tabName: string = "mobile";
  private orgChangeDetect: any;
  bgObj: Object = {};
  menuImageData: Object = {
    "pt": "",
    "bgp": "",
    "bgl": "",
    "tp": "",
    "ti": ""
  };

  /* Showing menu background */
  menuBG() {
    if (!this.utils.isEmptyObject(this.pageData)) {
      this.menuBgLib.show();
      this.loadImages();
    }
  };

  /* Closing the popup */
  onClose() {
    this.resetMenuBg();
    this.menuBgLib.hide();
  };

  onHide(e: any) {
    this.menuBgContent.emit({ "close": true });
  };

  selectGroupOption(e: any, idx: number) {
    this.groupBgIdx = idx;
    this.setMenuObjData();
  };

  /* Resetting Menu Datas */
  resetMenuBg() {
    this.groupBgIdx = 0;
    this.bgObj = this.pageBgObjectAssign();
    this.tabName = "mobile";
    this.menuBgGroupNames = ["Background Pattern", "Background Image", "Top Banner", "Nav Bar",
      "Tab Icon", "Page Layout", "Square Icon", "Wide Icon", "Follow"];
    this.menuImageData = {
      "pt": "",
      "bgp": "",
      "bgl": "",
      "tp": "",
      "ti": ""
    }
  };

  /* Changing the current instance of  the tab */
  tabChange(e: any, tbName: string) {
    if (this.tabName !== tbName) {
      this.resetMenuBg();
      this.tabName = tbName;
      this.loadImages();
    }
  };

  /* Changing the color codes of the inputs */
  colorChange(e: any, code: string) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.utils.isNullOrEmpty(code)) {
      var validCode = this.checkColorCode(code);

      if (!validCode) {
        this.notValidColor();
      }
    }
  };

  checkColorCode(code?: string) {
    var isValid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(code);

    return isValid;
  };

  notValidColor() {
    this.utils.iAlert('error', 'Error', 'Not a valid color code');
  };

  imageFileUpload(files: FileList, grpType: string) {
    let currFile = files.item(0);

    if (!this.utils.isNullOrEmpty(currFile)) {
      let formData = this.getImageFormData(currFile, grpType);

      if (grpType !== "ti") {
        this.uploadImage(formData, grpType);
      } else {
        this.getImageWidthHeight(currFile, (sizeObj) => {
          this.bgObj["pt"]["tabIconWidth"] = sizeObj["width"];
          this.bgObj["pt"]["tabIconHeight"] = sizeObj["height"];

          this.uploadImage(formData, grpType);
        });
      }
    }
  };

  uploadImage(formData: any, grpType: string) {
    this.pageService.imageUpload("/image/bgpatternupload/", formData)
      .then(img => {
        var imageUrl = !this.utils.isEmptyObject(img) && img.hasOwnProperty("imageUrl") ? img["imageUrl"] : "";

        if (this.groupBgIdx === 0) {
          this.bgObj["pt"]["background"] = imageUrl;
        } else if (this.groupBgIdx === 1) {
          if (grpType === "bgp") {
            this.bgObj["bgpl"]["background_portrait"] = imageUrl;
          } else if (grpType === "bgl") {
            this.bgObj["bgpl"]["background_landscape"] = imageUrl;
          }
        } else if (this.groupBgIdx === 2) {
          this.bgObj["tp"]["top_banner"] = imageUrl;
        } else if (this.groupBgIdx === 4) {
          this.bgObj["ti"]["tabIcon"] = imageUrl;
        }
      });
  };

  getImageFormData(file: any, grpType: string) {
    var pageId = this.pageData["_id"];
    var appId = this.pageData["appId"];

    let formData: any = new FormData();
    formData.append("appId", appId);
    formData.append("pageId", pageId);
    formData.append("type", grpType);
    formData.append("pagefrom", this.tabName);
    formData.append("file[]", file);

    return formData;
  };

  pageBgObjectAssign() {
    return {
      pt: {
        "background": "",
        "pageBackgroundColor": "",
      },
      bgpl: {
        "background_portrait": "",
        "background_landscape": ""
      },
      tp: {
        "top_banner": "",
        "scrollIconsOver": false,
        "topBannerUrl": ""
      },
      ti: {
        "tabIcon": "",
        "tabIconIsMask": false,
        "tabTitleHidden": false,
        "tabIconWidth": "",
        "tabIconHeight": ""
      },
      navBar: {
        "fontColor": "",
        "backgroundColor": "",
        "bannerFontColor": "",
        "bannerColor": "",
        "navbarFontSize": ""
      },
      pageLayout: {
        "standardNumberOfColumns": 2,
        "minSquareIconSize": 80,
        "spacingBetweenIcons": 10,
        "navigationTabOnBottom": false
      },
      squareWideIcon: {
        "verticalAlignment": "bottom",
        "horizontalAlignment": "center",
        "verticalOffset": 0,
        "horizontalOffset": 0,
        "border": false,
        "fontSize": 12,
        "textBackgroundColor": "#FFFFFF",
        "textBackgroundAlpha": 0.3,
        "fontColor": "#000000",
        "fontBold": false
      },
      flw: {
        "follow": "",
        "linkToNotifications": ""
      }
    };
  };

  fileProcess(e: any, grpType: string) {
    e.preventDefault();

    let isUpload = false;

    if (grpType === "bgp" || grpType === "bgl") {
      if (!this.utils.isNullOrEmpty(this.menuImageData["pt"])) {
        isUpload = true;
      }
    } else if (grpType === "pt") {
      if (!this.utils.isNullOrEmpty(this.menuImageData["bgp"]) || !this.utils.isNullOrEmpty(this.menuImageData["bgl"])) {
        isUpload = true;
      }
    }

    if (isUpload) {
      this.utils.iAlert('error', 'Information', 'You can upload either a background or a pattern');
      return false;
    }

    if (grpType === "pt") {
      this.filePt.nativeElement.click();
    } else if (grpType === "bgp") {
      this.fileBgp.nativeElement.click();
    } else if (grpType === "bgl") {
      this.fileBgl.nativeElement.click();
    } else if (grpType === "tp") {
      this.fileTp.nativeElement.click();
    } else if (grpType === "ti") {
      this.fileTi.nativeElement.click();
    }
  };

  updatePageData(e: any, isRemove?: boolean) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
    }

    let pageUpdateObj = {};
    let obj = {};

    if (this.groupBgIdx === 0) {
      obj = this.bgObj["pt"];
    } else if (this.groupBgIdx === 1) {

      obj = this.bgObj["bgpl"];
    } else if (this.groupBgIdx === 2) {

      obj = this.bgObj["tp"];
    } else if (this.groupBgIdx === 3) {

      obj = this.bgObj["navBar"];
    } else if (this.groupBgIdx === 4) {

      obj = this.bgObj["ti"];
    } else if (this.groupBgIdx === 5) {

      obj = this.bgObj["pageLayout"];
      pageUpdateObj = this.tabName === "web" ? { "webBackground": { "pageLayout": obj } } : { "pageLayout": obj };
    } else if (this.groupBgIdx === 6) {

      obj = this.bgObj["squareWideIcon"];
      pageUpdateObj = this.tabName === "web" ? { "webBackground": { "singleWidthSquareDetails": obj } } : { "singleWidthSquareDetails": obj };
    } else if (this.groupBgIdx === 7) {

      obj = this.bgObj["squareWideIcon"];
      pageUpdateObj = this.tabName === "web" ? { "webBackground": { "doubleWidthSquareDetails": obj } } : { "doubleWidthSquareDetails": obj };
    } else if (this.groupBgIdx === 8) {

      obj = this.bgObj["flw"];
    }

    if (this.groupBgIdx !== 5 && this.groupBgIdx !== 6 && this.groupBgIdx !== 7) {
      pageUpdateObj = this.tabName === "web" ? { "webBackground": obj } : obj;
    }

    if (!this.utils.isEmptyObject(pageUpdateObj)) {
      pageUpdateObj["dateUpdated"] = (new Date()).toUTCString();

      let isMsg = isRemove ? false : true;
      this.pageUpdate(pageUpdateObj, isMsg);
    }
  };

  setMenuObjData() {
    let pageObj = this.pageData;
    let obj = this.tabName === "web" && pageObj.hasOwnProperty("webBackground") ? pageObj["webBackground"] : this.tabName === "mobile" ? pageObj : {};

    if (this.groupBgIdx === 0) {

      //this.bgObj["pt"]["background"] = obj.hasOwnProperty("background") ? obj["background"] : "";
      this.bgObj["pt"]["background"] = this.menuImageData["pt"];
      this.bgObj["pt"]["pageBackgroundColor"] = obj.hasOwnProperty("pageBackgroundColor") ? obj["pageBackgroundColor"] : "";
    } else if (this.groupBgIdx === 1) {

      //this.bgObj["bgpl"]["background_landscape"] = obj.hasOwnProperty("background_landscape") ? obj["background_landscape"] : "";
      //this.bgObj["bgpl"]["background_portrait"] = obj.hasOwnProperty("background_portrait") ? obj["background_portrait"] : "";
      this.bgObj["bgpl"]["background_landscape"] = this.menuImageData["bgp"];
      this.bgObj["bgpl"]["background_portrait"] = this.menuImageData["bgl"];
    } else if (this.groupBgIdx === 2) {

      //this.bgObj["tp"]["top_banner"] = obj.hasOwnProperty("top_banner") ? obj["top_banner"] : "";
      this.bgObj["tp"]["top_banner"] = this.menuImageData["tp"];
      this.bgObj["tp"]["scrollIconsOver"] = obj.hasOwnProperty("scrollIconsOver") && !this.utils.isNullOrEmpty(obj["scrollIconsOver"]) ? this.utils.convertToBoolean(obj["scrollIconsOver"]) : false;
      this.bgObj["tp"]["topBannerUrl"] = !this.bgObj["tp"]["scrollIconsOver"] && obj.hasOwnProperty("topBannerUrl") && !this.utils.isNullOrEmpty(obj["topBannerUrl"]) ? obj["topBannerUrl"] : "";
    } else if (this.groupBgIdx === 3) {

      this.bgObj["navBar"]["fontColor"] = obj.hasOwnProperty("fontColor") && !this.utils.isNullOrEmpty(obj["fontColor"]) ? obj["fontColor"] : "";
      this.bgObj["navBar"]["backgroundColor"] = obj.hasOwnProperty("backgroundColor") && !this.utils.isNullOrEmpty(obj["backgroundColor"]) ? obj["backgroundColor"] : "";
      this.bgObj["navBar"]["bannerFontColor"] = obj.hasOwnProperty("bannerFontColor") && !this.utils.isNullOrEmpty(obj["bannerFontColor"]) ? obj["bannerFontColor"] : "";
      this.bgObj["navBar"]["bannerColor"] = obj.hasOwnProperty("bannerColor") && !this.utils.isNullOrEmpty(obj["bannerColor"]) ? obj["bannerColor"] : "";
      this.bgObj["navBar"]["navbarFontSize"] = obj.hasOwnProperty("navbarFontSize") && !this.utils.isNullOrEmpty(obj["navbarFontSize"]) ? parseFloat(obj["navbarFontSize"]) : 0;
    } else if (this.groupBgIdx === 4) {

      //this.bgObj["ti"]["tabIcon"] = obj.hasOwnProperty("tabIcon") && !this.utils.isNullOrEmpty(obj["tabIcon"]) ? obj["tabIcon"] : "";

      this.bgObj["ti"]["tabIcon"] = this.menuImageData["ti"];
      this.bgObj["ti"]["tabIconIsMask"] = obj.hasOwnProperty("tabIconIsMask") && !this.utils.isNullOrEmpty(obj["tabIconIsMask"]) ? this.utils.convertToBoolean(obj["tabIconIsMask"]) : false;
      this.bgObj["ti"]["tabTitleHidden"] = obj.hasOwnProperty("tabTitleHidden") && !this.utils.isNullOrEmpty(obj["tabTitleHidden"]) ? this.utils.convertToBoolean(obj["tabTitleHidden"]) : false;
      this.bgObj["ti"]["tabIconWidth"] = obj.hasOwnProperty("tabIconWidth") && !this.utils.isNullOrEmpty(obj["tabIconWidth"]) ? parseInt(obj["tabIconWidth"]) : 0;
      this.bgObj["ti"]["tabIconHeight"] = obj.hasOwnProperty("tabIconHeight") && !this.utils.isNullOrEmpty(obj["tabIconHeight"]) ? parseInt(obj["tabIconHeight"]) : 0;
    } else if (this.groupBgIdx === 5) {

      let pgLayout = {};

      if (this.tabName === "web") {
        pgLayout = obj.hasOwnProperty("pageLayout") ? obj["pageLayout"] : {};
        delete this.bgObj["pageLayout"]["navigationTabOnBottom"];
      } else {
        pgLayout = obj.hasOwnProperty("pageLayout") ? obj["pageLayout"] : {};
      }

      this.bgObj["pageLayout"]["standardNumberOfColumns"] = pgLayout.hasOwnProperty("standardNumberOfColumns") ? pgLayout["standardNumberOfColumns"] : 2;
      this.bgObj["pageLayout"]["minSquareIconSize"] = pgLayout.hasOwnProperty("minSquareIconSize") ? pgLayout["minSquareIconSize"] : 80;
      this.bgObj["pageLayout"]["spacingBetweenIcons"] = pgLayout.hasOwnProperty("spacingBetweenIcons") ? pgLayout["spacingBetweenIcons"] : 10;

      if (this.tabName === "mobile") {
        this.bgObj["pageLayout"]["navigationTabOnBottom"] = pgLayout.hasOwnProperty("navigationTabOnBottom") && !this.utils.isNullOrEmpty(pgLayout["navigationTabOnBottom"]) ? this.utils.convertToBoolean(pgLayout["navigationTabOnBottom"]) : false;
      } else {
        this.bgObj["pageLayout"]["bgdImageUrl"] = pgLayout.hasOwnProperty("bgdImageUrl") && !this.utils.isNullOrEmpty(pgLayout["bgdImageUrl"]) ? pgLayout["bgdImageUrl"] : "";
      }
    } else if (this.groupBgIdx === 6 || this.groupBgIdx === 7) {

      let iconObj = this.groupBgIdx === 6 && obj.hasOwnProperty("singleWidthSquareDetails") ? obj["singleWidthSquareDetails"] : this.groupBgIdx === 7 && obj.hasOwnProperty("doubleWidthSquareDetails") ? obj["doubleWidthSquareDetails"] : {};

      this.bgObj["squareWideIcon"]["verticalAlignment"] = iconObj.hasOwnProperty("verticalAlignment") ? iconObj["verticalAlignment"] : "bottom";
      this.bgObj["squareWideIcon"]["horizontalAlignment"] = iconObj.hasOwnProperty("horizontalAlignment") ? iconObj["horizontalAlignment"] : "center";
      this.bgObj["squareWideIcon"]["verticalOffset"] = iconObj.hasOwnProperty("verticalOffset") && !this.utils.isNullOrEmpty(iconObj["verticalOffset"]) ? parseInt(iconObj["verticalOffset"]) : 0;
      this.bgObj["squareWideIcon"]["horizontalOffset"] = iconObj.hasOwnProperty("horizontalOffset") && !this.utils.isNullOrEmpty(iconObj["horizontalOffset"]) ? parseInt(iconObj["horizontalOffset"]) : 0;
      this.bgObj["squareWideIcon"]["border"] = iconObj.hasOwnProperty("border") && !this.utils.isNullOrEmpty(iconObj["border"]) ? this.utils.convertToBoolean(iconObj["border"]) : false;
      this.bgObj["squareWideIcon"]["fontSize"] = iconObj.hasOwnProperty("fontSize") && !this.utils.isNullOrEmpty(iconObj["fontSize"]) ? parseInt(iconObj["fontSize"]) : 12;
      this.bgObj["squareWideIcon"]["textBackgroundColor"] = iconObj.hasOwnProperty("textBackgroundColor") ? iconObj["textBackgroundColor"] : "#FFFFFF";
      this.bgObj["squareWideIcon"]["textBackgroundAlpha"] = iconObj.hasOwnProperty("textBackgroundAlpha") && !this.utils.isNullOrEmpty(iconObj["textBackgroundAlpha"]) ? parseFloat(iconObj["textBackgroundAlpha"]) : 0.2;
      this.bgObj["squareWideIcon"]["fontColor"] = iconObj.hasOwnProperty("fontColor") ? iconObj["fontColor"] : "#000000";
      this.bgObj["squareWideIcon"]["fontBold"] = iconObj.hasOwnProperty("fontBold") && !this.utils.isNullOrEmpty(iconObj["fontBold"]) ? this.utils.convertToBoolean(iconObj["fontBold"]) : false;
    } else if (this.groupBgIdx === 8) {

      this.bgObj["flw"]["follow"] = obj.hasOwnProperty("follow") ? obj["follow"] : "";
      this.bgObj["flw"]["linkToNotifications"] = obj.hasOwnProperty("linkToNotifications") ? obj["linkToNotifications"] : "";
    }
  };

  pageUpdate(updateObj: Object, showMsg?: boolean) {
    var pageId = this.pageData["_id"];

    this.pageService.pageUpdate(pageId, updateObj)
      .then(pagUpdateObj => {
        if (showMsg) {
          this.utils.iAlert('success', '', 'Page updated successfully');
        }

        this.getPageData();
      });
  };

  getImageWidthHeight(file: any, cb: any) {
    let fr: FileReader = new FileReader();     // File reader new Instance

    fr.onload = () => {           // File onload callback method
      var img = new Image;

      img.onload = () => {      // Image on load callback method
        var resultObj = {
          "width": img.width,
          "height": img.height
        }

        cb(resultObj);
      };

      img.src = fr.result; // Data URL because called with readAsDataURL
    };

    fr.readAsDataURL(file);  // Assigning the file as data URL
  };

  deleteMenuImages(e: any, type?: string) {
    e.preventDefault();
    let pageObj = this.pageData;

    let imageToDelete = {
      "appId": pageObj["appId"],
      "pageId": pageObj["_id"],
      "pagefrom": this.tabName
    };

    var imgUrl = "";
    var updateObj = {};

    if (this.groupBgIdx === 0) {
      imgUrl = this.bgObj["pt"]["background"];
      this.bgObj["pt"]["background"] = "";
      this.menuImageData["pt"] = "";
    } else if (this.groupBgIdx === 1) {

      imgUrl = type === "bgp" ? this.bgObj["bgpl"]["background_portrait"] : this.bgObj["bgpl"]["background_landscape"];

      if (type === "bgp") {
        this.bgObj["bgpl"]["background_portrait"] = "";
        this.menuImageData["bgp"] = "";
      } else {
        this.bgObj["bgpl"]["background_landscape"] = "";
        this.menuImageData["bgl"] = "";
      }
    } else if (this.groupBgIdx === 2) {

      imgUrl = this.bgObj["tp"]["top_banner"];
      this.bgObj["tp"]["top_banner"] = "";
      this.menuImageData["tp"] = "";
    } else if (this.groupBgIdx === 4) {

      imgUrl = this.bgObj["ti"]["tabIcon"];
      this.bgObj["ti"]["tabIcon"] = "";
      this.menuImageData["ti"] = "";
    }

    if (!this.utils.isNullOrEmpty(imgUrl)) {
      var index = imgUrl.lastIndexOf("/") + 1;
      var filename = imgUrl.substr(index);

      imageToDelete["name"] = filename;

      this.pageService.removeMenuBackgroundImage(imageToDelete)
        .then(pagUpdateObj => {
          this.updatePageData("", true);
        });
    }
  };

  loadImages() {
    let imgData = {
      "appId": this.pageData["appId"],
      "pageId": this.pageData["_id"],
      "pagefrom": this.tabName
    }

    this.pageService.menuImageList(imgData)
      .then(imgList => {
        if (this.utils.isArray(imgList) && imgList.length > 0) {
          this.splitImageByType(imgList);
        }

        this.setMenuObjData();
      });
  };

  splitImageByType(imgs: any[]) {
    for (let i = 0; i < imgs.length; i++) {
      let imgPath = imgs[i];
      let index = imgPath.lastIndexOf("/") + 1;
      let filename = imgPath.substr(index);
      let fileContent = filename.split('.');
      let fileArray = fileContent[0].split('_');
      let fileLength = fileArray.length;
      fileLength = fileLength - 1;
      let imgType = fileArray[fileLength];

      if (!this.utils.isNullOrEmpty(imgType) && this.menuImageData.hasOwnProperty(imgType)) {
        this.menuImageData[imgType] = imgPath;
      }
    }
  };

  getPageData() {
    let pageId = this.pageData["_id"];
    let orgId = this.pageData["orgId"];
    let appId = this.pageData["appId"];
    let locationId = this.pageData.hasOwnProperty("locationId") && !this.utils.isNullOrEmpty(this.pageData["locationId"]) ? this.pageData["locationId"] : "-1";
    let formData = { "_id": pageId };

    this.pageService.getPages(orgId, appId, locationId, formData)
      .then(pgs => {
        if (this.utils.isArray(pgs) && pgs.length > 0) {
          this.pageData = pgs[0];
        }
      });
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("showModal") && cHObj["showModal"]["currentValue"]) {
      setTimeout(() => {
        this.menuBG();
      });
    }
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.resetMenuBg();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
