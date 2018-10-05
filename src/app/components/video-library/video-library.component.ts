import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Utils } from '../../helpers/utils';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CommonService } from '../../services/common.service';
import { VideoService } from '../../services/video.service';
import { FileUploader } from 'ng2-file-upload';
import { ProgressHttp } from 'angular-progress-http';
import {
  HttpClient, HttpEvent, HttpEventType, HttpProgressEvent,
  HttpRequest, HttpResponse, HttpErrorResponse
} from '@angular/common/http';

interface FileDescriptor {
  name: string;
  file: File;
  uploaded: boolean;
  percentage?: number;
  size?: any;
}

@Component({
  selector: 'video-library',
  templateUrl: './video-library.component.html',
  styleUrls: ['./video-library.component.css'],
  outputs: ["output"]
})

export class VideoLibraryComponent implements OnInit {

  constructor(private e1: ElementRef,
    public utils: Utils,
    private progressHttp: ProgressHttp,
    private modalService: BsModalService,
    private cms: CommonService,
    private videoService: VideoService,
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private route: ActivatedRoute) { }

  uploader: FileUploader;
  public fileD: FileDescriptor;
  modalRef: BsModalRef;
  @ViewChild('videoLibrary') videoLibrary: ModalDirective;
  @Input('show-modal') showModal: boolean = false;
  @Input() tileId: string = "";
  @Input() page: string = "";
  @Input() videoPopFrom: string = "";
  @Input() data: Object = {};
  @ViewChild('fileVideo') fileVideo: ElementRef;
  pageTitle: string = "";
  videoFileName: string = "";
  output = new EventEmitter<any>();
  private orgChangeDetect: any;
  oid: string = "";
  videos: any[] = [];
  ticket_id: string = "";
  upload_link: string = "";
  upload_link_secure: string = "";
  complete_uri: string = "";
  uri: string = "";
  selectedVideo: string = "";
  selectedVimeoId: string = "";
  selectedId: string = "";
  httpRequest: any = null;
  public isUploading: boolean = false;

  fileProcess(e: any) {
    e.preventDefault();
    this.fileVideo.nativeElement.click();
  };

  onFileSelected(f: File) {
    this.videoFileName = f.name;
    this.isUploading = true;
    this.selectedVideo = "";
    this.selectedVimeoId = "";
    this.selectedId = "";

    this.fileD = {
      name: f.name,
      file: f,
      size: f.size,
      uploaded: false,
      percentage: null
    };
  };


  videoToken() {
    this.videoService.getVideotokenId()
      .then(res => {
        this.ticket_id = res.ticket_id;
        this.upload_link = res.upload_link;
        this.upload_link_secure = res.upload_link_secure;
        this.complete_uri = res.complete_uri;
        this.uri = res.uri;
      });
  };

  completeVideoUpload() {
    var data = {};
    data["method"] = "DELETE";
    data["ticket_id"] = this.ticket_id;
    data["path"] = this.complete_uri;
    data["organizationId"] = this.oid;

    this.videoService.completeUrl(data)
      .then(obj => {
        var videoId = obj.vimeoId.indexOf(":") !== -1 ? obj.vimeoId.split(":")[0] : obj.vimeoId;
        var url = 'https://player.vimeo.com/video/' + videoId;
        this.selectedVideo = url;
        this.selectedVimeoId = obj.vimeoId;
        this.selectedId = obj._id;
        this.videoLibrary.hide();
      });
  }

  loadVideos() {
    this.videoService.videoList(this.oid)
      .then(videoList => {
        this.videos = [];

        if (videoList && videoList.length > 0) {
          this.videos = videoList;
        }
      });
  };

  selectVideo(e: any, count: any) {
    e.preventDefault();
    e.stopPropagation();

    var obj = this.videos[count];
    var videoId = obj.vimeoId.indexOf(":") !== -1 ? obj.vimeoId.split(":")[0] : obj.vimeoId;
    var url = 'https://player.vimeo.com/video/' + videoId;

    this.selectedVideo = url;
    this.selectedVimeoId = obj.vimeoId;
    this.selectedId = obj._id;

    setTimeout(function () {
      if (this.isSingleClick) {
        return;
      }
    }, 500);

  }

  upload() {
    const f = this.fileD;

    const req = new HttpRequest('PUT', this.upload_link_secure, f.file, {
      reportProgress: true,
    });

    this.http.request(req).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        f.percentage = percentDone;
        console.log(`File is ${percentDone}% uploaded.`);
      } else if (event.type === HttpEventType.Sent) {
        console.log(`Uploading file "${f.name}" of size ${f.size}.`);
      } else if (event instanceof HttpResponse) {
        f.uploaded = true;

        this.completeVideoUpload();
        this.reset();
        this.loadVideos();
      }
    });
  }

  deleteVideo(e: any, count: any) {
    e.preventDefault();
    e.stopPropagation();
    var obj = this.videos[count];
    var videoId = obj.vimeoId.indexOf(":") !== -1 ? obj.vimeoId.split(":")[0] : obj.vimeoId;

    this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this video?", "Yes", "No", (res) => {
      if (res.hasOwnProperty("resolved") && res["resolved"] == true) {

        this.videoService.deleteVideo(obj._id, videoId)
          .then(res => {
            this.utils.iAlert('success', '', 'video is deleted successfully');
            this.loadVideos();
          });
      }
    })
  };

  videoDoubleClick(e: any, count: any) {
    e.preventDefault();
    e.stopPropagation();

    setTimeout(function () {
      this.isSingleClick = true;
      return;
    }, 500);

    var obj = this.videos[count];
    var videoId = obj.vimeoId.indexOf(":") !== -1 ? obj.vimeoId.split(":")[0] : obj.vimeoId;
    var url = 'https://player.vimeo.com/video/' + videoId;

    this.selectedVideo = url;
    this.selectedVimeoId = obj.vimeoId;
    this.selectedId = obj._id;
    this.videoLibrary.hide();
  };

  showDialog() {
    if (!this.utils.isEmptyObject(this.data)) {
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
      url: this.selectedVideo,
      videoId: this.selectedVimeoId,
      id: this.selectedId,
      data: this.data
    });
  };

  ngOnChanges(cHObj: any) {
    if (cHObj.hasOwnProperty("showModal") && cHObj["showModal"]["currentValue"]) {
      setTimeout(() => {
        this.showDialog();
        this.videoToken();
        this.loadVideos();
      });
    }
  };

  public cancel(e: any) {
    this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to abort the request?", "Yes", "No", (res) => {
      if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
        if (this.httpRequest) {
          this.httpRequest.unsubscribe();
        }

        this.reset();
      }
    })
  };

  reset() {
    this.isUploading = false;
    this.videoFileName = "";
    this.fileVideo.nativeElement.value = "";
    this.fileD = {
      name: null,
      file: null,
      size: null,
      uploaded: null,
      percentage: null
    };

    this.videos = [];
    this.selectedVideo = "";
    this.selectedVimeoId = "";
    this.selectedId = "";
  };

  getVideoUrl(id: any, count: any) {
    var videoId = id.indexOf(":") !== -1 ? id.split(":")[0] : id;

    return 'https://player.vimeo.com/video/' + videoId;
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      let loadTime = Cookie.get('pageLoadTime');
      this.oid = Cookie.get('oid');

      if (this.utils.isNullOrEmpty(loadTime) || (!this.utils.isNullOrEmpty(loadTime) && loadTime !== params["_dt"])) {
        Cookie.set('pageLoadTime', params["_dt"]);
        this.reset();
        this.loadVideos();
      }
    });
  };

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
