import { Directive, ElementRef, Renderer, EventEmitter, Input, Output } from '@angular/core';
declare var $: any;
declare var datetimepicker: any;

@Directive({
  selector: '[ILIDateTimePicker]'
})
export class DateTimePickerDirective {

  constructor(private el?: ElementRef, private renderer?: Renderer) {
  }

  //ngModelChange = new EventEmitter();

  ngAfterViewInit() {
    var curRenderer = this.renderer;
    var curNativeElement = this.el.nativeElement;
    
    $(this.el.nativeElement).datetimepicker({ format: 'MM/DD/YYYY LT' }).on('dp.change', function (e) {
      let inputEvent = new Event("input", { bubbles: true });
      curRenderer.invokeElementMethod(curNativeElement, "dispatchEvent", [inputEvent]);
    });
  }

  ngOnDestroy() {
    $(this.el.nativeElement).data('DateTimePicker').destroy();
  };
}
