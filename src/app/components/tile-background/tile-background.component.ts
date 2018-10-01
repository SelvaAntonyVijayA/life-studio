
import { Component, OnInit, Input, ViewChild, ElementRef,  EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { Utils } from '../../helpers/utils';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TileService } from '../../services/tile.service';

@Component({
  selector: 'tile-background',
  templateUrl: './tile-background.component.html',
  styleUrls: ['./tile-background.component.css'],
  outputs: ["tileBgContent"]
})
export class TileBackgroundComponent implements OnInit {

  constructor(private e1: ElementRef,
    public utils: Utils,
    private modalService: BsModalService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private tileService: TileService) { }


  modalRef: BsModalRef;
  @ViewChild('tileBgLib') tileBgLib: ModalDirective;
  @Input('show-modal') showModal: boolean = false;
  @Input('tileId') tileId: string = "";
  @Input('tileData') tileData: Object = {};
  @ViewChild('fileBgp') fileBgp: ElementRef;
  @ViewChild('fileBgl') fileBgl: ElementRef;
  pageTitle: string = "";
  tileBgContent = new EventEmitter<any>();
  private orgChangeDetect: any;

  reset() {
  };

  fileProcess(e: any, type: string) {
    e.preventDefault();

    if (type === "landscape") {
      this.fileBgl.nativeElement.click();

    } else if (type === "portrait") {
      this.fileBgp.nativeElement.click();
    }
  };

  imageFileUpload(files: FileList, type: string) {
    let currFile = files.item(0);

    if (!this.utils.isNullOrEmpty(currFile)) {
      let formData = this.getImageFormData(currFile, type);

      this.uploadImage(formData, type);
    }
  }

  getImageFormData(file: any, type: string) {
    let tileId = this.tileId;

    let formData: any = new FormData();
    formData.append("tileId", tileId);
    formData.append("type", type);
    formData.append("file[]", file);

    return formData;
  };

  deleteTileBg(e: any, url: string, type?: string) {
    e.preventDefault();
    let obj = this.tileData;
    let imageToDelete = { imageUrl: url, tileId: this.tileId, type: type }

    this.tileService.removeBackgroundImage(imageToDelete)
      .then(pagUpdateObj => {

        if (type === "portrait") {
          this.tileData["tileBackgroundPortrait"] = "";
          this.fileBgp.nativeElement.value = "";
        } else {
          this.tileData["tileBackgroundLandscape"] = "";
          this.fileBgl.nativeElement.value = "";
        }
      });
  };

  showDialog() {
    if (!this.utils.isEmptyObject(this.tileData)) {
      this.pageTitle = "TILE BACKGROUNDS";
      this.tileBgLib.show();
    }
  };

  uploadImage(formData: any, type: string) {
    this.tileService.imageUpload("/image/tilebackground/", formData)
      .then(img => {
        var imageUrl = !this.utils.isEmptyObject(img) && img.hasOwnProperty("imageUrl") ? img["imageUrl"] : "";

        if (type === "portrait") {
          this.fileBgp.nativeElement.value = "";
          this.tileData["tileBackgroundPortrait"] = imageUrl;
        } else if (type === "landscape") {
          this.fileBgl.nativeElement.value = "";
          this.tileData["tileBackgroundLandscape"] = imageUrl;
        }
      });
  };

  /* Closing the popup */
  onClose() {
    this.reset();
    this.tileBgLib.hide();
  };

  onHide(e: any) {
    this.tileBgContent.emit({
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

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.reset();
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
