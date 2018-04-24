import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, EventEmitter, OnDestroy, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../../helpers/utils';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-recurrence',
  templateUrl: './recurrence.component.html',
  styleUrls: ['./recurrence.component.css']
})
export class RecurrenceComponent implements OnInit {

  constructor(
    private e1: ElementRef,
    public utils: Utils,
    private modalService: BsModalService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
  }

  modalRef: BsModalRef;
  @ViewChild('recurrencePopup') recurrencePopup: ModalDirective;
  @Input('show-modal') showModal: boolean = false;
  private orgChangeDetect: any;

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
    });
  }

  done(e: any) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
    }

    this.recurrencePopup.hide();
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("showModal") && cHObj["showModal"]["currentValue"]) {
      setTimeout(() => {
        
        //this.menuBG();
      });
    }
  };

  onClose() {
    this.recurrencePopup.hide();
  };

  onHide(e: any) {
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
