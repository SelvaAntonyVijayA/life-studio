import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from '../../components/home/home.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { HomeRoutingModule } from '../../app-routes/home-routing.module';
import { HeaderComponent } from '../../components/header/header.component';
import { TilesListComponent, TilesComponent } from '../../components/tiles-list/tiles-list.component';
import { TileBlocksComponents, SafePipe } from '../../components/widgets/tileblocks.components';
import { EventsComponent } from '../../components/events/events.component';
import { FoldersComponent } from '../../components/folders/folders.component';

import { HeaderService } from '../../services/header.service';
import { TileService } from '../../services/tile.service';
import { CommonService } from '../../services/common.service';
import { DragService } from '../../services/drag.service'
import { EventService } from '../../services/event.service';

import { TileBlocksDirective } from '../../components/widgets/tileblocks.directive';
import { DyBindDirective } from '../../components/widgets/dynamic-bind.directive';
//import { DragDropDirectiveModule} from "angular4-drag-drop";

import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';
//import { SlimScrollModule } from 'ng2-slimscroll';
//import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { FilterByTextPipe, OrderByPipe, ReversePipe } from '../../helpers/filters.pipe';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { DropTargetDirective } from '../../helpers/drop-target.directive';

import { DateTimePickerDirective } from '../../helpers/date-time-picker.directive';

@NgModule({
  imports: [
    CommonModule, MalihuScrollbarModule.forRoot(), FormsModule, HomeRoutingModule
  ],
  entryComponents: [TileBlocksComponents],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent,
    TilesListComponent, FilterByTextPipe, OrderByPipe, ReversePipe, TilesComponent, TileBlocksComponents, SafePipe,
    TileBlocksDirective, DyBindDirective, DateTimePickerDirective, DraggableDirective, DropTargetDirective, Ng2Summernote, EventsComponent, FoldersComponent],
  providers: [HeaderService, TileService, CommonService, DragService, EventService]
})

export class HomeModule { }
