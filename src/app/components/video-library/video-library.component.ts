import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Utils } from '../../helpers/utils';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.css']
})
export class VideoLibraryComponent implements OnInit {

  constructor(private e1: ElementRef,
    public utils: Utils,
    private modalService: BsModalService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute) { }

  modalRef: BsModalRef;
  @ViewChild('videoLibrary') videoLibrary: ModalDirective;
  @Input('show-modal') showModal: boolean = false;
  @Input('tileId') tileId: string = "";
  @Input('tileData') tileData: Object = {};
  @ViewChild('fileVideo') fileVideo: ElementRef;
  pageTitle: string = "";
  videoFileName: string = "";
  output = new EventEmitter<any>();
  private orgChangeDetect: any;
  oid: string = "";
  videos: any[] = [];

  showDialog() {
    if (!this.utils.isEmptyObject(this.tileData)) {
      this.pageTitle = "Video Library";
      this.videoLibrary.show();
    }
  };

  /* Closing the popup */
  onClose() {
    this.reset();
    this.videoLibrary.hide();
  };

  onHide(e: any) {
    this.output.emit({
      "tileData": this.tileData,
      "close": true
    });
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("showModal") && cHObj["showModal"]["currentValue"]) {
      setTimeout(() => {
        this.showDialog();
      });
    }
  };

  fileProcess(e: any) {
    e.preventDefault();
    this.fileVideo.nativeElement.click();
  };

  uploadVideo(formData: any) {

  };

  videoFileUpload(files: FileList) {
    let currFile = files.item(0);
    this.videoFileName = currFile.name;

    if (!this.utils.isNullOrEmpty(currFile)) {
      let formData = this.getFormData(currFile);

      this.uploadVideo(formData);
    }
  }

  getFormData(file: any) {
    let tileId = this.tileId;

    let formData: any = new FormData();
    formData.append("tileId", tileId);
    formData.append("file[]", file);

    return formData;
  };

  deleteVideo(e: any, url: string, type?: string) {
    e.preventDefault();
    let obj = this.tileData;
    let imageToDelete = { imageUrl: url, tileId: this.tileId, type: type }

  };

  reset() {
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.reset();
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
