import { Type, HostListener } from '@angular/core';
import { Utils } from '../../helpers/utils';

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
  constructor(blk: any, type: string, orgConnectDatas?: any[], widgetCategories?: any[]) {
    this.utils = Utils;
    this.block = {};
    this.getType(blk, type, orgConnectDatas, widgetCategories);

    return this.block;
  }

  block: any = {};
  utils: any;

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
  }

  textBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Editor";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
  };

  videoBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Upload Video";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["caption"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["caption"]) ? blockData["data"]["caption"] : "";
    this.block["data"]["url"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["url"]) ? blockData["data"]["url"] : "";
    this.block["data"]["videoid"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["videoid"]) ? blockData["data"]["videoid"] : "";
  };

  pictureBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Event Media";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
    this.block["data"]["moderated"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["moderated"]) ? blockData["data"]["moderated"].toString() : "false";
    this.block["data"]["rate"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["rate"]) ? blockData["data"]["rate"].toString() : "false";
    this.block["data"]["vote"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["vote"]) ? blockData["data"]["vote"].toString() : "false";
  };

  disqusBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Disqus";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["disqus"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["disqus"]) ? this.utils.convertToBoolean(blockData["data"]["disqus"]) : false;
  };

  feedBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Social Feed";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["facebook"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["facebook"]) ? this.utils.convertToBoolean(blockData["data"]["facebook"]) : false;
    this.block["data"]["facebookurl"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["facebookurl"]) ? blockData["data"]["facebookurl"] : "";
    this.block["data"]["twitter"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["twitter"]) ? this.utils.convertToBoolean(blockData["data"]["twitter"]) : false;
    this.block["data"]["twitterurl"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["twitterurl"]) ? blockData["data"]["twitterurl"] : "";
    this.block["data"]["instagram"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["instagram"]) ? this.utils.convertToBoolean(blockData["data"]["instagram"]) : false;
    this.block["data"]["instaUserId"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["instaUserId"]) ? blockData["data"]["instaUserId"] : "";
    this.block["data"]["instaAccessToken"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["instaAccessToken"]) ? blockData["data"]["instaAccessToken"] : "";
  };

  calendarBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Calendar";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
  };

  shareBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Facebook, Twitter & Email Sharing";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["facebook"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["facebook"]) ? this.utils.convertToBoolean(blockData["data"]["facebook"]) : false;
    this.block["data"]["twitter"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["twitter"]) ? this.utils.convertToBoolean(blockData["data"]["twitter"]) : false;
    this.block["data"]["email"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["email"]) ? this.utils.convertToBoolean(blockData["data"]["email"]) : false;
  };

  patientsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Facebook, Twitter & Email Sharing";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["patients"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["patients"]) ? this.utils.convertToBoolean(blockData["data"]["patients"]) : false;
    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : "Patients";
  };

  inquiryBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Inquiry";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["email"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["email"]) ? blockData["data"]["email"] : "";
    this.block["data"]["inquiryText"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["inquiryText"]) ? blockData["data"]["inquiryText"] : "";
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
  };

  surveyBlock(blockData: any, type: string, widgetCategories: any[]) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Simple Questionnaire";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["widgetCategories"] = widgetCategories;
    this.block["data"] = {};

    this.block["data"]["mandatory"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("mandatory") && !this.utils.isNullOrEmpty(blockData["data"]["mandatory"]) ? this.utils.convertToBoolean(blockData["data"]["mandatory"]) : false;
    this.block["data"]["questionText"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(blockData["data"]["questionText"]) ? blockData["data"]["questionText"] : "";
    this.block["data"]["controls"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["controls"]) ? blockData["data"]["controls"] : "radio";
    this.block["data"]["multiple"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["multiple"]) ? blockData["data"]["multiple"].toString() : "false";
    this.block["data"]["showInApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["showInApp"]) ? this.utils.convertToBoolean(blockData["data"]["showInApp"]) : false;
    this.block["data"]["isNote"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isNote"]) ? this.utils.convertToBoolean(blockData["data"]["isNote"]) : false;
    this.block["data"]["questions"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["questions"]) ? blockData["data"]["questions"] : [""];
    this.block["data"]["popup"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["popup"]) ? blockData["data"]["popup"] : [];
    this.block["data"]["alerts"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["alerts"]) ? blockData["data"]["alerts"] : [];
    this.block["data"]["confirmation"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["confirmation"]) ? blockData["data"]["confirmation"] : [];
    this.block["data"]["category"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("category") && !this.utils.isNullOrEmpty(blockData["data"]["category"]) ? blockData["data"]["category"] : "-1";
    this.block["data"]["categoryName"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(blockData["data"]["categoryName"]) ? blockData["data"]["categoryName"] : "";
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
  };

  questionnaireBlock(blockData: any, type: string, widgetCategories: any[]) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Cascading Questionnaire";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["widgetCategories"] = widgetCategories;
    this.block["data"] = {};

    this.block["data"]["mandatory"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("mandatory") && !this.utils.isNullOrEmpty(blockData["data"]["mandatory"]) ? this.utils.convertToBoolean(blockData["data"]["mandatory"]) : false;
    this.block["data"]["questionText"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("questionText") && !this.utils.isNullOrEmpty(blockData["data"]["questionText"]) ? blockData["data"]["questionText"] : "";
    this.block["data"]["inputControlType"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("inputControlType") && !this.utils.isNullOrEmpty(blockData["data"]["inputControlType"]) ? blockData["data"]["inputControlType"] : "radio";
    this.block["data"]["questionType"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("questionType") && !this.utils.isNullOrEmpty(blockData["data"]["questionType"]) ? blockData["data"]["questionType"] : "single";
    this.block["data"]["isNote"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("isNote") && !this.utils.isNullOrEmpty(blockData["data"]["isNote"]) ? this.utils.convertToBoolean(blockData["data"]["isNote"]) : false;
    this.block["data"]["showInApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["showInApp"]) ? this.utils.convertToBoolean(blockData["data"]["showInApp"]) : false;
    this.block["data"]["category"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("category") && !this.utils.isNullOrEmpty(blockData["data"]["category"]) ? blockData["data"]["category"] : "-1";
    this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("categoryName") && !this.utils.isNullOrEmpty(blockData["data"]["categoryName"]) ? blockData["data"]["categoryName"] : "";
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;

    var options = [];
    var alerts = [];
    var confirmation = [];
    var popup = [];

    if (this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("options") && blockData["data"]["options"].length > 0) {
      var quesOpts = blockData["data"]["options"];

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
        subQuesObj["type"] = "description",
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
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["refresh"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["refresh"]) ? this.utils.convertToBoolean(blockData["data"]["refresh"]) : false;
    this.block["data"]["close"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["close"]) ? this.utils.convertToBoolean(blockData["data"]["close"]) : false;
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
  };

  titleBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Form Title";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["titletext"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["titletext"]) ? blockData["data"]["titletext"] : "";
    this.block["data"]["title"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["title"]) ? this.utils.convertToBoolean(blockData["data"]["title"]) : false;
  };

  questionsBlock(blockData: any, type: string, widgetCategories: any[]) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Questions & Answers";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["widgetCategories"] = widgetCategories;
    this.block["data"] = {};

    this.block["data"]["questions"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["questions"]) ? blockData["data"]["questions"] : [""];
    this.block["data"]["mandatory"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["mandatory"]) ? blockData["data"]["mandatory"] : [false];
    this.block["data"]["answerTypes"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["answerTypes"]) ? blockData["data"]["answerTypes"] : ["text"];
    this.block["data"]["notes"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["notes"]) ? blockData["data"]["notes"] : [false];
    this.block["data"]["category"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["category"]) ? blockData["data"]["category"] : "";
    this.block["data"]["categoryName"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["categoryName"]) ? blockData["data"]["categoryName"] : "";
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
    //this.block["data"]["category"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("category") && !this.utils.isNullOrEmpty(blockData["data"]["category"]) ? blockData["data"]["category"] : "-1";
  };

  attendanceBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Attendance";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["title"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["title"]) ? blockData["data"]["title"] : "";
    this.block["data"]["person"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["person"]) ? this.utils.convertToBoolean(blockData["data"]["person"]) : false;
    this.block["data"]["online"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["online"]) ? this.utils.convertToBoolean(blockData["data"]["online"]) : false;
    this.block["data"]["addMember"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["addMember"]) ? this.utils.convertToBoolean(blockData["data"]["addMember"]) : false;
    this.block["data"]["addQuestion"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["addQuestion"]) ? blockData["data"]["addQuestion"] : "Additional Family members attending (not added from another app)";
    this.block["data"]["options"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["options"]) ? blockData["data"]["options"] : [];
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
  };

  confirmationBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Confirmation";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
    this.block["data"]["submittext"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["submittext"]) ? blockData["data"]["submittext"] : "";
  };

  passwordBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Password";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["password"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["password"]) ? this.utils.convertToBoolean(blockData["data"]["password"]) : false;
  };

  nextBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Next";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : "";
    this.block["data"]["tileId"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["tileId"]) ? blockData["data"]["tileId"] : "";
    this.block["data"]["tileTile"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["tileTile"]) ? blockData["data"]["tileTile"] : "";
    this.block["data"]["type"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["type"]) ? blockData["data"]["type"] : "";
  };

  formPhotoBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Form Media";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
    this.block["data"]["isVideo"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isVideo"]) ? this.utils.convertToBoolean(blockData["data"]["isVideo"]) : false;
  };

  painLevelBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Pain Level";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["painlevel"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["painlevel"]) ? this.utils.convertToBoolean(blockData["data"]["painlevel"]) : false;
    this.block["data"]["question"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["question"]) ? blockData["data"]["question"] : "";
    this.block["data"]["mandatory"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["mandatory"]) ? this.utils.convertToBoolean(blockData["data"]["mandatory"]) : false;
    this.block["data"]["level"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["level"]) ? blockData["data"]["level"] : "image";
  };

  drawToolBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Draw tool";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["drawtool"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["drawtool"]) ? this.utils.convertToBoolean(blockData["data"]["drawtool"]) : true;
    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : "";
  };

  physicianBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Physician";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["isPhysician"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isPhysician"]) ? this.utils.convertToBoolean(blockData["data"]["isPhysician"]) : true;
    this.block["data"]["mandatory"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["mandatory"]) ? this.utils.convertToBoolean(blockData["data"]["mandatory"]) : false;
    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : "";
  };

  endWrapperBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "End Wrapper";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : "";
    this.block["data"]["submitConfirmation"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["submitConfirmation"]) ? this.utils.convertToBoolean(blockData["data"]["submitConfirmation"]) : false;
  };

  fillBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Fill-in the blanks";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
  };

  notesBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Notes";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"]["notes"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["notes"]) ? this.utils.convertToBoolean(blockData["data"]["notes"]) : true;
    this.block["data"]["allNotes"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["allNotes"]) ? this.utils.convertToBoolean(blockData["data"]["allNotes"]) : false;
    this.block["data"]["journal"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["journal"]) ? this.utils.convertToBoolean(blockData["data"]["journal"]) : false;
  };

  buttonsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Buttons";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["data"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]) ? blockData["data"] : [{ "beforeText": "", "afterText": "" }];
    this.block["alerts"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["alerts"]) ? blockData["alerts"] : [];
  };

  contactUsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "ContactUs";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["email"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["email"]) ? blockData["data"]["email"] : "";
  };

  placefullBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "PlaceFull";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["text"] = !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : "";
  };

  addToCartBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Add To Cart";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["productName"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["productName"]) ? blockData["productName"] : "";
    this.block["description"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["description"]) ? blockData["description"] : "";
    this.block["price"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["price"]) ? blockData["price"] : "";
    this.block["currency"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["currency"]) ? blockData["currency"] : "";
    this.block["textCartButton"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["textCartButton"]) ? blockData["textCartButton"] : "";
    this.block["confirmationMessage"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["confirmationMessage"]) ? blockData["confirmationMessage"] : "";
    this.block["productImage"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["productImage"]) ? blockData["productImage"] : "";

    this.block["data"]["isProductName"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isProductName"]) ? this.utils.convertToBoolean(blockData["data"]["isProductName"]) : true;
    this.block["data"]["isProductDescription"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isProductDescription"]) ? this.utils.convertToBoolean(blockData["data"]["isProductDescription"]) : true;
    this.block["data"]["isProductImage"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isProductImage"]) ? this.utils.convertToBoolean(blockData["data"]["isProductImage"]) : true;
    this.block["data"]["isProductPrice"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isProductPrice"]) ? this.utils.convertToBoolean(blockData["data"]["isProductPrice"]) : true;
  };

  cartBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Cart";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["productTitle"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["productTitle"]) ? blockData["data"]["productTitle"] : "";
    this.block["notificationEmail"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["notificationEmail"]) ? blockData["data"]["notificationEmail"] : "";
    this.block["textConfirmButton"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["textConfirmButton"]) ? blockData["data"]["textConfirmButton"] : "";
    this.block["confirmationMessage"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["confirmationMessage"]) ? blockData["data"]["confirmationMessage"] : "";
  };

  blanksFormBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Blanks Form";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["data"] = {};

    this.block["email"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["email"]) ? blockData["data"]["email"] : "";
    this.block["text"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["text"]) ? blockData["data"]["text"] : new String("");
    this.block["imageLimit"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["imageLimit"]) ? blockData["data"]["imageLimit"] : "";
    this.block["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
  };

  exclusiveUrlBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "URL";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["url"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["url"]) ? blockData["data"]["url"] : "";
    this.block["data"]["window"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["window"]) ? this.utils.convertToBoolean(blockData["data"]["window"]) : false;
    this.block["data"]["iphonewindow"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["iphonewindow"]) ? this.utils.convertToBoolean(blockData["data"]["iphonewindow"]) : false;
  };

  fileUploadBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "File Upload";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["url"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["url"]) ? blockData["data"]["url"] : "";
  };

  pushPayBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "PushPay";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["pushpay"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["pushpay"]) ? this.utils.convertToBoolean(blockData["data"]["pushpay"]) : false;
    this.block["url"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["url"]) ? blockData["data"]["url"] : "";
    this.block["data"]["window"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["window"]) ? this.utils.convertToBoolean(blockData["data"]["window"]) : false;
    this.block["data"]["iphonewindow"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["iphonewindow"]) ? this.utils.convertToBoolean(blockData["data"]["iphonewindow"]) : false;
  };

  threeDCartBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "3dCart";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["cart"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["cart"]) ? this.utils.convertToBoolean(blockData["data"]["cart"]) : false;
    this.block["url"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["url"]) ? blockData["data"]["url"] : "";
    this.block["data"]["window"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["window"]) ? this.utils.convertToBoolean(blockData["data"]["window"]) : false;
    this.block["data"]["iphonewindow"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["iphonewindow"]) ? this.utils.convertToBoolean(blockData["data"]["iphonewindow"]) : false;
  };

  blogsBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Blogs";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["wordPress"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["wordPress"]) ? this.utils.convertToBoolean(blockData["data"]["wordPress"]) : false;
    this.block["wordPressUrl"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["wordPressUrl"]) ? blockData["wordPressUrl"] : "";
    this.block["wordPressTitle"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["wordPressTitle"]) ? blockData["wordPressTitle"] : "";
    this.block["wordPressContent"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["wordPressContent"]) ? blockData["wordPressContent"] : new String("");
  };

  chatBlock(blockData: any, type: string) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Chat";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = false;
    this.block["data"] = {};

    this.block["data"]["chat"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["chat"]) ? this.utils.convertToBoolean(blockData["data"]["chat"]) : true;
    this.block["data"]["isPrivate"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["isPrivate"]) ? this.utils.convertToBoolean(blockData["data"]["isPrivate"]) : false;
  };

  accountBlock(blockData: any, type: string, orgConnectDatas: any) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Connection Card";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["profileData"] = orgConnectDatas;
    this.block["data"] = {};

    var connectDatas = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["connectionCard"]) ? this.mapOrgProfileData(orgConnectDatas, blockData["data"]["connectionCard"], "account") : this.mapOrgProfileData(orgConnectDatas, [], "account");
    this.block["data"]["connectionCard"] = connectDatas;
    this.block["data"]["submember"] = this.checkBlockExists(blockData) && blockData["data"].hasOwnProperty("submember") && blockData["data"]["submember"].length > 0 && !this.utils.isNullOrEmpty(blockData["data"]["connectionCard"]) ? this.getAccountSubmember(orgConnectDatas, blockData["data"]["submember"]) : [];
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
  };

  profileBlock(blockData: any, type: string, orgConnectDatas: any) {
    this.assignBlockId(blockData);
    this.block["type"] = type;
    this.block["blockName"] = "Profile";
    this.block["activate"] = this.assignActivate(blockData);
    this.block["version"] = this.assignVersion(blockData);
    this.block["isForm"] = true;
    this.block["profileData"] = orgConnectDatas;
    this.block["data"] = {};

    var profileDatas = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["profile"]) ? this.mapOrgProfileData(orgConnectDatas, blockData["data"]["profile"], "profile") : this.mapOrgProfileData(orgConnectDatas, [], "profile");
    this.block["data"]["profile"] = profileDatas;
    this.block["data"]["redirectApp"] = this.checkBlockExists(blockData) && !this.utils.isNullOrEmpty(blockData["data"]["redirectApp"]) ? this.utils.convertToBoolean(blockData["data"]["redirectApp"]) : false;
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
    let utils = Utils;
    var blkResult = !utils.isEmptyObject(blockData) && blockData.hasOwnProperty("data") ? true : false;

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
};

export class getBlocks {
  constructor(blcks: any[], isSave?: boolean) {
    this.utils = Utils;
    this.currentBlocks = blcks;

    if (isSave) {
      this.isSave = isSave;
    }
  }

  utils: any;
  currentBlocks: any[] = [];
  blocks: any[] = [];
  isSave: boolean = false;

  getBlockDatas() {
    if (this.currentBlocks.length > 0) {
      for (let i = 0; i < this.currentBlocks.length; i++) {
        var currBlock = !this.utils.isEmptyObject(this.currentBlocks[i]) && this.currentBlocks[i].hasOwnProperty("block") ? this.currentBlocks[i]["block"] : {};

        if (!this.utils.isEmptyObject(currBlock)) {
          var blockData = {};
          var type = currBlock["type"];

          if (currBlock.hasOwnProperty("_id") && !this.utils.isNullOrEmpty(currBlock["_id"])) {
            blockData["_id"] = currBlock["_id"];
          }

          if (type === "text") {
            blockData["type"] = type;
            blockData["data"] = this.getText(currBlock);
          }

          if (type === "video") {
            blockData["type"] = type;
            blockData["data"] = this.getVideo(currBlock);
          }

          if (type === "picture") {
            blockData["type"] = type;
            blockData["data"] = this.getPicture(currBlock);

            /*if (this.getMediaChatCheck(blockData)) {
              blocks.isChat = true;
            }*/
          }

          if (type === "disqus") {
            blockData["type"] = type;
            blockData["data"] = this.getDisqus(currBlock);
          }

          if (type === "feed") {
            blockData["type"] = type;
            blockData["data"] = this.getFeed(currBlock);
          }

          if (type === "calendar") {
            blockData["type"] = type;
            blockData["data"] = this.getCalendar(currBlock);
          }

          if (type === "share") {
            blockData["type"] = type;
            blockData["data"] = this.getShare(currBlock);
          }

          if (type === "patients") {
            blockData["type"] = type;
            this.getPatients(currBlock);
          }

          if (type === "inquiry") {
            blockData["type"] = type;
            this.getInquiry(currBlock);
          }

          if (type === "survey") {
            blockData["type"] = type;
            this.getSurvey(currBlock);
          }

          if (type === "questionnaire") {
            blockData["type"] = type;
            this.getQuestionnaire(currBlock);
          }

          if (type === "startwrapper") {
            blockData["type"] = type;
            this.getStartWrapper(currBlock);
          }

          if (type === "title") {
            blockData["type"] = type;
            this.getTitle(currBlock);
          }

          if (type === "questions") {
            blockData["type"] = type;
            this.getQuestions(currBlock);
          }

          if (type === "attendance") {
            blockData["type"] = type;
            this.getAttendance(currBlock);
          }

          if (type === "confirmation") {
            blockData["type"] = type;
            this.getConfirmation(currBlock);
          }

          if (type === "password") {
            blockData["type"] = type;
            this.getPassword(currBlock);
          }

          if (type === "next") {
            blockData["type"] = type;
            this.getNext(currBlock);
          }

          if (type === "formphoto") {
            blockData["type"] = type;
            this.getFormPhoto(currBlock);
          }

          if (type === "painlevel") {
            blockData["type"] = type;
            this.getPainLevel(currBlock);
          }

          if (type === "drawtool") {
            blockData["type"] = type;
            this.getDrawTool(currBlock);
          }

          if (type === "physician") {
            blockData["type"] = type;
            this.getPhysician(currBlock);
          }

          if (type === "endwrapper") {
            blockData["type"] = type;
            this.getEndWrapper(currBlock);
          }

          if (type === "fill") {
            blockData["type"] = type;
            this.getFill(currBlock);
          }

          if (type === "notes") {
            blockData["type"] = type;
            this.getNotes(currBlock);
          }

          if (type === "buttons") {
            blockData["type"] = type;
            blockData["data"] = this.getButtons(currBlock);
            blockData["alerts"] = currBlock["alerts"];
          }

          if (type === "contactus") {
            blockData["type"] = type;
            this.getContactUs(currBlock);
          }

          if (type === "placefull") {
            blockData["type"] = type;
            this.getPlaceFull(currBlock);
          }

          if (type === "addtocart") {
            blockData["type"] = type;
            this.getAddToCart(currBlock);
          }

          if (type === "cart") {
            blockData["type"] = type;
            this.getCart(currBlock);
          }

          if (type === "blanksform") {
            blockData["type"] = type;
            this.getBlanksForm(currBlock);
          }

          if (type === "exclusiveurl") {
            blockData["type"] = type;
            this.getExclusiveUrl(currBlock);
          }

          if (type === "fileupload") {
            blockData["type"] = type;
            this.getFileUpload(currBlock);
          }

          if (type === "pushpay") {
            blockData["type"] = type;
            this.getPushPay(currBlock);
          }

          if (type === "threedcart") {
            blockData["type"] = type;
            this.getThreeDCart(currBlock);
          }

          if (type === "blogs") {
            blockData["type"] = type;
            this.getBlogs(currBlock);
          }

          if (type === "chat") {
            blockData["type"] = type;
            this.getChat(currBlock);
          }

          if (type === "account") {
            blockData["type"] = type;
            this.getAccount(currBlock);
          }

          if (type === "profile") {
            blockData["type"] = type;
            this.getProfile(currBlock);
          }
        }
      }
    }


    return this.blocks;
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
    data["questionText"] = !this.utils.isNullOrEmpty(data["questionText"]) ? this.utils.escapingQuotes(data["questionText"]) : "";
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
    data["email"] = blk["email"];

    return data;
  };

  getPlaceFull(blk: Object) {
    var data = {};
    data["text"] = blk["text"];

    return data;
  };

  getAddToCart(blk: Object) {
    var data = {};
    data["productName"] = blk["productName"];
    data["description"] = blk["description"];
    data["price"] = blk["price"];
    data["currency"] = blk["currency"];
    data["textCartButton"] = blk["textCartButton"];
    data["confirmationMessage"] = blk["confirmationMessage"];
    data["productImage"] = blk["productImage"];

    data["isProductName"] = blk["data"]["isProductName"];
    data["isProductDescription"] = blk["data"]["isProductDescription"];
    data["isProductImage"] = blk["data"]["isProductImage"];
    data["isProductPrice"] = blk["data"]["isProductPrice"];

    return data;
  };

  getCart(blk: Object) {
    var data = {};

    data["productTitle"] = blk["productTitle"];
    data["notificationEmail"] = blk["notificationEmail"];
    data["textConfirmButton"] = blk["textConfirmButton"];
    data["confirmationMessage"] = data["confirmationMessage"];

    return data;
  };

  getBlanksForm(blk: Object) {
    var data = {};

    data["email"] = blk["email"];
    data["text"] = blk["text"];
    data["imageLimit"] = blk["imageLimit"];
    data["redirectApp"] = blk["redirectApp"];

    return data;
  };

  getExclusiveUrl(blk: Object) {
    var data = {};

    data["url"] = blk["url"]
    data["window"] = blk["data"]["window"];
    data["iphonewindow"] = blk["data"]["iphonewindow"];

    return data;
  };


  getFileUpload(blk: Object) {
    var data = {};

    data["url"] = blk["url"];

    return data;
  };

  getPushPay(blk: Object) {
    var data = {};

    data["pushpay"] = blk["data"]["pushpay"];
    data["url"] = blk["url"];
    data["window"] = blk["data"]["window"];
    data["iphonewindow"] = blk["data"]["iphonewindow"];

    return data;
  };

  getThreeDCart(blk: Object) {
    var data = {};

    data["cart"] = blk["data"]["cart"]
    data["url"] = blk["url"];
    data["window"] = blk["data"]["window"];
    data["iphonewindow"] = blk["data"]["iphonewindow"];

    return data;
  };

  getBlogs(blk: Object) {
    var data = {};

    data["wordPress"] = blk["data"]["wordPress"];
    data["wordPressUrl"] = blk["wordPressUrl"];
    data["wordPressTitle"] = blk["wordPressTitle"];

    data["wordPressContent"] = blk["wordPressContent"];

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
  }
};









