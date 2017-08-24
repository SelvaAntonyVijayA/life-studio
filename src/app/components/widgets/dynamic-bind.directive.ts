import { Directive, Input, TemplateRef, SkipSelf, Optional, ViewContainerRef } from '@angular/core' ;

@Directive({ selector: '[dyBind]'})
export class DyBindDirective {
  private hasView = false;
  //public parent: parent;


  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { 
    }

  @Input() set dyBind(condition: boolean) {
    if (!condition && !this.hasView) {
     //  this.viewContainer.createEmbeddedView(this.templateRef);
     //  this.hasView = true;
    } else if (condition && this.hasView) {
     //  this.viewContainer.clear();
     //  this.hasView = false;
    }
  }
}