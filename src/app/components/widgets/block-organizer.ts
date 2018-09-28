import { Type, HostListener, ReflectiveInjector } from '@angular/core';
//import { Utils } from '../../helpers/utils';
declare var $: any;

export interface BlockComponent {
  block: any;
};

export class BlockItem {
  constructor(public component: Type<any>,
    public block: any) {
  }
};

export class BlockOrganizer {
  constructor(blk: any, type: string, lang?: string, orgConnectDatas?: any[], widgetCategories?: any[], utils?: any, selectedOrg?: string) {
    this.block = {};
    this.lang = lang;
    this.utils = utils;
    this.selectedOrg = selectedOrg;
    this.getType(blk, type, orgConnectDatas, widgetCategories);
    return this.block;
  }

  utils: any;
  block: any = {};
  lang: string = "en";
  selectedOrg: string = "";

  /* Get Block Types */
  getType(blk: any, type: string, orgConnectDatas: any, widgetCategories?: any[]) {
    if (type === "text") {
      this.textBlock(blk, type);
      return;
    }

    if (type === "video") {
      this.videoBlock(blk, type);
      return;
    }

    if (type === "picture") {
      this.pictureBlock(blk, type);
      return;
    }

    if (type === "disqus") {
      this.disqusBlock(blk, type);
      return;
    }

    if (type === "feed") {
      this.feedBlock(blk, type);
      return;
    }

    if (type === "calendar") {
      this.calendarBlock(blk, type);
      return;
    }

    if (type === "share") {
      this.shareBlock(blk, type);
      return;
    }

    if (type === "patients") {
      this.patientsBlock(blk, type);
      return;
    }

    if (type === "inquiry") {
      this.inquiryBlock(blk, type);
      return;
    }

    if (type === "survey") {
      this.surveyBlock(blk, type, widgetCategories);
      return;
    }

    if (type === "questionnaire") {
      this.questionnaireBlock(blk, type, widgetCategories);
      return;
    }

    if (type === "startwrapper") {
      this.startWrapperBlock(blk, type);
      return;
    }

    if (type === "title") {
      this.titleBlock(blk, type);
      return;
    }

    if (type === "questions") {
      this.questionsBlock(blk, type, widgetCategories);
      return;
    }

    if (type === "attendance") {
      this.attendanceBlock(blk, type);
      return;
    }

    if (type === "confirmation") {
      this.confirmationBlock(blk, type);
      return;
    }

    if (type === "password") {
      this.passwordBlock(blk, type);
      return;
    }

    if (type === "next") {
      this.nextBlock(blk, type);
      return;
    }

    if (type === "formphoto") {
      this.formPhotoBlock(blk, type);
      return;
    }

    if (type === "painlevel") {
      this.painLevelBlock(blk, type);
      return;
    }

    if (type === "drawtool") {
      this.drawToolBlock(blk, type);
      return;
    }

    if (type === "physician") {
      this.physicianBlock(blk, type);
      return;
    }

    if (type === "endwrapper") {
      this.endWrapperBlock(blk, type);
      return;
    }

    if (type === "fill") {
      this.fillBlock(blk, type);
      return;
    }

    if (type === "notes") {
      this.notesBlock(blk, type);
      return;
    }

    if (type === "buttons") {
      this.buttonsBlock(blk, type);
      return;
    }

    if (type === "contactus") {
      this.contactUsBlock(blk, type);
      return;
    }

    if (type === "placefull") {
      this.placefullBlock(blk, type);
      return;
    }

    if (type === "addtocart") {
      this.addToCartBlock(blk, type);
      return;
    }

    if (type === "cart") {
      this.cartBlock(blk, type);
      return;
    }

    if (type === "blanksform") {
      this.blanksFormBlock(blk, type);
      return this.block;
    }

    if (type === "exclusiveurl") {
      this.exclusiveUrlBlock(blk, type);
      return;
    }

    if (type === "fileupload") {
      this.fileUploadBlock(blk, type);
      return;
    }

    if (type === "pushpay") {
      this.pushPayBlock(blk, type);
      return;
    }

    if (type === "threedcart") {
      this.threeDCartBlock(blk, type);
      return;
    }

    if (type === "blogs") {
      this.blogsBlock(blk, type);
      return;
    }

    if (type === "chat") {
      this.chatBlock(blk, type);
      return;
    }

    if (type === "account") {
      this.accountBlock(blk, type, orgConnectDatas);
      return;
    }

    if (type === "profile") {
      this.profileBlock(blk, type, orgConnectDatas);
      return;
    }

    if (type === "addspace") {
      this.addSpaceBlock(blk, type);
      return;
    }
  }

  textBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Editor";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};

    this.block["data"] = {};
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
  };

  videoBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Upload Video";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};

    this.block["data"] = {};
    this.block["data"]["caption"] = !this.utils.isNullOrEmpty(data["caption"]) ? data["caption"] : "";
    this.block["data"]["url"] = !this.utils.isNullOrEmpty(data["url"]) ? data["url"] : "";
    this.block["data"]["videoid"] = !this.utils.isNullOrEmpty(data["videoid"]) ? data["videoid"] : "";
  };

  pictureBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Event Media";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
    //this.block["data"]["moderated"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["moderated"]) ? blockData["data"]["moderated"].toString() : "false";
    //this.block["data"]["rate"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["rate"]) ? blockData["data"]["rate"].toString() : "false";
    //this.block["data"]["vote"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["vote"]) ? blockData["data"]["vote"].toString() : "false";
  };

  disqusBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Disqus";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["disqus"] = !this.utils.isNullOrEmpty(data["disqus"]) ? this.utils.convertToBoolean(data["disqus"]) : false;
  };

  feedBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Social Feed";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["facebook"] = !this.utils.isNullOrEmpty(data["facebook"]) ? this.utils.convertToBoolean(data["facebook"]) : false;
    this.block["data"]["facebookurl"] = !this.utils.isNullOrEmpty(data["facebookurl"]) ? data["facebookurl"] : "";
    this.block["data"]["twitter"] = !this.utils.isNullOrEmpty(data["twitter"]) ? this.utils.convertToBoolean(data["twitter"]) : false;
    this.block["data"]["twitterurl"] = !this.utils.isNullOrEmpty(data["twitterurl"]) ? data["twitterurl"] : "";
    this.block["data"]["instagram"] = !this.utils.isNullOrEmpty(data["instagram"]) ? this.utils.convertToBoolean(data["instagram"]) : false;
    this.block["data"]["instaUserId"] = !this.utils.isNullOrEmpty(data["instaUserId"]) ? data["instaUserId"] : "";
    this.block["data"]["instaAccessToken"] = !this.utils.isNullOrEmpty(data["instaAccessToken"]) ? data["instaAccessToken"] : "";
  };

  calendarBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Calendar";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
  };

  shareBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Facebook, Twitter & Email Sharing";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["facebook"] = !this.utils.isNullOrEmpty(data["facebook"]) ? this.utils.convertToBoolean(data["facebook"]) : false;
    this.block["data"]["twitter"] = !this.utils.isNullOrEmpty(data["twitter"]) ? this.utils.convertToBoolean(data["twitter"]) : false;
    this.block["data"]["email"] = !this.utils.isNullOrEmpty(data["email"]) ? this.utils.convertToBoolean(data["email"]) : false;

    this.block["data"]["linkedIn"] = !this.utils.isNullOrEmpty(data["linkedIn"]) ? this.utils.convertToBoolean(data["linkedIn"]) : false;
    this.block["data"]["pinterest"] = !this.utils.isNullOrEmpty(data["pinterest"]) ? this.utils.convertToBoolean(data["pinterest"]) : false;
    this.block["data"]["googleplus"] = !this.utils.isNullOrEmpty(data["googleplus"]) ? this.utils.convertToBoolean(data["googleplus"]) : false;
    this.block["data"]["shareURL"] = !this.utils.isNullOrEmpty(data["shareURL"]) ? data["shareURL"] : "";
  };

  patientsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Facebook, Twitter & Email Sharing";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["patients"] = !this.utils.isNullOrEmpty(data["patients"]) ? this.utils.convertToBoolean(data["patients"]) : false;
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "Patients";
  };

  inquiryBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Inquiry";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["email"] = !this.utils.isNullOrEmpty(data["email"]) ? data["email"] : "";
    this.block["data"]["inquiryText"] = !this.utils.isNullOrEmpty(data["inquiryText"]) ? data["inquiryText"] : "";
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
  };

  surveyBlock(blockData: any, type: string, widgetCategories: any[]) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Simple Questionnaire";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["widgetCategories"] = widgetCategories;
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["mandatory"] = data.hasOwnProperty("mandatory") && !this.utils.isNullOrEmpty(data["mandatory"]) ? this.utils.convertToBoolean(data["mandatory"]) : false;
    this.block["data"]["questionText"] = data.hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(data["questionText"]) ? data["questionText"] : "";
    this.block["data"]["controls"] = !this.utils.isNullOrEmpty(data["controls"]) ? data["controls"] : "radio";
    this.block["data"]["multiple"] = !this.utils.isNullOrEmpty(data["multiple"]) ? data["multiple"].toString() : "false";
    this.block["data"]["showInApp"] = !this.utils.isNullOrEmpty(data["showInApp"]) ? this.utils.convertToBoolean(data["showInApp"]) : false;
    this.block["data"]["isNote"] = !this.utils.isNullOrEmpty(data["isNote"]) ? this.utils.convertToBoolean(data["isNote"]) : false;
    this.block["data"]["questions"] = !this.utils.isNullOrEmpty(data["questions"]) ? data["questions"] : [""];
    this.block["data"]["popup"] = !this.utils.isNullOrEmpty(data["popup"]) ? data["popup"] : [];
    this.block["data"]["alerts"] = !this.utils.isNullOrEmpty(data["alerts"]) ? data["alerts"] : [];
    this.block["data"]["confirmation"] = !this.utils.isNullOrEmpty(data["confirmation"]) ? data["confirmation"] : [];
    this.block["data"]["category"] = data.hasOwnProperty("category") && !this.utils.isNullOrEmpty(data["category"]) ? data["category"] : "-1";
    this.block["data"]["categoryName"] = data.hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(data["categoryName"]) ? data["categoryName"] : "";
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
  };

  questionnaireBlock(blockData: any, type: string, widgetCategories: any[]) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Cascading Questionnaire";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["widgetCategories"] = widgetCategories;
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["mandatory"] = data.hasOwnProperty("mandatory") && !this.utils.isNullOrEmpty(data["mandatory"]) ? this.utils.convertToBoolean(data["mandatory"]) : false;
    this.block["data"]["questionText"] = data.hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(data["questionText"]) ? data["questionText"] : "";
    this.block["data"]["inputControlType"] = data.hasOwnProperty("inputControlType") && !this.utils.isNullOrEmpty(data["inputControlType"]) ? data["inputControlType"] : "radio";
    this.block["data"]["questionType"] = data.hasOwnProperty("questionType") && !this.utils.isNullOrEmpty(data["questionType"]) ? data["questionType"] : "single";
    this.block["data"]["isNote"] = data.hasOwnProperty("isNote") && !this.utils.isNullOrEmpty(data["isNote"]) ? this.utils.convertToBoolean(data["isNote"]) : false;
    this.block["data"]["showInApp"] = !this.utils.isNullOrEmpty(data["showInApp"]) ? this.utils.convertToBoolean(data["showInApp"]) : false;
    this.block["data"]["category"] = data.hasOwnProperty("category") && !this.utils.isNullOrEmpty(data["category"]) ? data["category"] : "-1";
    this.block["data"]["categoryName"] = data.hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(data["categoryName"]) ? data["categoryName"] : "";
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;

    var options = [];
    var alerts = [];
    var confirmation = [];
    var popup = [];

    if (data.hasOwnProperty("options") && data["options"].length > 0) {
      var quesOpts = data["options"];

      for (let i = 0; i < quesOpts.length; i++) {
        var quesOpt = quesOpts[i];
        var opt = { "option": "", "alert": "", "confirmation": "", "popup": "" };

        if (quesOpt.hasOwnProperty("option") && !this.utils.isNullOrEmpty(quesOpt["option"])) {
          opt["option"] = quesOpt["option"];
        }

        if (quesOpt.hasOwnProperty("alert") && this.utils.isArray(quesOpt["alert"]) && quesOpt["alert"].length > 0) {
          alerts.push(quesOpt["alert"]);
          opt["alert"] = quesOpt["alert"];
        }

        if (quesOpt.hasOwnProperty("confirmation") && this.utils.isArray(quesOpt["confirmation"]) && quesOpt["confirmation"].length > 0) {
          confirmation.push(quesOpt["confirmation"]);
          opt["confirmation"] = quesOpt["confirmation"];
        }

        if (quesOpt.hasOwnProperty("popup") && this.utils.isArray(quesOpt["popup"]) && quesOpt["popup"].length > 0) {
          confirmation.push(quesOpt["popup"]);
          opt["popup"] = quesOpt["popup"];
        }

        if (quesOpt.hasOwnProperty("subQuestions")) {
          var subQuestions = this.utils.isArray(quesOpt["subQuestions"]) && quesOpt["subQuestions"].length > 0 ? this.subQuestionnaire(quesOpt["subQuestions"]) : [{
            "type": "questions",
            "questionText": "",
            "questionType": "single",
            "inputControlType": "radio",
            "options": [{ "option": "" }, { "option": "" }]
          }];

          opt["subQuestions"] = subQuestions;
        }

        options.push(opt);
      }
    }

    this.block["data"]["options"] = options.length > 0 ? options : [{
      "option": "",
      "alert": "",
      "confirmation": "",
      "popup": ""
    }];

    this.block["data"]["confirmation"] = confirmation;
    this.block["data"]["popup"] = popup;
    this.block["data"]["alerts"] = alerts;
  };

  questionnaireOptions(options?: any[]) {
    var currOpts = [];

    for (let k = 0; k < options.length; k++) {
      var currOpt = options[k];
      var optObj = {};
      optObj["option"] = currOpt.hasOwnProperty("option") && !this.utils.isNullOrEmpty(currOpt["option"]) ? currOpt["option"] : "";

      if (currOpt.hasOwnProperty("subQuestions")) {
        optObj["subQuestions"] = this.utils.isArray(currOpt["subQuestions"]) && currOpt["subQuestions"].length > 0 ? this.subQuestionnaire(currOpt["subQuestions"]) : [{
          "type": "questions",
          "questionText": "",
          "questionType": "single",
          "inputControlType": "radio",
          "options": [{ "option": "" }, { "option": "" }]
        }];
      }

      currOpts.push(optObj);
    }

    return currOpts;
  };

  subQuestionnaire(subQues?: any[]) {
    var subQuestions = [];

    for (let j = 0; j < subQues.length; j++) {
      var currSubQues = subQues[j];
      var subQuesObj = {};

      if (currSubQues.hasOwnProperty("type") && currSubQues["type"] === "questions") {
        subQuesObj["type"] = "questions";
        subQuesObj["questionText"] = currSubQues.hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(currSubQues["questionText"]) ? currSubQues["questionText"] : "";
        subQuesObj["questionType"] = currSubQues.hasOwnProperty("questionType") && !this.utils.isNullOrEmpty(currSubQues["questionType"]) ? currSubQues["questionType"] : "single";
        subQuesObj["inputControlType"] = currSubQues.hasOwnProperty("inputControlType") && !this.utils.isNullOrEmpty(currSubQues["inputControlType"]) ? currSubQues["inputControlType"] : "radio";
        subQuesObj["options"] = this.utils.isArray(currSubQues["options"]) && currSubQues["options"].length > 0 ? this.questionnaireOptions(currSubQues["options"]) : [{ "option": "" }, { "option": "" }];
        subQuestions.push(subQuesObj);
      } else if (currSubQues.hasOwnProperty("type") && currSubQues["type"] === "description") {
        subQuesObj["type"] = "description";
        subQuesObj["controlType"] = currSubQues.hasOwnProperty("controlType") && !this.utils.isNullOrEmpty(currSubQues["controlType"]) ? currSubQues["controlType"] : "text";
        subQuesObj["questionText"] = currSubQues.hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(currSubQues["questionText"]) ? currSubQues["questionText"] : "";
        subQuestions.push(subQuesObj);
      }
    }

    return subQuestions;
  };

  startWrapperBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Start Wrapper";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["refresh"] = !this.utils.isNullOrEmpty(data["refresh"]) ? this.utils.convertToBoolean(data["refresh"]) : false;
    this.block["data"]["close"] = !this.utils.isNullOrEmpty(data["close"]) ? this.utils.convertToBoolean(data["close"]) : false;
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
    this.block["data"]["title"] = !this.utils.isNullOrEmpty(data["title"]) ? data["title"] : "";
    this.block["data"]["formCollapse"] = !this.utils.isNullOrEmpty(data["formCollapse"]) ? this.utils.convertToBoolean(data["formCollapse"]) : false;
  };

  titleBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Form Title";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["titletext"] = !this.utils.isNullOrEmpty(data["titletext"]) ? data["titletext"] : "";
    this.block["data"]["title"] = !this.utils.isNullOrEmpty(data["title"]) ? this.utils.convertToBoolean(data["title"]) : false;
  };

  questionsBlock(blockData: any, type: string, widgetCategories: any[]) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Questions & Answers";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["widgetCategories"] = widgetCategories;
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["questions"] = !this.utils.isNullOrEmpty(data["questions"]) ? data["questions"] : [""];
    this.block["data"]["mandatory"] = !this.utils.isNullOrEmpty(data["mandatory"]) ? data["mandatory"] : [false];
    this.block["data"]["answerTypes"] = !this.utils.isNullOrEmpty(data["answerTypes"]) ? data["answerTypes"] : ["text"];
    this.block["data"]["notes"] = !this.utils.isNullOrEmpty(data["notes"]) ? data["notes"] : [false];
    this.block["data"]["category"] = !this.utils.isNullOrEmpty(data["category"]) ? data["category"] : "";
    this.block["data"]["categoryName"] = !this.utils.isNullOrEmpty(data["categoryName"]) ? data["categoryName"] : "";
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
    //this.block["data"]["category"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("category") && !this.utils.isNullOrEmpty(blockData["data"]["category"]) ? blockData["data"]["category"] : "-1";
  };

  attendanceBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Attendance";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["title"] = !this.utils.isNullOrEmpty(data["title"]) ? data["title"] : "";
    this.block["data"]["person"] = !this.utils.isNullOrEmpty(data["person"]) ? this.utils.convertToBoolean(data["person"]) : false;
    this.block["data"]["online"] = !this.utils.isNullOrEmpty(data["online"]) ? this.utils.convertToBoolean(data["online"]) : false;
    this.block["data"]["addMember"] = !this.utils.isNullOrEmpty(data["addMember"]) ? this.utils.convertToBoolean(data["addMember"]) : false;
    this.block["data"]["addQuestion"] = !this.utils.isNullOrEmpty(data["addQuestion"]) ? data["addQuestion"] : "Additional Family members attending (not added from another app)";
    this.block["data"]["options"] = !this.utils.isNullOrEmpty(data["options"]) ? data["options"] : [];
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
  };

  confirmationBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Confirmation";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
    this.block["data"]["submittext"] = !this.utils.isNullOrEmpty(data["submittext"]) ? data["submittext"] : "";
  };

  passwordBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Password";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["password"] = !this.utils.isNullOrEmpty(data["password"]) ? this.utils.convertToBoolean(data["password"]) : false;
  };

  nextBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Next";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
    this.block["data"]["tileId"] = !this.utils.isNullOrEmpty(data["tileId"]) ? data["tileId"] : "";
    this.block["data"]["tileTile"] = !this.utils.isNullOrEmpty(data["tileTile"]) ? data["tileTile"] : "";
    this.block["data"]["type"] = !this.utils.isNullOrEmpty(data["type"]) ? data["type"] : "";
  };

  formPhotoBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Form Media";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
    this.block["data"]["isVideo"] = !this.utils.isNullOrEmpty(data["isVideo"]) ? this.utils.convertToBoolean(data["isVideo"]) : false;
  };

  painLevelBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Pain Level";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["painlevel"] = !this.utils.isNullOrEmpty(data["painlevel"]) ? this.utils.convertToBoolean(data["painlevel"]) : false;
    this.block["data"]["question"] = !this.utils.isNullOrEmpty(data["question"]) ? data["question"] : "";
    this.block["data"]["mandatory"] = !this.utils.isNullOrEmpty(data["mandatory"]) ? this.utils.convertToBoolean(data["mandatory"]) : false;
    this.block["data"]["level"] = !this.utils.isNullOrEmpty(data["level"]) ? data["level"] : "image";
  };

  drawToolBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Draw tool";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["drawtool"] = !this.utils.isNullOrEmpty(data["drawtool"]) ? this.utils.convertToBoolean(data["drawtool"]) : true;
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
  };

  physicianBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Physician";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["isPhysician"] = !this.utils.isNullOrEmpty(data["isPhysician"]) ? this.utils.convertToBoolean(data["isPhysician"]) : true;
    this.block["data"]["mandatory"] = !this.utils.isNullOrEmpty(data["mandatory"]) ? this.utils.convertToBoolean(data["mandatory"]) : false;
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
  };

  endWrapperBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "End Wrapper";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
    this.block["data"]["submitConfirmation"] = !this.utils.isNullOrEmpty(data["submitConfirmation"]) ? this.utils.convertToBoolean(data["submitConfirmation"]) : false;
  };

  fillBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Fill-in the blanks";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
  };

  notesBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Notes";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : {};
    this.block["data"] = {};

    this.block["data"]["notes"] = !this.utils.isNullOrEmpty(data["notes"]) ? this.utils.convertToBoolean(data["notes"]) : true;
    this.block["data"]["allNotes"] = !this.utils.isNullOrEmpty(data["allNotes"]) ? this.utils.convertToBoolean(data["allNotes"]) : false;
    this.block["data"]["journal"] = !this.utils.isNullOrEmpty(data["journal"]) ? this.utils.convertToBoolean(data["journal"]) : false;
  };

  buttonsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Buttons";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    var alerts = this.lang === "en" && !this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty["alerts"] && blockData["alerts"].length > 0 ? blockData["alerts"] : [];

    if (this.lang !== "en" && !this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty(this.lang)) {
      alerts = blockData[this.lang].hasOwnProperty("alerts") && blockData[this.lang]["alerts"].length > 0 ? blockData[this.lang]["alerts"] : [];
    }

    this.block["data"] = {};

    this.block["data"] = data.length > 0 ? data : [{ "beforeText": "", "afterText": "" }];
    this.block["alerts"] = alerts;
  };

  contactUsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "ContactUs";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["email"] = !this.utils.isNullOrEmpty(data["email"]) ? data["email"] : "";
  };

  placefullBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "PlaceFull";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
  };

  addToCartBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Add To Cart";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["productName"] = !this.utils.isNullOrEmpty(data["productName"]) ? data["productName"] : "";
    this.block["data"]["description"] = !this.utils.isNullOrEmpty(data["description"]) ? data["description"] : "";
    this.block["data"]["price"] = !this.utils.isNullOrEmpty(data["price"]) ? data["price"] : "";
    this.block["data"]["currency"] = !this.utils.isNullOrEmpty(data["currency"]) ? data["currency"] : "";
    this.block["data"]["textCartButton"] = !this.utils.isNullOrEmpty(data["textCartButton"]) ? data["textCartButton"] : "";
    this.block["data"]["confirmationMessage"] = !this.utils.isNullOrEmpty(data["confirmationMessage"]) ? data["confirmationMessage"] : "";
    this.block["data"]["productImage"] = !this.utils.isNullOrEmpty(data["productImage"]) ? data["productImage"] : "";

    this.block["data"]["isProductName"] = !this.utils.isNullOrEmpty(data["isProductName"]) ? this.utils.convertToBoolean(data["isProductName"]) : true;
    this.block["data"]["isProductDescription"] = !this.utils.isNullOrEmpty(data["isProductDescription"]) ? this.utils.convertToBoolean(data["isProductDescription"]) : true;
    this.block["data"]["isProductImage"] = !this.utils.isNullOrEmpty(data["isProductImage"]) ? this.utils.convertToBoolean(data["isProductImage"]) : true;
    this.block["data"]["isProductPrice"] = !this.utils.isNullOrEmpty(data["isProductPrice"]) ? this.utils.convertToBoolean(data["isProductPrice"]) : true;
  };

  cartBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Cart";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["productTitle"] = !this.utils.isNullOrEmpty(data["productTitle"]) ? data["productTitle"] : "";
    this.block["data"]["notificationEmail"] = !this.utils.isNullOrEmpty(data["notificationEmail"]) ? data["notificationEmail"] : "";
    this.block["data"]["textConfirmButton"] = !this.utils.isNullOrEmpty(data["textConfirmButton"]) ? data["textConfirmButton"] : "";
    this.block["data"]["confirmationMessage"] = !this.utils.isNullOrEmpty(data["confirmationMessage"]) ? data["confirmationMessage"] : "";
  };

  blanksFormBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Blanks Form";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["email"] = !this.utils.isNullOrEmpty(data["email"]) ? data["email"] : "";
    this.block["data"]["text"] = !this.utils.isNullOrEmpty(data["text"]) ? data["text"] : "";
    this.block["data"]["imageLimit"] = !this.utils.isNullOrEmpty(data["imageLimit"]) ? data["imageLimit"] : "";
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
  };

  exclusiveUrlBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "URL";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["url"] = !this.utils.isNullOrEmpty(data["url"]) ? data["url"] : "";
    this.block["data"]["window"] = !this.utils.isNullOrEmpty(data["window"]) ? this.utils.convertToBoolean(data["window"]) : false;
    this.block["data"]["iphonewindow"] = !this.utils.isNullOrEmpty(data["iphonewindow"]) ? this.utils.convertToBoolean(data["iphonewindow"]) : false;
  };

  fileUploadBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "File Upload";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["url"] = !this.utils.isNullOrEmpty(data["url"]) ? data["url"] : "";
  };

  pushPayBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "PushPay";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["pushpay"] = !this.utils.isNullOrEmpty(data["pushpay"]) ? this.utils.convertToBoolean(data["pushpay"]) : false;
    this.block["data"]["url"] = !this.utils.isNullOrEmpty(data["url"]) ? data["url"] : "";
    this.block["data"]["window"] = !this.utils.isNullOrEmpty(data["window"]) ? this.utils.convertToBoolean(data["window"]) : false;
    this.block["data"]["iphonewindow"] = !this.utils.isNullOrEmpty(data["iphonewindow"]) ? this.utils.convertToBoolean(data["iphonewindow"]) : false;
  };

  threeDCartBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "3dCart";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["cart"] = !this.utils.isNullOrEmpty(data["cart"]) ? this.utils.convertToBoolean(data["cart"]) : false;
    this.block["data"]["url"] = !this.utils.isNullOrEmpty(data["url"]) ? data["url"] : "";
    this.block["data"]["window"] = !this.utils.isNullOrEmpty(data["window"]) ? this.utils.convertToBoolean(data["window"]) : false;
    this.block["data"]["iphonewindow"] = !this.utils.isNullOrEmpty(data["iphonewindow"]) ? this.utils.convertToBoolean(data["iphonewindow"]) : false;
  };

  blogsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Blogs";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["wordPress"] = !this.utils.isNullOrEmpty(data["wordPress"]) ? this.utils.convertToBoolean(data["wordPress"]) : false;
    this.block["data"]["wordPressUrl"] = !this.utils.isNullOrEmpty(data["wordPressUrl"]) ? data["wordPressUrl"] : "";
    this.block["data"]["wordPressTitle"] = !this.utils.isNullOrEmpty(data["wordPressTitle"]) ? data["wordPressTitle"] : "";
    this.block["data"]["wordPressContent"] = !this.utils.isNullOrEmpty(data["wordPressContent"]) ? data["wordPressContent"] : "";
  };

  chatBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Chat";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "false";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    this.block["data"]["chat"] = !this.utils.isNullOrEmpty(data["chat"]) ? this.utils.convertToBoolean(data["chat"]) : true;
    this.block["data"]["isPrivate"] = !this.utils.isNullOrEmpty(data["isPrivate"]) ? this.utils.convertToBoolean(data["isPrivate"]) : false;
  };

  accountBlock(blockData: any, type: string, orgConnectDatas: any) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Connection Card";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["profileData"] = orgConnectDatas;
    this.block["data"] = {};

    var connectDatas = !this.utils.isNullOrEmpty(data["connectionCard"]) ? this.mapOrgProfileData(orgConnectDatas, data["connectionCard"], "account") : this.mapOrgProfileData(orgConnectDatas, [], "account");
    this.block["data"]["connectionCard"] = connectDatas;
    this.block["data"]["submember"] = data.hasOwnProperty("submember") && data["submember"].length > 0 && !this.utils.isNullOrEmpty(data["connectionCard"]) ? this.getAccountSubmember(orgConnectDatas, data["submember"]) : [];
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
  };

  profileBlock(blockData: any, type: string, orgConnectDatas: any) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Profile";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = "true";
    this.block["existingData"] = this.assignExists(blockData);
    this.block["selectedOrg"] = this.selectedOrg;
    this.block["profileData"] = orgConnectDatas;
    var data = this.lang === "en" && this.checkBlockExists(blockData) ? blockData["data"] : this.lang !== "en" && this.checkLanguage(blockData) ? blockData[this.lang]["data"] : [];
    this.block["data"] = {};

    var profileDatas = !this.utils.isNullOrEmpty(data["profile"]) ? this.mapOrgProfileData(orgConnectDatas, data["profile"], "profile") : this.mapOrgProfileData(orgConnectDatas, [], "profile");
    this.block["data"]["profile"] = profileDatas;
    this.block["data"]["redirectApp"] = !this.utils.isNullOrEmpty(data["redirectApp"]) ? this.utils.convertToBoolean(data["redirectApp"]) : false;
  };

  addSpaceBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["data"] = {};
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

  checkBlockExists(blockData: any) {
    var blkResult = !this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty("data") ? true : false;

    return blkResult;
  };

  assignVersion(blockData: any) {
    var versionResult = !this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty("version") ? blockData["version"] : 0;
    return versionResult;
  };

  assignActivate(blockData: any) {
    var activateResult = !this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty("activate") && !this.utils.isNullOrEmpty(blockData["activate"]) ? this.utils.convertToBoolean(blockData["activate"]) : true;
    return activateResult;
  };

  assignBlockId(blockData: any) {
    if (!this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(blockData["_id"])) {
      this.block["_id"] = blockData["_id"];
    }
  };

  assignExists(blockData: any) {
    return !this.utils.isEmptyObject(blockData) ? blockData : {};
  };

  checkLanguage(blockData: Object) {
    return !this.utils.isEmptyObject(blockData) && blockData.hasOwnProperty(this.lang) && blockData[this.lang].hasOwnProperty("data") ? true : false;
  };
};

export class GetBlocks {
  constructor(blcks: any[], langCode?: string, isNewBlock?: boolean, utils?: any) {
    this.utils = utils;
    this.currentBlocks = blcks;
    this.langCode = langCode;
    this.isNewBlock = isNewBlock;
  }

  utils: any;
  langCode: string = "en";
  currentBlocks: any[] = [];
  blocks: any[] = [];
  isChat: boolean = false;
  isNewBlock: boolean = false;

  getBlockDatas() {
    var isChat = false;

    if (this.currentBlocks.length > 0) {
      for (let i = 0; i < this.currentBlocks.length; i++) {
        var currBlock = !this.utils.isEmptyObject(this.currentBlocks[i]) && this.currentBlocks[i].hasOwnProperty("block") ? this.currentBlocks[i]["block"] : {};

        if (!this.utils.isEmptyObject(currBlock)) {
          var blockData = {};
          var type = currBlock["type"];

          if (!this.isNewBlock && currBlock.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(currBlock["_id"])) {
            blockData["_id"] = currBlock["_id"];
          }

          if (type === "text") {
            blockData["data"] = this.getText(currBlock);
          }

          if (type === "video") {
            blockData["data"] = this.getVideo(currBlock);
          }

          if (type === "picture") {
            blockData["data"] = this.getPicture(currBlock);

            if (this.getMediaChatCheck(blockData)) {
              this.isChat = true;
            }
          }

          if (type === "disqus") {
            blockData["data"] = this.getDisqus(currBlock);
          }

          if (type === "feed") {
            blockData["data"] = this.getFeed(currBlock);
          }

          if (type === "calendar") {
            blockData["data"] = this.getCalendar(currBlock);
          }

          if (type === "share") {
            blockData["data"] = this.getShare(currBlock);
          }

          if (type === "patients") {
            blockData["data"] = this.getPatients(currBlock);
          }

          if (type === "inquiry") {
            blockData["data"] = this.getInquiry(currBlock);
          }

          if (type === "survey") {
            blockData["data"] = this.getSurvey(currBlock);
          }

          if (type === "questionnaire") {
            blockData["data"] = this.getQuestionnaire(currBlock);
          }

          if (type === "startwrapper") {
            blockData["data"] = this.getStartWrapper(currBlock);
          }

          if (type === "title") {
            blockData["data"] = this.getTitle(currBlock);
          }

          if (type === "questions") {
            blockData["data"] = this.getQuestions(currBlock);
          }

          if (type === "attendance") {
            blockData["data"] = this.getAttendance(currBlock);
          }

          if (type === "confirmation") {
            blockData["data"] = this.getConfirmation(currBlock);
          }

          if (type === "password") {
            blockData["data"] = this.getPassword(currBlock);
          }

          if (type === "next") {
            blockData["data"] = this.getNext(currBlock);
          }

          if (type === "formphoto") {
            blockData["data"] = this.getFormPhoto(currBlock);
          }

          if (type === "painlevel") {
            blockData["data"] = this.getPainLevel(currBlock);
          }

          if (type === "drawtool") {
            blockData["data"] = this.getDrawTool(currBlock);
          }

          if (type === "physician") {
            blockData["data"] = this.getPhysician(currBlock);
          }

          if (type === "endwrapper") {
            blockData["data"] = this.getEndWrapper(currBlock);
          }

          if (type === "fill") {
            blockData["data"] = this.getFill(currBlock);
          }

          if (type === "notes") {
            blockData["data"] = this.getNotes(currBlock);
          }

          if (type === "buttons") {
            blockData["data"] = this.getButtons(currBlock);
            blockData["alerts"] = currBlock["alerts"];
          }

          if (type === "contactus") {
            blockData["data"] = this.getContactUs(currBlock);
          }

          if (type === "placefull") {
            blockData["data"] = this.getPlaceFull(currBlock);
          }

          if (type === "addtocart") {
            blockData["data"] = this.getAddToCart(currBlock);
          }

          if (type === "cart") {
            blockData["data"] = this.getCart(currBlock);
          }

          if (type === "blanksform") {
            blockData["data"] = this.getBlanksForm(currBlock);
          }

          if (type === "exclusiveurl") {
            blockData["data"] = this.getExclusiveUrl(currBlock);
          }

          if (type === "fileupload") {
            blockData["data"] = this.getFileUpload(currBlock);
          }

          if (type === "pushpay") {
            blockData["data"] = this.getPushPay(currBlock);
          }

          if (type === "threedcart") {
            blockData["data"] = this.getThreeDCart(currBlock);
          }

          if (type === "blogs") {
            blockData["data"] = this.getBlogs(currBlock);
          }

          if (type === "chat") {
            blockData["data"] = this.getChat(currBlock);
            this.isChat = true;
          }

          if (type === "account") {
            blockData["data"] = this.getAccount(currBlock);
          }

          if (type === "profile") {
            blockData["data"] = this.getProfile(currBlock);
          }

          var blkData = blockData.hasOwnProperty("_id") ? Object.assign({}, currBlock["existingData"]) : blockData;
          blkData["isForm"] = currBlock["isForm"];
          blkData["type"] = type;
          blkData["activate"] = currBlock["activate"];
          blkData["version"] = currBlock["version"];

          if (this.langCode !== "en") {
            var lang = {};

            /*if (blockData.hasOwnProperty("isChat")) {
              lang["isChat"] = blockData["isChat"];
            }*/

            if (blockData.hasOwnProperty("alerts")) {
              lang["alerts"] = blockData["alerts"];
            }

            lang["data"] = blockData["data"];
            blkData[this.langCode] = lang;
          }

          if ((this.langCode === "en") || (this.langCode !== "en" && !blkData.hasOwnProperty("_id"))) {
            /*if (blockData.hasOwnProperty("isChat")) {
              blkData["isChat"] = blockData["isChat"];
            }*/

            if (blockData.hasOwnProperty("alerts")) {
              blkData["alerts"] = blockData["alerts"];
            }

            blkData["data"] = blockData["data"];
          }

          if (blkData.hasOwnProperty("_id")) {
            var oldBlockData = currBlock["existingData"]
            var result = this.utils.compareObj(blkData, oldBlockData);

            if (!result) {
              blkData["version"] = parseInt(blkData["version"]) + 1;
            }
          }

          this.blocks.push(blkData);
        }
      }
    }

    return { "blocks": this.blocks, "isChat": this.isChat };
  };

  getText(blk: Object) {
    var data = {};
    data["text"] = !this.utils.isNullOrEmpty(blk["data"]["text"]) ? blk["data"]["text"] : "";

    return data;
  };

  getVideo(blk: Object) {
    var data = {};

    data["caption"] = !this.utils.isNullOrEmpty(blk["data"]["caption"]) ? blk["data"]["caption"] : "";
    data["url"] = !this.utils.isNullOrEmpty(blk["data"]["url"]) ? blk["data"]["url"] : "";
    data["videoid"] = !this.utils.isNullOrEmpty(blk["data"]["videoid"]) ? blk["data"]["videoid"] : "";

    return data;
  };

  getPicture(blk: Object) {
    var data = {};

    data["text"] = !this.utils.isNullOrEmpty(blk["data"]["text"]) ? blk["data"]["text"] : "";
    data["moderated"] = "false";
    data["rate"] = "false";
    data["vote"] = "false";

    let text = data["text"];

    if (!this.utils.isNullOrEmpty(text)) {
      if ($(text).find('a[type=eventPhoto]').length > 0) {
        data["moderated"] = $(text).find('a[type=eventPhoto]').attr('moderated');
        data["bgcolor"] = $(text).find('a[type=eventPhoto]').attr('bgcolor');
        data["rate"] = $(text).find('a[type=eventPhoto]').attr('rate');
        data["vote"] = $(text).find('a[type=eventPhoto]').attr('vote');
        data["showVote"] = $(text).find('a[type=eventPhoto]').attr('showvote');
        data["isName"] = $(text).find('a[type=eventPhoto]').attr('name');
        data["sort"] = $(text).find('a[type=eventPhoto]').attr('sort');
        data["floatingBottom"] = $(text).find('a[type=eventPhoto]').attr('floatingBottom');
        data["uploadbutton"] = $(text).find('a[type=eventPhoto]').attr('uploadbutton');
      }

      if ($(text).find('a[type=eventVideo]').length > 0) {
        data["videoModerated"] = $(text).find('a[type=eventVideo]').attr('moderated');
        data["bgcolor"] = $(text).find('a[type=eventVideo]').attr('bgcolor');
        data["vote"] = $(text).find('a[type=eventVideo]').attr('vote');
        data["showVote"] = $(text).find('a[type=eventVideo]').attr('showvote');
        data["isName"] = $(text).find('a[type=eventVideo]').attr('name');
        data["isVideo"] = true;
        data["chat"] = $(text).find('a[type=eventVideo]').attr('chat');
        data["privateChat"] = $(text).find('a[type=eventVideo]').attr('privatechat');
        data["sort"] = $(text).find('a[type=eventVideo]').attr('sort');
        data["floatingBottom"] = $(text).find('a[type=eventVideo]').attr('floatingBottom');
        data["uploadbutton"] = $(text).find('a[type=eventVideo]').attr('uploadbutton');
      }
    }

    return data;
  };

  getDisqus(blk: Object) {
    var data = {};
    data["disqus"] = blk["data"]["disqus"];

    return data;
  };

  getFeed(blk: Object) {
    var data = {};
    data["facebook"] = blk["data"]["facebook"];
    data["facebookurl"] = blk["data"]["facebookurl"];
    data["twitter"] = blk["data"]["twitter"];
    data["twitterurl"] = blk["data"]["twitterurl"];

    var instagram = blk["data"]["instagram"];

    if (instagram) {
      data["instagram"] = instagram;
      data["instaUserId"] = blk["data"]["instaUserId"];
      data["instaAccessToken"] = blk["data"]["instaAccessToken"];
    }

    return data;
  };

  getCalendar(blk: Object) {
    var data = {};
    data["text"] = blk["data"]["text"];

    return data;
  };

  getShare(blk: Object) {
    var data = {};

    data["facebook"] = blk["data"]["facebook"];
    data["twitter"] = blk["data"]["twitter"];
    data["email"] = blk["data"]["email"];
    data["linkedIn"] = blk["data"]["linkedIn"];
    data["pinterest"] = blk["data"]["pinterest"];
    data["googleplus"] = blk["data"]["googleplus"];
    data["shareURL"] = blk["data"]["shareURL"];

    return data;
  };

  getPatients(blk: Object) {
    var data = {};

    data["patients"] = blk["data"]["patients"];
    data["text"] = blk["data"]["text"];

    return data;
  };

  getInquiry(blk: Object) {
    var data = {};

    data["email"] = blk["data"]["email"];
    data["inquiryText"] = !this.utils.isNullOrEmpty(blk["data"]["inquiryText"]) ? blk["data"]["inquiryText"] : "Type your inquiry here";
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getSurvey(blk: Object) {
    var data = {};

    data["multiple"] = blk["data"]["multiple"];
    data["showInApp"] = blk["data"]["showInApp"];
    data["isNote"] = blk["data"]["isNote"];
    data["questionText"] = !this.utils.isNullOrEmpty(blk["data"]["questionText"]) ? this.utils.escapingQuotes(blk["data"]["questionText"]) : "";
    data["controls"] = blk["data"]["controls"];
    data["questions"] = blk["data"]["questions"];
    data["alerts"] = blk["data"]["alerts"];
    data["confirmation"] = blk["data"]["confirmation"];
    data["popup"] = blk["data"]["popup"];
    data["category"] = blk["data"]["category"];
    data["categoryName"] = blk["data"]["categoryName"];
    data["mandatory"] = blk["data"]["mandatory"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getQuestionnaire(blk: Object) {
    var data = {};

    data["questionText"] = blk["data"]["questionText"];
    data["mandatory"] = blk["data"]["mandatory"];
    data["redirectApp"] = blk["data"]["redirectApp"];
    data["isNote"] = blk["data"]["isNote"];
    data["showInApp"] = blk["data"]["showInApp"];
    data["isResultInApp"] = false;
    data["category"] = blk["data"]["category"];
    data["categoryName"] = blk["data"]["categoryName"];
    data["questionType"] = blk["data"]["questionType"];
    data["inputControlType"] = blk["data"]["inputControlType"];

    var quesOpts = blk["data"]["options"];

    var options = [];

    for (let i = 0; i < quesOpts.length; i++) {
      var quesOpt = quesOpts[i];
      var opt = {
        "option": !this.utils.isNullOrEmpty(quesOpt["option"]) ? quesOpt["option"] : "",
        "alert": !this.utils.isNullOrEmpty(blk["data"]["alerts"][i]) ? blk["data"]["alerts"][i] : "",
        "confirmation": !this.utils.isNullOrEmpty(blk["data"]["confirmation"][i]) ? blk["data"]["confirmation"][i] : "",
        "popup": !this.utils.isNullOrEmpty(blk["data"]["popup"][i]) ? blk["data"]["popup"][i] : "",
      };

      if (quesOpt.hasOwnProperty("subQuestions") && quesOpt["subQuestions"].length > 0) {
        opt["subQuestions"] = quesOpt["subQuestions"];
      }

      options.push(opt);
    }

    data["options"] = options;

    return data;
  };

  getStartWrapper(blk: Object) {
    var data = {};
    data["refresh"] = blk["data"]["refresh"];
    data["close"] = blk["data"]["close"];
    data["title"] = blk["data"]["title"];
    data["formCollapse"] = blk["data"]["formCollapse"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getTitle(blk: Object) {
    var data = {};
    data["titletext"] = blk["data"]["titletext"];
    data["title"] = blk["data"]["title"];

    return data;
  };

  getQuestions(blk: Object) {
    var data = {};

    data["questions"] = blk["data"]["questions"];
    data["mandatory"] = blk["data"]["mandatory"];
    data["answerTypes"] = blk["data"]["answerTypes"];
    data["notes"] = blk["data"]["notes"];
    data["category"] = blk["data"]["category"];
    data["categoryName"] = blk["data"]["categoryName"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getAttendance(blk: Object) {
    var data = {};

    data["title"] = blk["data"]["title"];
    data["person"] = blk["data"]["person"];
    data["online"] = blk["data"]["online"];
    data["addMember"] = blk["data"]["addMember"];
    data["addQuestion"] = blk["data"]["addQuestion"];
    data["options"] = blk["data"]["options"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getConfirmation(blk: Object) {
    var data = {};

    data["text"] = blk["data"]["text"];
    data["submittext"] = blk["data"]["submittext"];

    return data;
  };

  getPassword(blk: Object) {
    var data = {};
    data["password"] = blk["data"]["password"];

    return data;
  };

  getNext(blk: Object) {
    var data = {};

    data["text"] = blk["data"]["text"];
    data["tileId"] = blk["data"]["tileId"];
    data["tileTile"] = blk["data"]["tileTile"];
    data["type"] = blk["data"]["type"];

    return data;
  };

  getFormPhoto(blk: Object) {
    var data = {};
    data["text"] = blk["data"]["text"];

    if ($(data["text"]).find('a[type=formVideo]').length > 0) {
      data["isVideo"] = true;
    }

    return data;
  };

  getPainLevel(blk: Object) {
    var data = {};

    data["painlevel"] = true;
    data["question"] = blk["data"]["question"];
    data["mandatory"] = blk["data"]["mandatory"];
    data["level"] = blk["data"]["level"];

    return data;
  };

  getDrawTool(blk: Object) {
    var data = {};
    data["drawtool"] = true;
    data["text"] = blk["data"]["text"];

    return data;
  };

  getPhysician(blk: Object) {
    var data = {};

    data["isPhysician"] = blk["data"]["isPhysician"];
    data["mandatory"] = blk["data"]["mandatory"];
    data["text"] = blk["data"]["text"];

    return data;
  };

  getEndWrapper(blk: Object) {
    var data = {};

    data["text"] = blk["data"]["text"];
    data["submitConfirmation"] = blk["data"]["submitConfirmation"];

    return data;
  };

  getFill(blk: Object) {
    var data = {};
    data["text"] = blk["data"]["text"];

    return data;
  };

  getNotes(blk: Object) {
    var data = {};

    var data = {};
    data["notes"] = blk["data"]["notes"];
    data["allNotes"] = blk["data"]["allNotes"];
    data["journal"] = blk["data"]["journal"];

    return data;
  };

  getButtons(blk: Object) {
    var data = blk["data"];

    return data;
  };

  getContactUs(blk: Object) {
    var data = {};
    data["email"] = blk["data"]["email"];

    return data;
  };

  getPlaceFull(blk: Object) {
    var data = {};
    data["text"] = blk["data"]["text"];

    return data;
  };

  getAddToCart(blk: Object) {
    var data = {};
    data["productName"] = blk["data"]["productName"];
    data["description"] = blk["data"]["description"];
    data["price"] = blk["data"]["price"];
    data["currency"] = blk["data"]["currency"];
    data["textCartButton"] = blk["data"]["textCartButton"];
    data["confirmationMessage"] = blk["data"]["confirmationMessage"];
    data["productImage"] = blk["data"]["productImage"];

    data["isProductName"] = blk["data"]["isProductName"];
    data["isProductDescription"] = blk["data"]["isProductDescription"];
    data["isProductImage"] = blk["data"]["isProductImage"];
    data["isProductPrice"] = blk["data"]["isProductPrice"];

    return data;
  };

  getCart(blk: Object) {
    var data = {};

    data["productTitle"] = blk["data"]["productTitle"];
    data["notificationEmail"] = blk["data"]["notificationEmail"];
    data["textConfirmButton"] = blk["data"]["textConfirmButton"];
    data["confirmationMessage"] = data["data"]["confirmationMessage"];

    return data;
  };

  getBlanksForm(blk: Object) {
    var data = {};

    data["email"] = blk["data"]["email"];
    data["text"] = blk["data"]["text"];
    data["imageLimit"] = blk["data"]["imageLimit"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getExclusiveUrl(blk: Object) {
    var data = {};

    data["url"] = blk["data"]["url"]
    data["window"] = blk["data"]["window"];
    data["iphonewindow"] = blk["data"]["iphonewindow"];

    return data;
  };

  getFileUpload(blk: Object) {
    var data = {};

    data["url"] = blk["data"]["url"];

    return data;
  };

  getPushPay(blk: Object) {
    var data = {};

    data["pushpay"] = blk["data"]["pushpay"];
    data["url"] = blk["data"]["url"];
    data["window"] = blk["data"]["window"];
    data["iphonewindow"] = blk["data"]["iphonewindow"];

    return data;
  };

  getThreeDCart(blk: Object) {
    var data = {};

    data["cart"] = blk["data"]["cart"]
    data["url"] = blk["data"]["url"];
    data["window"] = blk["data"]["window"];
    data["iphonewindow"] = blk["data"]["iphonewindow"];

    return data;
  };

  getBlogs(blk: Object) {
    var data = {};

    data["wordPress"] = blk["data"]["wordPress"];
    data["wordPressUrl"] = blk["data"]["wordPressUrl"];
    data["wordPressTitle"] = blk["data"]["wordPressTitle"];

    data["wordPressContent"] = blk["data"]["wordPressContent"];

    return data;
  };

  getChat(blk: Object) {
    var data = {};
    data["chat"] = blk["data"]["chat"];
    data["isPrivate"] = blk["data"]["isPrivate"];

    return data;
  };

  getAccount(blk: Object) {
    var data = {};

    data["connectionCard"] = blk["data"]["connectionCard"];
    data["submember"] = blk["data"]["submember"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getProfile(blk: Object) {
    var data = {};

    data["profile"] = blk["data"]["profile"];
    data["redirectApp"] = blk["data"]["redirectApp"];

    return data;
  };

  getMediaChatCheck(blk: Object) {
    var text = !this.utils.isNullOrEmpty(blk["data"]["text"]) ? blk["data"]["text"] : "";
    return !this.utils.isNullOrEmpty(text) && $(text).find('a[type=eventVideo]').attr('chat') == "true" ? true : false;
  };
};









