import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { NgOption, NG_SELECT_DEFAULT_CONFIG } from '../../ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_SELECT_DEFAULT_CONFIG,
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
export class DemoComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private imageService: ImageService,
    private e1: ElementRef,
    private renderer: Renderer2,
    public utils: Utils) { }

  private orgChangeDetect: any;
  oid: string = "";
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


  onOpen(e: any) {
  };

  onClose(e: any) {
  };

  onFocus(e: any) {
  };

  onBlur(e: any) {
  };

  onAdd(e: any) {
  }

  onRemove(e: any) {
  }

  onChange(e: any) {
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
                }
              });
          }
        })
      }
    }
  }

  onClear(e: any) {
  }

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.oid = Cookie.get('oid');
      this.selectedOrganization = this.oid;
      this.loadFolders();
    });
  }

}
