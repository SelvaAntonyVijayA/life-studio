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
  modalRef: BsModalRef;
  @ViewChild('menuBgLib') menuBgLib: ModalDirective;
  @ViewChild('fileBgp') fileBgp: ElementRef;
  @Input('show-modal') showModal: boolean = false;
  @Input('pageData') pageData: Object = {};
  menuBgContent = new EventEmitter<any>();
  menuBgGroupNames: string[] = [];
  groupBgIdx: number = -1;
  tabName: string = "mobile";
  private orgChangeDetect: any;
  bgObj: Object = {};

  menuBG() {
    if (!this.utils.isEmptyObject(this.pageData)) {
      this.menuBgLib.show();
    }
  };

  onClose() {
    this.resetMenuBg();
    this.menuBgLib.hide();
  };

  onHide(e: any) {
    this.menuBgContent.emit({ "close": true });
  };

  selectGroupOption(e: any, idx: number) {
    this.groupBgIdx = idx;
  };

  resetMenuBg() {
    this.groupBgIdx = 0;
    this.bgObj = this.pageBgObjectAssign();
    this.tabName = "mobile";
    this.menuBgGroupNames = ["Background Pattern", "Background Image", "Top Banner", "Nav Bar",
      "Tab Icon", "Page Layout", "Square Icon", "Wide Icon", "Follow"];
  };

  tabChange(e: any, tbName: string) {
    if (this.tabName !== tbName) {
      this.tabName = tbName;
      this.resetMenuBg();
    }
  };

  colorChange(e: any, code: string) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.utils.isNullOrEmpty(code)) {
      var validCode = this.checkColorCode(code);

      if (!validCode) {
        this.notValidColor();
      }
    }
  }

  checkColorCode(code?: string) {
    var isValid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(code);

    return isValid;
  };

  notValidColor() {
    this.utils.iAlert('error', 'Error', 'Not a valid color code');
  };

  imageFileUpload(files: FileList, grpType: string) {
    let file = files.item(0);

    if (!this.utils.isNullOrEmpty(file)) {
      let formData: any = new FormData();
      formData.append("isEncoded", false);
      formData.append("appId", "57ac21576c5eebe54e9ed989");
      formData.append("pageId", "5980459fbf0686ac2659f680");
      formData.append("type", "pt");
      formData.append("pagefrom", "mobile");
      formData.append("file[]", file);

      this.pageService.imageUpload("/image/bgpatternupload/", formData)
        .then(img => {
          this.bgObj["bgp"]["background"] = !this.utils.isEmptyObject(img) && img.hasOwnProperty("imageUrl") ? img["imageUrl"] : "";
        });
    }
  };

  pageBgObjectAssign() {
    return {
      bgp: {
        "background": "",
        "pageBackgroundColor": "",
      },
      navBar: {
        "fontColor": "",
        "backgroundColor": "",
        "bannerFontColor": "",
        "bannerColor": "",
        "navbarFontSize": ""
      },
      squareWideIcon: {
        verticalAlignment: "bottom",
        horizontalAlignment: "center",
        verticalOffset: 0,
        horizontalOffset: 0,
        border: false,
        fontSize: 12,
        textBackgroundColor: "#FFFFFF",
        textBackgroundAlpha: 0.3,
        fontColor: "#000000",
        fontBold: false
      }
    };
  }

  fileProcess(e: any, grpType: string) {
    e.preventDefault();

    if (grpType === "bgp") {
      this.fileBgp.nativeElement.click();
    };
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
