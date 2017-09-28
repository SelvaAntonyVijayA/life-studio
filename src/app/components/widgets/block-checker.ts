import { Utils } from '../../helpers/utils';

export class BlockChecker {
  block: any = {};
  utils: any;

  constructor(block: any, orgConnectDatas?: any[]) {
    this.utils = Utils;
    this.block = block;
    this.getType(orgConnectDatas);

    return this.block;
  }

  /* Get Block Types */

  getType(orgConnectDatas: any) {
    if (this.block["type"] === "text") {
      this.textBlock();
      return;
    }

    if (this.block["type"] === "video") {
      this.videoBlock();
      return;
    }

    if (this.block["type"] === "picture") {
      this.pictureBlock();
      return;
    }

    if (this.block["type"] === "disqus") {
      this.disqusBlock();
      return;
    }

    if (this.block["type"] === "feed") {
      this.feedBlock();
      return;
    }

    if (this.block["type"] === "calendar") {
      this.calendarBlock();
      return;
    }

    if (this.block["type"] === "share") {
      this.shareBlock();
      return;
    }

    if (this.block["type"] === "patients") {
      this.patientsBlock();
      return;
    }

    if (this.block["type"] === "inquiry") {
      this.inquiryBlock();
      return;
    }

    if (this.block["type"] === "survey") {
      this.surveyBlock();
      return;
    }

    if (this.block["type"] === "questionnaire") {
      this.questionnaireBlock();
      return;
    }

    if (this.block["type"] === "startwrapper") {
      this.startWrapperBlock();
      return;
    }

    if (this.block["type"] === "title") {
      this.titleBlock();
      return;
    }

    if (this.block["type"] === "questions") {
      this.questionsBlock();
      return;
    }

    if (this.block["type"] === "attendance") {
      this.attendanceBlock();
      return;
    }

    if (this.block["type"] === "confirmation") {
      this.confirmationBlock();
      return;
    }

    if (this.block["type"] === "password") {
      this.passwordBlock();
      return;
    }

    if (this.block["type"] === "next") {
      this.nextBlock();
      return;
    }

    if (this.block["type"] === "formphoto") {
      this.formPhotoBlock();
      return;
    }

    if (this.block["type"] === "painlevel") {
      this.painLevelBlock();
      return;
    }

    if (this.block["type"] === "drawtool") {
      this.drawToolBlock();
      return;
    }

    if (this.block["type"] === "physician") {
      this.physicianBlock();
      return;
    }

    if (this.block["type"] === "endwrapper") {
      this.endWrapperBlock();
      return;
    }

    if (this.block["type"] === "fill") {
      this.fillBlock();
      return;
    }

    if (this.block["type"] === "notes") {
      this.notesBlock();
      return;
    }

    if (this.block["type"] === "buttons") {
      this.buttonsBlock();
      return;
    }

    if (this.block["type"] === "contactus") {
      this.contactUsBlock();
      return;
    }

    if (this.block["type"] === "placefull") {
      this.placefullBlock();
      return;
    }

    if (this.block["type"] === "addtocart") {
      this.addToCartBlock();
      return;
    }

    if (this.block["type"] === "cart") {
      this.cartBlock();
      return;
    }

    if (this.block["type"] === "blanksform") {
      this.blanksFormBlock();
      return this.block;
    }

    if (this.block["type"] === "exclusiveurl") {
      this.exclusiveUrlBlock();
      return;
    }

    if (this.block["type"] === "fileupload") {
      this.fileUploadBlock();
      return;
    }

    if (this.block["type"] === "pushpay") {
      this.pushPayBlock();
      return;
    }

    if (this.block["type"] === "threedcart") {
      this.threeDCartBlock();
      return;
    }

    if (this.block["type"] === "blogs") {
      this.blogsBlock();
      return;
    }

    if (this.block["type"] === "chat") {
      this.chatBlock();
      return;
    }

    if (this.block["type"] === "account") {
      this.accountBlock(orgConnectDatas);
      return;
    }

    if (this.block["type"] === "profile") {
      this.profileBlock(orgConnectDatas);
      return;
    }
  }

  textBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : "";
  };

  videoBlock() {
    this.block["data"]["caption"] = !this.utils.isNullOrEmpty(this.block["data"]["caption"]) ? this.block["data"]["caption"] : "";
    this.block["data"]["url"] = !this.utils.isNullOrEmpty(this.block["data"]["url"]) ? this.block["data"]["url"] : "";
    this.block["data"]["videoid"] = !this.utils.isNullOrEmpty(this.block["data"]["videoid"]) ? this.block["data"]["videoid"] : "";
  };

  pictureBlock() {
    this.block["data"]["moderated"] = !this.utils.isNullOrEmpty(this.block["data"]["moderated"]) ? this.block["data"]["moderated"].toString() : "false";
    this.block["data"]["rate"] = !this.utils.isNullOrEmpty(this.block["data"]["rate"]) ? this.block["data"]["rate"].toString() : "false";
    this.block["data"]["vote"] = !this.utils.isNullOrEmpty(this.block["data"]["vote"]) ? this.block["data"]["vote"].toString() : "false";
  };

  disqusBlock() {
    this.block["data"]["disqus"] = !this.utils.isNullOrEmpty(this.block["data"]["disqus"]) ? this.utils.convertToBoolean(this.block["data"]["disqus"]) : false;
  };

  feedBlock() {
    this.block["data"]["facebook"] = !this.utils.isNullOrEmpty(this.block["data"]["facebook"]) ? this.utils.convertToBoolean(this.block["data"]["facebook"]) : false;
    this.block["data"]["facebookurl"] = !this.utils.isNullOrEmpty(this.block["data"]["facebookurl"]) ? this.block["data"]["facebookurl"] : "";
    this.block["data"]["twitter"] = !this.utils.isNullOrEmpty(this.block["data"]["twitter"]) ? this.utils.convertToBoolean(this.block["data"]["twitter"]) : false;
    this.block["data"]["twitterurl"] = !this.utils.isNullOrEmpty(this.block["data"]["twitterurl"]) ? this.block["data"]["twitterurl"] : "";
    this.block["data"]["instagram"] = !this.utils.isNullOrEmpty(this.block["data"]["instagram"]) ? this.utils.convertToBoolean(this.block["data"]["instagram"]) : false;
    this.block["data"]["instaUserId"] = !this.utils.isNullOrEmpty(this.block["data"]["instaUserId"]) ? this.block["data"]["instaUserId"] : "";
    this.block["data"]["instaAccessToken"] = !this.utils.isNullOrEmpty(this.block["data"]["instaAccessToken"]) ? this.block["data"]["instaAccessToken"] : "";
  };

  calendarBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : new String("");
  };

  shareBlock() {
    this.block["data"]["facebook"] = !this.utils.isNullOrEmpty(this.block["data"]["facebook"]) ? this.utils.convertToBoolean(this.block["data"]["facebook"]) : false;
    this.block["data"]["twitter"] = !this.utils.isNullOrEmpty(this.block["data"]["twitter"]) ? this.utils.convertToBoolean(this.block["data"]["twitter"]) : false;
    this.block["data"]["email"] = !this.utils.isNullOrEmpty(this.block["data"]["email"]) ? this.utils.convertToBoolean(this.block["data"]["email"]) : false;
  };

  patientsBlock() {
    this.block["data"]["patients"] = !this.utils.isNullOrEmpty(this.block["data"]["patients"]) ? this.utils.convertToBoolean(this.block["data"]["patients"]) : false;
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : "Patients";
  };

  inquiryBlock() {
    this.block["data"]["email"] = !this.utils.isNullOrEmpty(this.block["data"]["email"]) ? this.block["data"]["email"] : "";
    this.block["data"]["inquiryText"] = !this.utils.isNullOrEmpty(this.block["data"]["inquiryText"]) ? this.block["data"]["inquiryText"] : "";
  };

  surveyBlock() {
    this.block["data"]["controls"] = !this.utils.isNullOrEmpty(this.block["data"]["controls"]) ? this.block["data"]["controls"] : "radio";
    this.block["data"]["multiple"] = !this.utils.isNullOrEmpty(this.block["data"]["multiple"]) ? this.block["data"]["multiple"].toString() : "false";
    this.block["data"]["showInApp"] = !this.utils.isNullOrEmpty(this.block["data"]["showInApp"]) ? this.utils.convertToBoolean(this.block["data"]["showInApp"]) : false;
    this.block["data"]["isNote"] = !this.utils.isNullOrEmpty(this.block["data"]["isNote"]) ? this.utils.convertToBoolean(this.block["data"]["isNote"]) : false;
    this.block["data"]["questions"] = !this.utils.isNullOrEmpty(this.block["data"]["questions"]) ? this.block["data"]["questions"] : [""];
    this.block["data"]["popup"] = !this.utils.isNullOrEmpty(this.block["data"]["popup"]) ? this.block["data"]["popup"] : [];
    this.block["data"]["alerts"] = !this.utils.isNullOrEmpty(this.block["data"]["alerts"]) ? this.block["data"]["alerts"] : [];
  };

  questionnaireBlock() {

  };

  startWrapperBlock() {
    this.block["data"]["refresh"] = !this.utils.isNullOrEmpty(this.block["data"]["refresh"]) ? this.utils.convertToBoolean(this.block["data"]["refresh"]) : false;
    this.block["data"]["close"] = !this.utils.isNullOrEmpty(this.block["data"]["close"]) ? this.utils.convertToBoolean(this.block["data"]["close"]) : false;
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(this.block["data"]["redirectApp"]) ? this.utils.convertToBoolean(this.block["data"]["redirectApp"]) : false;
  };

  titleBlock() {
    this.block["data"]["titletext"] = !this.utils.isNullOrEmpty(this.block["data"]["titletext"]) ? this.block["data"]["titletext"] : "";
    this.block["data"]["title"] = !this.utils.isNullOrEmpty(this.block["data"]["title"]) ? this.utils.convertToBoolean(this.block["data"]["title"]) : false;
  };

  questionsBlock() {
    this.block["data"]["questions"] = !this.utils.isNullOrEmpty(this.block["data"]["questions"]) ? this.block["data"]["questions"] : "";
    this.block["data"]["mandatory"] = !this.utils.isNullOrEmpty(this.block["data"]["mandatory"]) ? this.block["data"]["mandatory"] : [false];
    this.block["data"]["answerTypes"] = !this.utils.isNullOrEmpty(this.block["data"]["answerTypes"]) ? this.block["data"]["answerTypes"] : ["text"];
    this.block["data"]["notes"] = !this.utils.isNullOrEmpty(this.block["data"]["notes"]) ? this.block["data"]["notes"] : [false];
    this.block["data"]["category"] = !this.utils.isNullOrEmpty(this.block["data"]["category"]) ? this.block["data"]["category"] : "";
    this.block["data"]["categoryName"] = !this.utils.isNullOrEmpty(this.block["data"]["categoryName"]) ? this.block["data"]["categoryName"] : "";
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(this.block["data"]["redirectApp"]) ? this.utils.convertToBoolean(this.block["data"]["redirectApp"]) : false;
  };

  attendanceBlock() {
    this.block["data"]["title"] = !this.utils.isNullOrEmpty(this.block["data"]["title"]) ? this.block["data"]["title"] : "";
    this.block["data"]["person"] = !this.utils.isNullOrEmpty(this.block["data"]["person"]) ? this.utils.convertToBoolean(this.block["data"]["person"]) : false;
    this.block["data"]["online"] = !this.utils.isNullOrEmpty(this.block["data"]["online"]) ? this.utils.convertToBoolean(this.block["data"]["online"]) : false;
    this.block["data"]["addMember"] = !this.utils.isNullOrEmpty(this.block["data"]["addMember"]) ? this.utils.convertToBoolean(this.block["data"]["addMember"]) : false;
    this.block["data"]["addQuestion"] = !this.utils.isNullOrEmpty(this.block["data"]["addQuestion"]) ? this.block["data"]["addQuestion"] : "Additional Family members attending (not added from another app)";
    this.block["data"]["options"] = !this.utils.isNullOrEmpty(this.block["data"]["options"]) ? this.block["data"]["options"] : [];
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(this.block["data"]["redirectApp"]) ? this.utils.convertToBoolean(this.block["data"]["redirectApp"]) : false;
  };

  confirmationBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : new String("");
    this.block["data"]["submittext"] = !this.utils.isNullOrEmpty(this.block["data"]["submittext"]) ? this.block["data"]["submittext"] : "";
  };

  passwordBlock() {
    this.block["data"]["password"] = !this.utils.isNullOrEmpty(this.block["data"]["password"]) ? this.utils.convertToBoolean(this.block["data"]["password"]) : false;
  };

  nextBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : "";
    this.block["data"]["tileId"] = !this.utils.isNullOrEmpty(this.block["data"]["tileId"]) ? this.block["data"]["tileId"] : "";
    this.block["data"]["tileTile"] = !this.utils.isNullOrEmpty(this.block["data"]["tileTile"]) ? this.block["data"]["tileTile"] : "";
    this.block["data"]["type"] = !this.utils.isNullOrEmpty(this.block["data"]["type"]) ? this.block["data"]["type"] : "";
  };

  formPhotoBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : new String("");
    this.block["data"]["isVideo"] = !this.utils.isNullOrEmpty(this.block["data"]["isVideo"]) ? this.utils.convertToBoolean(this.block["data"]["isVideo"]) : false;
  };

  painLevelBlock() {
    this.block["data"]["painlevel"] = !this.utils.isNullOrEmpty(this.block["data"]["painlevel"]) ? this.utils.convertToBoolean(this.block["data"]["painlevel"]) : false;
    this.block["data"]["question"] = !this.utils.isNullOrEmpty(this.block["data"]["question"]) ? this.block["data"]["question"] : "";
    this.block["data"]["mandatory"] = !this.utils.isNullOrEmpty(this.block["data"]["mandatory"]) ? this.utils.convertToBoolean(this.block["data"]["mandatory"]) : false;
    this.block["data"]["level"] = !this.utils.isNullOrEmpty(this.block["data"]["level"]) ? this.block["data"]["level"] : "image";
  };

  drawToolBlock() {
    this.block["data"]["drawtool"] = !this.utils.isNullOrEmpty(this.block["data"]["drawtool"]) ? this.utils.convertToBoolean(this.block["data"]["drawtool"]) : true;
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : "";
  };

  physicianBlock() {
    this.block["data"]["isPhysician"] = !this.utils.isNullOrEmpty(this.block["data"]["isPhysician"]) ? this.utils.convertToBoolean(this.block["data"]["isPhysician"]) : true;
    this.block["data"]["mandatory"] = !this.utils.isNullOrEmpty(this.block["data"]["mandatory"]) ? this.utils.convertToBoolean(this.block["data"]["mandatory"]) : false;
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : "";
  };

  endWrapperBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : "";
    this.block["data"]["submitConfirmation"] = !this.utils.isNullOrEmpty(this.block["data"]["submitConfirmation"]) ? this.utils.convertToBoolean(this.block["data"]["submitConfirmation"]) : false;
  };

  fillBlock() {
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(this.block["data"]["text"]) ? this.block["data"]["text"] : new String("");
  };

  notesBlock() {
    this.block["data"]["notes"] = !this.utils.isNullOrEmpty(this.block["data"]["notes"]) ? this.utils.convertToBoolean(this.block["data"]["notes"]) : true;
    this.block["data"]["allNotes"] = !this.utils.isNullOrEmpty(this.block["data"]["allNotes"]) ? this.utils.convertToBoolean(this.block["data"]["allNotes"]) : false;
  };

  buttonsBlock() {
    this.block["data"] = !this.utils.isNullOrEmpty(this.block["data"]) ? this.block["data"] : [{ "beforeText": "", "afterText": "" }];
    this.block["alerts"] = !this.utils.isNullOrEmpty(this.block["alerts"]) ? this.block["alerts"] : [];
  };

  contactUsBlock() {
    this.block["email"] = !this.utils.isNullOrEmpty(this.block["email"]) ? this.block["email"] : "";
  };

  placefullBlock() {
    this.block["text"] = !this.utils.isNullOrEmpty(this.block["text"]) ? this.block["text"] : "";
  };

  addToCartBlock() {
    this.block["productName"] = !this.utils.isNullOrEmpty(this.block["productName"]) ? this.block["productName"] : "";
    this.block["description"] = !this.utils.isNullOrEmpty(this.block["description"]) ? this.block["description"] : "";
    this.block["price"] = !this.utils.isNullOrEmpty(this.block["price"]) ? this.block["price"] : "";
    this.block["currency"] = !this.utils.isNullOrEmpty(this.block["currency"]) ? this.block["currency"] : "";
    this.block["textCartButton"] = !this.utils.isNullOrEmpty(this.block["textCartButton"]) ? this.block["textCartButton"] : "";
    this.block["confirmationMessage"] = !this.utils.isNullOrEmpty(this.block["confirmationMessage"]) ? this.block["confirmationMessage"] : "";
    this.block["productImage"] = !this.utils.isNullOrEmpty(this.block["productImage"]) ? this.block["productImage"] : "";

    this.block["data"]["isProductName"] = !this.utils.isNullOrEmpty(this.block["data"]["isProductName"]) ? this.utils.convertToBoolean(this.block["data"]["isProductName"]) : true;
    this.block["data"]["isProductDescription"] = !this.utils.isNullOrEmpty(this.block["data"]["isProductDescription"]) ? this.utils.convertToBoolean(this.block["data"]["isProductDescription"]) : true;
    this.block["data"]["isProductImage"] = !this.utils.isNullOrEmpty(this.block["data"]["isProductImage"]) ? this.utils.convertToBoolean(this.block["data"]["isProductImage"]) : true;
    this.block["data"]["isProductPrice"] = !this.utils.isNullOrEmpty(this.block["data"]["isProductPrice"]) ? this.utils.convertToBoolean(this.block["data"]["isProductPrice"]) : true;
  };

  cartBlock() {
    this.block["productTitle"] = !this.utils.isNullOrEmpty(this.block["productTitle"]) ? this.block["productTitle"] : "";
    this.block["notificationEmail"] = !this.utils.isNullOrEmpty(this.block["notificationEmail"]) ? this.block["notificationEmail"] : "";
    this.block["textConfirmButton"] = !this.utils.isNullOrEmpty(this.block["textConfirmButton"]) ? this.block["textConfirmButton"] : "";
    this.block["confirmationMessage"] = !this.utils.isNullOrEmpty(this.block["confirmationMessage"]) ? this.block["confirmationMessage"] : "";
  };

  blanksFormBlock() {
    this.block["email"] = !this.utils.isNullOrEmpty(this.block["email"]) ? this.block["email"] : "";
    this.block["text"] = !this.utils.isNullOrEmpty(this.block["text"]) ? this.block["text"] : new String("");
    this.block["imageLimit"] = !this.utils.isNullOrEmpty(this.block["imageLimit"]) ? this.block["imageLimit"] : "";
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(this.block["data"]["redirectApp"]) ? this.utils.convertToBoolean(this.block["data"]["redirectApp"]) : false;
  };

  exclusiveUrlBlock() {
    this.block["url"] = !this.utils.isNullOrEmpty(this.block["url"]) ? this.block["url"] : "";
    this.block["data"]["window"] = !this.utils.isNullOrEmpty(this.block["data"]["window"]) ? this.utils.convertToBoolean(this.block["data"]["window"]) : false;
    this.block["data"]["iphonewindow"] = !this.utils.isNullOrEmpty(this.block["data"]["iphonewindow"]) ? this.utils.convertToBoolean(this.block["data"]["iphonewindow"]) : false;
  };

  fileUploadBlock() {
    this.block["url"] = !this.utils.isNullOrEmpty(this.block["url"]) ? this.block["url"] : "";
  };

  pushPayBlock() {
    this.block["data"]["pushpay"] = !this.utils.isNullOrEmpty(this.block["data"]["pushpay"]) ? this.utils.convertToBoolean(this.block["data"]["pushpay"]) : false;
    this.block["url"] = !this.utils.isNullOrEmpty(this.block["url"]) ? this.block["url"] : "";
    this.block["data"]["window"] = !this.utils.isNullOrEmpty(this.block["data"]["window"]) ? this.utils.convertToBoolean(this.block["data"]["window"]) : false;
    this.block["data"]["iphonewindow"] = !this.utils.isNullOrEmpty(this.block["data"]["iphonewindow"]) ? this.utils.convertToBoolean(this.block["data"]["iphonewindow"]) : false;
  };

  threeDCartBlock() {
    this.block["data"]["cart"] = !this.utils.isNullOrEmpty(this.block["data"]["cart"]) ? this.utils.convertToBoolean(this.block["data"]["cart"]) : false;
    this.block["url"] = !this.utils.isNullOrEmpty(this.block["url"]) ? this.block["url"] : "";
    this.block["data"]["window"] = !this.utils.isNullOrEmpty(this.block["data"]["window"]) ? this.utils.convertToBoolean(this.block["data"]["window"]) : false;
    this.block["data"]["iphonewindow"] = !this.utils.isNullOrEmpty(this.block["data"]["iphonewindow"]) ? this.utils.convertToBoolean(this.block["data"]["iphonewindow"]) : false;
  };

  blogsBlock() {
    this.block["data"]["wordPress"] = !this.utils.isNullOrEmpty(this.block["data"]["wordPress"]) ? this.utils.convertToBoolean(this.block["data"]["wordPress"]) : false;
    this.block["wordPressUrl"] = !this.utils.isNullOrEmpty(this.block["wordPressUrl"]) ? this.block["wordPressUrl"] : "";
    this.block["wordPressTitle"] = !this.utils.isNullOrEmpty(this.block["wordPressTitle"]) ? this.block["wordPressTitle"] : "";
    this.block["wordPressContent"] = !this.utils.isNullOrEmpty(this.block["wordPressContent"]) ? this.block["wordPressContent"] : new String("");
  };

  chatBlock() {
    this.block["data"]["chat"] = !this.utils.isNullOrEmpty(this.block["data"]["chat"]) ? this.utils.convertToBoolean(this.block["data"]["chat"]) : true;
    this.block["data"]["isPrivate"] = !this.utils.isNullOrEmpty(this.block["data"]["isPrivate"]) ? this.utils.convertToBoolean(this.block["data"]["isPrivate"]) : false;
  };

  accountBlock(orgConnectDatas: any) {
    var connectDatas = !this.utils.isNullOrEmpty(this.block["data"]["connectionCard"]) ? this.mapOrgProfileData(orgConnectDatas, this.block["data"]["connectionCard"], "account") : this.mapOrgProfileData(orgConnectDatas, [], "account");
    this.block["data"]["connectionCard"] = connectDatas;
    this.block["data"]["submember"] = this.block["data"].hasOwnProperty("submember") && this.block["data"]["submember"].length > 0 && !this.utils.isNullOrEmpty(this.block["data"]["connectionCard"]) ? this.getAccountSubmember(orgConnectDatas, this.block["data"]["submember"]) : [];
  };

  profileBlock(orgConnectDatas: any) {
    var profileDatas = !this.utils.isNullOrEmpty(this.block["data"]["profile"]) ? this.mapOrgProfileData(orgConnectDatas, this.block["data"]["profile"], "profile") : this.mapOrgProfileData(orgConnectDatas, [], "profile");
    this.block["data"]["profile"] = profileDatas;
  };

  getAccountSubmember(mainConnectDatas: any[], blockConnectSubData: any) {
    var subMemDatas = [];

    for (let i = 0; i < blockConnectSubData.length; i++) {
      var subMem = this.mapOrgProfileData(mainConnectDatas, blockConnectSubData[i], "account");
      subMemDatas.push(subMem);
    }
  };

  mapOrgProfileData(mainConnectDatas: any[], blockConnectData?: any, type?: string) {
    var orgConnectDatas = mainConnectDatas.length > 0 ? mainConnectDatas.map(x => Object.assign({}, x)) : [];

    if (type === "account") {
      orgConnectDatas.push({
        required: false,
        assigned: false,
        name: "Add Family Member ?",
        tag: "addMember",
        type: "addMember"
      });
    }

    if (orgConnectDatas.length > 0) {
      for (let i = 0; i < orgConnectDatas.length; i++) {
        var currData = [];

        if (blockConnectData.length > 0) {
          currData = blockConnectData.filter(
            connectData => connectData.tag === orgConnectDatas[i]["tag"]);
        } else {
          currData = [orgConnectDatas[i]];
        }

        var assigned = currData[0] ? typeof currData[0].assigned != 'undefined' && currData[0].assigned == true ? true : false : false;
        var required = currData[0] ? typeof currData[0].required != 'undefined' && currData[0].required == true ? true : false : false;

        orgConnectDatas[i]["required"] = required;
        orgConnectDatas[i]["assigned"] = assigned;
      }
    }

    return orgConnectDatas;
  };

  
}