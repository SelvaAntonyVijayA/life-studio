import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, EventEmitter, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../../helpers/utils';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service'

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
    private route: ActivatedRoute
  ) {

  }
  modalRef: BsModalRef;
  @ViewChild('menuBgLib') menuBgLib: ModalDirective;
  @Input('show-modal') showModal: boolean = false;
  menuBgContent = new EventEmitter<any>();
  menuBgGroupNames: string[] = [
    "Background Pattern", "Background Image",
    "Top Banner", "Nav Bar",
    "Tab Icon", "Page Layout",
    "Square Icon", "Wide Icon",
    "Follow"];
  groupBgIdx: number = -1;
  tabIndex: number = 0;
  private orgChangeDetect: any;
  bgColor: string = "";

  menuBG() {
    this.menuBgLib.show();
  };

  onClose() {
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
  };

  tabChange(e: any) {
    this.tabIndex = this.tabIndex === 0 ? 1 : 0;
    this.resetMenuBg();
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
