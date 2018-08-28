import { Component, OnDestroy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../../helpers/utils';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'recurrence-popup',
  templateUrl: './recurrence.component.html',
  styleUrls: ['./recurrence.component.css']
})
export class RecurrenceComponent implements AfterViewInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils
  ) {
  }

  modalRef: BsModalRef;
  @ViewChild('recurrencePopup') recurrencePopup: ModalDirective;
  @Input('show-modal') showModal: boolean = false;

  @Input() page: string;
  @Input() data: object;
  @Input() popFrom: string;
  rrule: string = "";
  recurrenceType: string = "minutely";
  @Output('onDone') doneEvent = new EventEmitter();
  @Output('onClose') closeEvent = new EventEmitter();

  private orgChangeDetect: any;

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
    });
  }

  closeDialog() {
    this.rrule = ""

    var onCloseData = {
      url: this.rrule,
      data: this.data
    };

    this.closeEvent.emit(onCloseData);
  };

  done(e: any) {
    if (!this.utils.isNullOrEmpty(e)) {
      e.preventDefault();
    }

    this.showModal = false;
    this.rrule = ""

    var onCloseData = {
      url: this.rrule,
      data: this.data
    };

    this.recurrencePopup.hide();
    this.doneEvent.emit(onCloseData);
  };

  recurrenceChange(recurrenceType: string) {
    this.recurrenceType = recurrenceType;
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("showModal") && !this.utils.isNullOrEmpty(cHObj["showModal"]["currentValue"])) {
      let objApp = cHObj["showModal"];
      let isOpen = objApp["currentValue"];

      if (isOpen) {
        this.recurrencePopup.show();
      }
    }
  };

  onClose() {
    this.recurrencePopup.hide();
  };

  cancel(e: any) {
    this.recurrencePopup.hide();
  }

  onHide(e: any) {
    this.closeDialog();
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };

  public ngAfterViewInit() {
  }
}
