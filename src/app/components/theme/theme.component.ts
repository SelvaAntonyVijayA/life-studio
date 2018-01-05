import { Component, OnInit, OnDestroy, Input, Output, ElementRef, Renderer2, ViewChild, EventEmitter, ContentChild, ViewEncapsulation } from '@angular/core';
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
    private renderer: Renderer2) {
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
  oldName: string = "";
  role: string = "";
  themeList: string = "-1"
  raccess: object = {};
  selectedThemeObj: object = {};
  save: string = "block";
  saveAs: string = "block";
  delete: string = "block";

  newTheme() {
    this.loadNew();
  };

  saveTheme() {
    if (this.name == "") {
      alert('Theme name is empty');
      return false;
    }

    this._save(false, false);
  };

  saveAsTheme() {
    if (this.name == "") {
      alert('Theme name is empty');
      return false;
    }

    if (this.name == this.oldName) {
      alert('Theme name already exists');
      return false;
    }

    this._save(true, false);
  };

  deleteTheme() {
    if (this.id.trim() != '' && this.id.trim() != '0') {
      var isConfirm = confirm("Are you sure want to delete this Tile?");

      if (isConfirm) {
        this.themeService.deleteTheme(this.id)
          .then(res => {

            if (res && res.msg == 'exists') {
              alert('Theme can not be deleted. Theme has been assigned to tiles');

            } else {
              alert('Theme deleted successfully');
              this.loadThemes();
              this.loadNew();
            }
          });
      }
    } else {
      alert('Please select a Theme to delete');
    }
  };

  previewTheme() {

  };

  themeChange(theme: string) {
    this.loadThemes(theme);
  };

  colorChange(e: any, field) {
    var currentTheme = this.getCurrentTheme();
    e.preventDefault();
    e.stopPropagation();

    if (this[field] != "") {
      var validCode = this.checkColorCode(this[field]);

      if (!validCode) {
        var colorCode = currentTheme != "" ? currentTheme["features"][field] : "";
        this[field] = colorCode;
        this.notValidColor();
      }
    }
  }

  getCurrentTheme() {
    var currentTheme = this.theme;

    return currentTheme;
  };

  checkColorCode(code?: string) {
    var isValid = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(code);

    return isValid;
  };

  notValidColor() {
    alert('Not a valid color code');
  };

  getUserSession() {
    this.themeService.getUserSession()
      .then(result => {
        this.raccess = result;
      });
  };

  getThemeObject(isSaveAs) {
    var themeObj = {};
    var role = this.raccess["role"]["name"];

    themeObj["name"] = this.name;
    themeObj["dateCreated"] = (new Date()).toUTCString();
    themeObj["createdOrg"] = this.oid;
    themeObj["role"] = role;
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

  resetValues(theme?: any) {
    this.pageColor = theme && theme.features && theme.features.hasOwnProperty("pageColor") ? theme.features.pageColor : "";
    this.pageFontSize = theme && theme.features && theme.features.hasOwnProperty("pageFontSize") ? theme.features.pageFontSize : '';
    this.pageFontColor = theme && theme.features && theme.features.hasOwnProperty("pageFontColor") ? theme.features.pageFontColor : '';
    this.pageFontFamily = theme && theme.features && theme.features.hasOwnProperty("pageFontFamily") ? theme.features.pageFontFamily : '';
    this.pageLineHeight = theme && theme.features && theme.features.hasOwnProperty("pageLineHeight") ? theme.features.pageLineHeight : '';
    this.pagePlaceHolderColor = theme && theme.features && theme.features.hasOwnProperty("pagePlaceHolderColor") ? theme.features.pagePlaceHolderColor : '';
    this.pageFillColor = theme && theme.features && theme.features.hasOwnProperty("pageFillColor") ? theme.features.pageFillColor : '';
    this.txtFocusColor = theme && theme.features && theme.features.hasOwnProperty("txtFocusColor") ? theme.features.txtFocusColor : '';
    this.pagePanelColor = theme && theme.features && theme.features.hasOwnProperty("pagePanelColor") ? theme.features.pagePanelColor : '';
    this.pagePanelTextColor = theme && theme.features && theme.features.hasOwnProperty("pagePanelTextColor") ? theme.features.pagePanelTextColor : '';
    this.buttonBackgroundColor = theme && theme.features && theme.features.hasOwnProperty("buttonBackgroundColor") ? theme.features.buttonBackgroundColor : '';
    this.buttonSelectedColor = theme && theme.features && theme.features.hasOwnProperty("buttonSelectedColor") ? theme.features.buttonSelectedColor : '';
    this.buttonTextColor = theme && theme.features && theme.features.hasOwnProperty("buttonTextColor") ? theme.features.buttonTextColor : '';
    this.buttonHoverColor = theme && theme.features && theme.features.hasOwnProperty("buttonHoverColor") ? theme.features.buttonHoverColor : '';
    this.buttonFontFamily = theme && theme.features && theme.features.hasOwnProperty("buttonFontFamily") ? theme.features.buttonFontFamily : '';
    this.buttonBorderRadius = theme && theme.features && theme.features.hasOwnProperty("buttonBorderRadius") ? theme.features.buttonBorderRadius : '';
    this.buttonFloat = theme && theme.features && theme.features.hasOwnProperty("buttonFloat") ? theme.features.buttonFloat : '';
    this.buttonWidth = theme && theme.features && theme.features.hasOwnProperty("buttonWidth") ? theme.features.buttonWidth : '';
    this.buttonTextAlign = theme && theme.features && theme.features.hasOwnProperty("buttonTextAlign") ? theme.features.buttonTextAlign : '';
    this.boxColor = theme && theme.features && theme.features.hasOwnProperty("boxColor") ? theme.features.boxColor : '';
    this.borderColor = theme && theme.features && theme.features.hasOwnProperty("borderColor") ? theme.features.borderColor : '';
    this.popupColor = theme && theme.features && theme.features.hasOwnProperty("popupColor") ? theme.features.popupColor : '';
    this.popupTextColor = theme && theme.features && theme.features.hasOwnProperty("popupTextColor") ? theme.features.popupTextColor : '';
    this.socialColor = theme && theme.features && theme.features.hasOwnProperty("socialColor") ? theme.features.socialColor : '';
    this.pageInput = theme && theme.features && theme.features.hasOwnProperty("pageInput") ? theme.features.pageInput : '';
    this.radioWidth = theme && theme.features && theme.features.hasOwnProperty("radioWidth") ? theme.features.radioWidth : '';
    this.radioHeight = theme && theme.features && theme.features.hasOwnProperty("radioHeight") ? theme.features.radioHeight : '';
    this.radioBorder = theme && theme.features && theme.features.hasOwnProperty("radioBorder") ? theme.features.radioBorder : '';
    this.radioBoxShadow = theme && theme.features && theme.features.hasOwnProperty("radioBoxShadow") ? theme.features.radioBoxShadow : '';
    this.radioBoxShadowHover = theme && theme.features && theme.features.hasOwnProperty("radioBoxShadowHover") ? theme.features.radioBoxShadowHover : '';
    this.radioCheckedBeforeBg = theme && theme.features && theme.features.hasOwnProperty("radioCheckedBeforeBg") ? theme.features.radioCheckedBeforeBg : '';
    this.radioBorderRadious = theme && theme.features && theme.features.hasOwnProperty("radioBorderRadious") ? theme.features.radioBorderRadious : '';
    this.radioOutline = theme && theme.features && theme.features.hasOwnProperty("radioOutline") ? theme.features.radioOutline : '';
    this.id = theme ? theme._id : '';
    this.createdOrg = theme && theme.createdOrg ? theme.createdOrg : '';
    this.organizationId = theme && theme.organizationId ? theme.organizationId : '';
    this.name = theme && theme.name ? theme.name : '';
    this.oldName = theme && theme.name ? theme.name : '';
    this.dateCreated = theme && theme.dateCreated ? theme.dateCreated : '';
    this.createdBy = theme && theme.createdBy ? theme.createdBy : '';
    this.role = theme && theme.role ? theme.role : '';
    this.theme = theme && theme.features && !this.utils.isEmptyObject(theme) ? JSON.stringify(theme) : {};
  };

  loadNew() {
    this.resetValues();
    this.name = "";
    this.oldName = "";
    this.themeList = "-1";
    this.save = "block";
    this.saveAs = "block";
    this.selectedThemeObj = this.getThemeObject(false);
  };

  loadThemes(id?: string) {
    this.oldName = "";

    this.themeService.getThemes(this.oid, id)
      .then(themes => {

        if (themes && themes.length > 0) {
          if (!this.utils.isNullOrEmpty(id)) {
            var themeObj = themes[0];
            var role = this.raccess["name"];
            this.selectedThemeObj = themeObj;
            this.resetValues(themeObj);
            this.themeList = id;

            if (this.role.toLowerCase() == themeObj.role.toLowerCase()) {
              this.delete = "block"
              this.saveAs = "block"
              this.save = "block"
            } else {
              this.delete = "none"
              this.saveAs = "block"
              this.save = "none"
            }
          } else {
            this.themes = [];
            var obj = {};
            obj["_id"] = "-1";
            obj["name"] = "Select";

            themes.unshift(obj)
            this.themes = themes;
          }
        }
      });
  };

  _save(isSaveAs?: boolean, auto?: boolean) {
    var themeObj = this.getThemeObject(isSaveAs);

    this.themeService.saveTheme(themeObj)
      .then(res => {
        this.loadThemes();
        this.themeList = res._id;

        if (auto) {
          this.updatePreviewTile(this.themeList, true);
        } else {
          alert('Theme Saved');
        }
      });
  };

  updatePreviewTile(id?: string, isOpen?: boolean) {
    if ($('#theme-preview').length > 0) {
      $("#theme-preview").contents().find("body").html('');
    }

    var tileObj = {
      "template": id
    };

    this.themeService.updatePreviewTile(id).then(previewResponse => {
      if (previewResponse) {
        if (isOpen) {
          //this. _themePreview(previewResponse._id);
        }
      } else {
        if (isOpen) {
          alert('Unable to preview');
        }
      }
    });
  };

  _themePreview(id) {
    $.cookie('preview', 'preview', {
      path: '/'
    });

    $('#theme_preview_phone').html('');
    $('#theme_preview_tab').html('');
    var tileUrl = '/app/tile/' + id;
    var url = "/app/tile/" + id;
    this._themePreviewData(url);
  };

  _themePreviewData(url) {
    var html = "<iframe id='theme-preview' width='100%' height='100%' src='" + url + "'";
    html += " frameborder='0' allowfullscreen></iframe>";

    var tab1 = $('<div>').attr('id', 'tabs-1');
    var tab2 = $('<div>').attr('id', 'tabs-2');
    var phonePreview = $('<div>').attr('id', 'theme_preview_phone');
    var tabletPreview = $('<div>').attr('id', 'theme_preview_tab');
    phonePreview.append(html);
    tabletPreview.append(html);
    tab1.append(phonePreview);
    tab2.append(tabletPreview);

    $.magnificPopup.open({
      items: [{
        src: tab2,
        type: 'inline'
      }, {
        src: tab1,
        type: 'inline'
      }],
      gallery: {
        enabled: true
      },
      type: 'image',
      callbacks: {
        open: function () {
        },
        beforeClose: function () {
        },
        close: function () {
        },
        afterClose: function () {
          //updatePreviewTile("", false);
        }
      }
    }, 1);
  };

  ngOnInit() {
    this.orgChangeDetect = this.route.queryParams.subscribe(params => {
      this.oid = Cookie.get('oid');
      this.selectedOrganization = this.oid;
      this.getUserSession();
      this.loadThemes();
    });
  }

  ngOnDestroy() {
    this.orgChangeDetect.unsubscribe();
  };
}
