import { Directive, ElementRef } from '@angular/core';
declare var $: any;
declare var datetimepicker: any;

@Directive({
  selector: '[ILIDateTimePicker]'
})
export class DateTimePickerDirective {

  constructor(private el?: ElementRef) {
  }

  ngAfterViewInit() {
    $(this.el.nativeElement).datetimepicker({ format: 'MM/DD/YYYY LT' });
  }

  ngOnDestroy() {
    $(this.el.nativeElement).data('DateTimePicker').destroy();
  };
}
