import { Component, OnInit, Input, ViewChild, ElementRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { TileBlocksDirective } from './tileblocks.directive';
import { BlockItem } from './block-item';
import { BlockComponent } from './block.component';
import {
  InquiryBlockComponent, NotesBlockComponent,
  SurveyBlockComponent, QuestionnaireBlockComponent,
  StartWrapperBlockComponent, FormTitleBlockComponent,
  QuestionsBlockComponent, AttendanceBlockComponent, ConfirmationBlockComponent,
  PasswordBlockComponent, NextBlockComponent, FormPhotoComponent, PainLevelComponent,
  DrawToolBlockComponent, PhysicianBlockComponent, EndWrapperBlockComponent
} from './tileblocks.components';
import { ISlimScrollOptions } from 'ng2-slimscroll';

declare var $: any;

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.css']
})

export class WidgetsComponent implements OnInit {
  @Input() blocks: BlockItem[];
  currentAddIndex: number = -1;
  @ViewChild(TileBlocksDirective) blockSelected: TileBlocksDirective;
  interval: any;
  opts: ISlimScrollOptions;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, elemRef: ElementRef) { }

  /* Set Scroll Options */

  setScrollOptions() {
    this.opts = {
      position: 'right',
      barBackground: '#8A8A8A',
      gridBackground: '#D9D9D9',
      barBorderRadius: '10',
      barWidth: '4',
      gridWidth: '2'
    };
  }

  /* Checking the block by block type */

  loadWidgets(type: any, data: any) {
    var blocks = this.blocks;
    var viewName = "";

    if (type === "notes") {
      this.blocks.push(new BlockItem(NotesBlockComponent, {
        "type": "notes", "blockName": "Notes"
      }));
      viewName = "notesView";
    }

    if (type === "inquiry") {
      blocks.push(new BlockItem(InquiryBlockComponent, {
        "type": "inquiry",
        "blockName": "Inquiry",
        "data": { "email": "", "inquiryText": "" }
      }));
      viewName = "inquiryView";
    }

    if (type === "survey") {
      blocks.push(new BlockItem(SurveyBlockComponent, {
        "type": "survey", "blockName": "Questionnaire", "data": {
          "controls": "radio", "multiple": "false", "showInApp": false, "isNote": false, "questions": [""],
          "confirmation": [], "popup": [], "alerts": []
        }
      }));
      viewName = "surveyView";
    }

    if (type === "questionnaire") {
      blocks.push(new BlockItem(QuestionnaireBlockComponent, {
        "type": "questionnaire", "blockName": "Cascading Questionnaire", "data": {
          "mandatory": false,
          "questionText": "",
          "inputControlType": "radio",
          "questionType": "single",
          "isNote": false,
          "options": [{
            "option": "",
            "alert": "",
            "confirmation": "",
            "popup": "",
            "subQuestions": []
          }],
          "confirmation": [],
          "popup": [],
          "alerts": []
        }
      }));

      viewName = "questionnaireView";
    }

    if (type === "startwrapper") {
      blocks.push(new BlockItem(StartWrapperBlockComponent, {
        "type": "startwrapper", "blockName": "Start Wrapper", "data": {
          "refresh": false, "close": false, "redirectApp": false
        }
      }));

      viewName = "startWrapperView";
    }

    if (type === "title") {
      blocks.push(new BlockItem(FormTitleBlockComponent, {
        "type": "title", "blockName": "Form Title", "data": {
          "titletext": "", "title": false
        }
      }));

      viewName = "formTitleView";
    }

    if (type === "questions") {
      blocks.push(new BlockItem(QuestionsBlockComponent, {
        "type": "questions", "blockName": "Questions & Answers", "data": {
          "questions": [""], "mandatory": [false], "answerTypes": ["text"], "notes": [false],
          "category": "", "categoryName": "", "redirectApp": false
        }
      }));

      viewName = "questionsView";
    }

    if (type === "attendance") {
      blocks.push(new BlockItem(AttendanceBlockComponent, {
        "type": "attendance", "blockName": "Attendance", "data": {
          "title": "", "person": false, "online": false,
          "addMember": false, "addQuestion": "Additional Family members attending (not added from another app)", "options": [], "redirectApp": false
        }
      }));

      viewName = "attendanceView";
    }

    if (type === "confirmation") {
      blocks.push(new BlockItem(ConfirmationBlockComponent, {
        "type": "confirmation", "blockName": "Confirmation", "data": {
          "text": new String(""), "submittext": ""
        }
      }));

      viewName = "confirmationView";
    }

    if (type === "password") {
      blocks.push(new BlockItem(PasswordBlockComponent, {
        "type": "password", "blockName": "Password", "data": {
          "password": false
        }
      }));

      viewName = "passwordView";
    }

    if (type === "next") {
      blocks.push(new BlockItem(NextBlockComponent, {
        "type": "next", "blockName": "Next", "data": {
          "text": "", "tileId": "", "tileTile": "", "type": "tile"
        }
      }));

      viewName = "nextView";
    }

    if (type === "formphoto") {
      blocks.push(new BlockItem(FormPhotoComponent, {
        "type": "formphoto", "blockName": "Form Media", "data": {
          "text": new String(""), "isVideo": false
        }
      }));

      viewName = "formPhotoView";
    }

    if (type === "painlevel") {
      blocks.push(new BlockItem(PainLevelComponent, {
        "type": "painlevel", "blockName": "Pain Level", "data": {
          "painlevel": true, "question": "", "mandatory": false, "level": "image"
        }
      }));

      viewName = "painLevelView";
    }

    if (type === "drawtool") {
      blocks.push(new BlockItem(DrawToolBlockComponent, {
        "type": "drawtool", "blockName": "Draw tool", "data": {
          "drawtool": true, "text": ""
        }
      }));

      viewName = "drawToolView";
    }

    if (type === "physician") {
      blocks.push(new BlockItem(PhysicianBlockComponent, {
        "type": "physician", "blockName": "Physician", "data": {
          "isPhysician": true, "mandatory": false, "text": "Physician"
        }
      }));

      viewName = "physicianView";
    }

    if (type === "endwrapper") {
      blocks.push(new BlockItem(EndWrapperBlockComponent, {
        "type": "endwrapper", "blockName": "End Wrapper", "data": {
          "text": "", "submitConfirmation": false
        }
      }));

      viewName = "endWrapperView";
    }

    this.loadComponent(viewName);
  }

  ngOnInit() {
    this.blocks = [];
    this.setScrollOptions();
  }

  deleteBlock(view: any) {
    let index = this.blockSelected.viewContainerRef.indexOf(view);
    this.blockSelected.viewContainerRef.remove(index);
    this.blocks.splice(0, 1);

    this.currentAddIndex = this.currentAddIndex - 1;
  }

  resetTile(e: any) {
    if (this.blocks.length > 0) {
      let viewContainerRef = this.blockSelected.viewContainerRef;
      viewContainerRef.clear();
      this.blocks = [];
      this.currentAddIndex = -1;
    }
  }

  saveBlocks(e: any) {
    var result = this.blocks;
  };


  /* Loading the block components */

  loadComponent(viewName: string) {
    this.currentAddIndex = this.currentAddIndex + 1;
    let adBlock = this.blocks[this.currentAddIndex];

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(adBlock.component);

    let viewContainerRef = this.blockSelected.viewContainerRef;
    //viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    adBlock.block["view"] = componentRef.hostView;
    componentRef.instance[viewName].subscribe(view => this.deleteBlock(view));

    (<BlockComponent>componentRef.instance).block = adBlock.block;
  }
}
