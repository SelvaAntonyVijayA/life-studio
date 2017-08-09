import { Type } from '@angular/core';

export class BlockItem {
  constructor(public component: Type<any>, public block: any) {}
}
