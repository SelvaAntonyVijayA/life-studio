import { Component, OnInit, OnDestroy, Directive, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { NgOption, NG_SELECT_DEFAULT_CONFIG } from '../../ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { ImageService } from '../../services/image.service';
const URL = 'http://localhost:8080/image/upload';
import { ProgressHttp, HTTP_FACTORY } from 'angular-progress-http';
import { LoggingHttpFactory } from './logging-http/logging-http-factory';

interface FileDescriptor {
  name: string;
  file: File;
  uploaded: boolean;
  percentage?: number;
  size?: any;
}

@Component({
  selector: 'app-imagelibrary',
  templateUrl: './imagelibrary.component.html',
  styleUrls: ['./imagelibrary.component.css'],
  providers: [
    {
      useClass: LoggingHttpFactory,
      provide: [NG_SELECT_DEFAULT_CONFIG, HTTP_FACTORY],
      useValue: {
        notFoundText: 'No folder found',
        typeToSearchText: 'Type to search',
        addTagText: 'Add folder',
        loadingText: 'Loading...',
        clearAllText: 'Clear all',
        disableVirtualScroll: false
      }
    }
  ]
})

export class ImagelibraryComponent implements OnInit {
  public fileD: FileDescriptor;
  public isReady: boolean = false;
  public isUploading: boolean = false;
  public isUploaded: boolean = false;
  public isSuccess: boolean = false;
  public isCancel: boolean = false;
  public isError: boolean = false;
  public isImageSelect: boolean = false;
  selectedimage: string = "";
  selectedimages: any[] = [];
  isSingleClick: boolean = false;
  httpRequest: any = null;
  fileName: string = "or select an image from library";

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private imageService: ImageService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils,
    private progressHttp: ProgressHttp) { }

  onFileSelected(f: File) {
    this.fileName = f.name;
    this.isUploading = true;

    this.fileD = {
      name: f.name,
      file: f,
      size: f.size,
      uploaded: false,
      percentage: null
    };
  }

  upload() {
    const f = this.fileD;

    let form = new FormData();
    let formData: any = new FormData();
    formData.append("isEncoded", false);
    formData.append("folder", this.utils.isNullOrEmpty(this.selectedFolders) ? "" : this.selectedFolders);
    formData.append("popupFrom", this.popFrom);
    formData.append("type", "art");
    formData.append("file[]", f.file);

    this.httpRequest = this.progressHttp
      .withUploadProgressListener(progress => {
        console.dir(progress)
        f.percentage = progress.percentage;
      })
      .post(URL, formData)
      .subscribe((r) => {
        if (r.ok) {
          var result = JSON.parse(r["_body"]);
          this.selectedimage = result["imageUrl"];

          console.dir(result)
          f.uploaded = true;
          this.resetFile();
          this.loadImages();
        } else {
          this.utils.iAlert('error', 'Error', 'Error Occurs. Please try again!!!');
        }
      })
  }

  resetFile() {
    this.fileName = "or select an image from library";
    this.isUploading = false;
    this.fileD = {
      name: null,
      file: null,
      size: null,
      uploaded: null,
      percentage: null
    };
  }

  public cancel(e: any) {
    this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to abort the request?", "Yes", "No", (res) => {
      if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
        if (this.httpRequest) {
          this.httpRequest.unsubscribe();
        }
        
        this.resetFile();
      }
    })
  }

  public remove(e: any) {
    if (this.selectedimages.length > 0) {
      this.utils.iAlertConfirm("confirm", "Confirm", "Are you sure want to delete this images?", "Yes", "No", (res) => {
        if (res.hasOwnProperty("resolved") && res["resolved"] == true) {

          var obj = {};
          obj["src"] = this.selectedimages;
          obj["folder"] = this.selectedFolders;

          this.imageService.deleteImage(obj)
            .then(res => {
              if (res.status) {
                this.utils.iAlert('success', '', 'Image are deleted successfully');
                this.loadImages();
              }
            });
        }
      })
    } else {
      this.utils.iAlert('error', 'Error', 'Please select a images to delete');
    }
  }

  home() {
    this.selectedFolders = undefined;
    this.loadImages();
  }

  selectImage(e: any, url: string, click: string) {
    e.preventDefault();
    e.stopPropagation();

    setTimeout(function () {
      if (this.isSingleClick) {
        return;
      }
    }, 500);

    this.removeImage(url)
  }

  imageDoubleClick(e: any, url: string) {
    e.preventDefault();
    e.stopPropagation();

    this.isSingleClick = false;
    setTimeout(function () {
      this.isSingleClick = true;
      return;
    }, 500);

    this.selectedimage = url;
  }

  crop() {
    if (this.selectedimages.length > 0) {
      var url = this.selectedimages[this.selectedimages.length - 1];
    } else {
      this.utils.iAlert('error', 'Error', 'Please select a image');
    }
  }

  withOutCrop() {
    if (this.selectedimages.length > 0) {
      var url = this.selectedimages[this.selectedimages.length - 1];
    } else {
      this.utils.iAlert('error', 'Error', 'Please select a image');
    }
  }

  removeImage(element: string) {
    const index = this.selectedimages.indexOf(element);

    if (index != -1) {
      this.selectedimages.splice(index, 1);
    } else {
      this.selectedimages.push(element);
    }
  }

  isImageExists(element: string) {
    const index = this.selectedimages.indexOf(element);

    if (index != -1) {
      return true;
    } else {
      return false;
    }
  }

  private orgChangeDetect: any;
  oid: string = "";
  page: string = "tile";
  popFrom: string = "tileart";
  images: any[] = [];
  folders: any[] = [];
  selectedFolders: any;
  selectedOrganization: string = "-1";

  loadFolders() {
    this.imageService.folderList(this.oid)
      .then(folders => {
        this.folders = [];

        if (folders && folders.length > 0) {
          this.folders = folders;
        }
      });
  };

  loadImages() {
    this.imageService.imageList(this.oid, this.selectedFolders)
      .then(imagelist => {
        this.images = [];

        if (imagelist && imagelist.length > 0) {
          this.images = imagelist;
        }
      });
  };

  onBlur(e: any) {

  }

  onAdd(e: any) {

  }

  onChange(e: any) {
    this.loadImages();
  }

  onSelectChange(e: any) {
    if (!this.utils.isNullOrEmpty(e.isNotFound) && e.isNotFound && !this.utils.isNullOrEmpty(e.term)) {
      if (e.term == 'categories' || e.term == 'icons') {
        this.utils.iAlert('info', 'Information', 'The folder name already exists!!!');

        return;
      } else {
        this.utils.iAlertConfirm("confirm", "Confirm", "The entered folder didn't match with existing, would you like to add press OK.", "Ok", "Cancel", (res) => {

          if (res.hasOwnProperty("resolved") && res["resolved"] == true) {
            var folder = {};
            var folderName = e.term;
            folderName = folderName.replace(/\s+/g, '_');
            folder["name"] = folderName;
            folder["organizationId"] = this.oid;

            this.imageService.saveFolder(folder)
              .then(res => {
                if (res.status) {
                  this.loadFolders();
                  this.selectedFolders = e.term;
                  this.loadImages();
                }
              });
          }
        })
      }
    }
  }

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.oid = Cookie.get('oid');
      this.selectedOrganization = this.oid;
      this.loadFolders();
      this.loadImages();
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
