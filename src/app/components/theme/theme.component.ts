import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { CommonService } from '../../services/common.service';
import { Utils } from '../../helpers/utils';
import { ThemeService } from '../../services/theme.service';
declare var $: any;

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css']
})
export class ThemeComponent implements OnInit {
  constructor(private route: ActivatedRoute,
    private cms: CommonService,
    private themeService: ThemeService,
    private e1: ElementRef,
    private renderer: Renderer) {
    this.utils = Utils;
  }

  utils: any;
  themes: any[] = [];
  selectedOrganization: string = "-1";
  theme: Object = {};
  private orgChangeDetect: any;

  pageColor: string = "";
  pageFontSize: string = "";
  pageFontColor: string = "";
  pageFontFamily: string = "";
  pageLineHeight: string = "";
  pagePlaceHolderColor: string = "";
  pageFillColor: string = "";
  txtFocusColor: string = "";
  pagePanelColor: string = "";
  pagePanelTextColor: string = "";
  buttonBackgroundColor: string = "";
  buttonSelectedColor: string = "";
  buttonTextColor: string = "";
  buttonHoverColor: string = "";
  buttonFontFamily: string = "";
  buttonBorderRadius: string = "";
  buttonFloat: string = "";
  buttonWidth: string = "";
  buttonTextAlign: string = "";
  boxColor: string = "";
  borderColor: string = "";
  popupColor: string = "";
  popupTextColor: string = "";
  socialColor: string = "";
  pageInput: string = "";
  radioWidth: string = "";
  radioHeight: string = "";
  radioBorder: string = "";
  radioBoxShadow: string = "";
  radioBoxShadowHover: string = "";
  radioCheckedBeforeBg: string = "";
  oid: string = "";
  id: string = "";
  createdOrg: string = "";
  organizationId: string = "";
  radioOutline: string = "";
  radioBorderRadious: string = "";
  createdBy: string = "";
  dateCreated: string = "";
  name: string = "";
  role: string = "";
  raccess: object = {};

  newTheme() {
  };

  saveTheme() {
  };

  saveAsTheme() {
  };

  deleteTheme() {
  };

  previewTheme() {

  };

  getUserSession() {
    this.themeService.getUserSession()
      .then(result => {
        this.raccess = result;
      });
  };

  getThemeObject(isSaveAs) {
    var themeObj = {};
    var role = this.raccess["name"];

    themeObj["name"] = $('.theme_title').val();
    themeObj["dateCreated"] = (new Date()).toUTCString();
    themeObj["createdOrg"] = this.oid;
    themeObj["role"] = this.raccess["name"];
    themeObj["lastUpdatedOn"] = (new Date()).toUTCString();

    if (role.toLowerCase() !== 'iliadmin') {
      themeObj["organizationId"] = this.oid;
    }

    if (this.id != "-1" && !isSaveAs) {
      themeObj["_id"] = this.id;
    }

    //if ($('.id').val())
    themeObj["features"] = {
      "pageColor": this.pageColor,
      "pageFontSize": this.pageFontSize,
      "pageFontColor": this.pageFontColor,
      "pageFontFamily": this.pageFontFamily,
      "pageLineHeight": this.pageLineHeight,
      "pagePlaceHolderColor": this.pagePlaceHolderColor,
      "pageFillColor": this.pageFillColor,
      "txtFocusColor": this.txtFocusColor,
      "pagePanelColor": this.pagePanelColor,
      "pagePanelTextColor": this.pagePanelTextColor,
      "buttonBackgroundColor": this.buttonBackgroundColor,
      "buttonSelectedColor": this.buttonSelectedColor,
      "buttonTextColor": this.buttonTextColor,
      "buttonHoverColor": this.buttonHoverColor,
      "buttonFontFamily": this.buttonBorderRadius,
      "buttonBorderRadius": this.pageFillColor,
      "buttonFloat": this.buttonFloat,
      "buttonWidth": this.buttonWidth,
      "buttonTextAlign": this.buttonTextAlign,
      "radioOutline": this.radioOutline,
      "radioBorderRadious": this.radioBorderRadious,
      "boxColor": this.boxColor,
      "borderColor": this.borderColor,
      "popupColor": this.popupColor,
      "popupTextColor": this.popupTextColor,
      "socialColor": this.socialColor,
      "pageInput": this.pageInput,
      "radioWidth": this.radioWidth,
      "radioHeight": this.radioHeight,
      "radioBorder": this.radioBorder,
      "radioBoxShadow": this.radioBoxShadow,
      "radioBoxShadowHover": this.radioBoxShadowHover,
      "radioCheckedBeforeBg": this.radioCheckedBeforeBg
    };

    return themeObj;
  };

  resetValues(theme: any) {
    this.pageColor = theme && theme.features ? theme.features.pageColor : "";
    this.pageFontSize = theme && theme.features ? theme.features.pageFontSize : '';
    this.pageFontColor = theme && theme.features ? theme.features.pageFontColor : '';
    this.pageFontFamily = theme && theme.features ? theme.features.pageFontFamily : '';
    this.pageFontFamily = theme && theme.features ? theme.features.pageLineHeight : '';
    this.pagePlaceHolderColor = theme && theme.features ? theme.features.pagePlaceHolderColor : '';
    this.pageFillColor = theme && theme.features ? theme.features.pageFillColor : '';
    this.txtFocusColor = theme && theme.features ? theme.features.txtFocusColor : '';
    this.pagePanelColor = theme && theme.features ? theme.features.pagePanelColor : '';
    this.pagePanelTextColor = theme && theme.features ? theme.features.pagePanelTextColor : '';
    this.buttonBackgroundColor = theme && theme.features ? theme.features.buttonBackgroundColor : '';
    this.buttonSelectedColor = theme && theme.features ? theme.features.buttonSelectedColor : '';
    this.buttonTextColor = theme && theme.features ? theme.features.buttonTextColor : '';
    this.buttonHoverColor = theme && theme.features ? theme.features.buttonHoverColor : '';
    this.buttonFontFamily = theme && theme.features ? theme.features.buttonFontFamily : '';
    this.buttonBorderRadius = theme && theme.features ? theme.features.buttonBorderRadius : '';
    this.buttonFloat = theme && theme.features ? theme.features.buttonFloat : '';
    this.buttonWidth = theme && theme.features ? theme.features.buttonWidth : '';
    this.buttonTextAlign = theme && theme.features ? theme.features.buttonTextAlign : '';
    this.boxColor = theme && theme.features ? theme.features.boxColor : '';
    this.borderColor = theme && theme.features ? theme.features.borderColor : '';
    this.popupColor = theme && theme.features ? theme.features.popupColor : '';
    this.popupTextColor = theme && theme.features ? theme.features.popupTextColor : '';
    this.socialColor = theme && theme.features ? theme.features.socialColor : '';
    this.pageInput = theme && theme.features ? theme.features.pageInput : '';
    this.radioWidth = theme && theme.features ? theme.features.radioWidth : '';
    this.radioHeight = theme && theme.features ? theme.features.radioHeight : '';
    this.radioBorder = theme && theme.features ? theme.features.radioBorder : '';
    this.radioBoxShadow = theme && theme.features ? theme.features.radioBoxShadow : '';
    this.radioBoxShadowHover = theme && theme.features ? theme.features.radioBoxShadowHover : '';
    this.radioCheckedBeforeBg = theme && theme.features ? theme.features.radioCheckedBeforeBg : '';
    this.radioBorderRadious = theme && theme.radioBorderRadious ? theme.radioBorderRadious : '';
    this.radioOutline = theme && theme.radioOutline ? theme.radioOutline : '';
    this.id = theme ? theme._id : '';
    this.createdOrg = theme && theme.createdOrg ? theme.createdOrg : '';
    this.organizationId = theme && theme.organizationId ? theme.organizationId : '';
    this.name = theme && theme.name ? theme.name : '';
    this.dateCreated = theme && theme.dateCreated ? theme.dateCreated : '';
    this.createdBy = theme && theme.createdBy ? theme.createdBy : '';
    this.role = theme && theme.role ? theme.role : '';
    this.theme = theme && theme.features && !this.utils.isEmptyObject(theme) ? JSON.stringify(theme) : {};
  };

  loadThemes(id?: string) {
    this.themeService.getThemes(this.oid, id)
      .then(themes => {
        this.themes = themes;
      });
  };

  _save(isSaveAs, auto) {
    var themeObj = this.getThemeObject(isSaveAs);

    $.ajax({
      type: "POST",
      cache: false,
      async: false,
      data: {
        "form_data": JSON.stringify(themeObj)
      },
      url: '/tiletheme/save',
      success: function (res) {
        this.loadThemes(res._id);

        if (auto) {
          this.themeService.updatePreviewTile($("#themesList").val(), true);

        } else {
          alert('Theme Saved');
        }
      }
    });
  };
  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.oid = Cookie.get('oid');
      this.selectedOrganization = this.oid;
      this.getUserSession();
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };

}
