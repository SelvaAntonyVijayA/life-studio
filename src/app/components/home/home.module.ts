import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { CKEditorModule } from 'ng2-ckeditor';

import { HomeComponent } from '../../components/home/home.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { HomeRoutingModule } from '../../app-routes/home-routing.module';
import { HeaderComponent } from '../../components/header/header.component';
import { TilesListComponent, TilesComponent } from '../../components/tiles-list/tiles-list.component';
import { TileBlocksComponents } from '../../components/widgets/tileblocks.components';
import { EventsComponent } from '../../components/events/events.component';
import { FoldersComponent } from '../../components/folders/folders.component';
import { AccountComponent } from '../../components/account/account.component';
import { CategoriesComponent } from '../../components/categories/categories.component';
import { ThemeComponent } from '../../components/theme/theme.component';
import { ProcessesComponent } from '../../components/processes/processes.component';
import { PagesComponent } from '../../components/pages/pages.component';
import { DemoComponent } from '../../components/demo/demo.component';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { SmartComponent } from '../../components/smart/smart.component';
//import { ImagelibraryComponent } from '../../components/imagelibrary/imagelibrary.component';

import { ProceduresComponent } from '../../components/procedures/procedures.component';
import { HeaderService } from '../../services/header.service';
import { TileService } from '../../services/tile.service';
import { CommonService } from '../../services/common.service';
import { DragService } from '../../services/drag.service'
import { EventService } from '../../services/event.service';
import { FolderService } from '../../services/folder.service';
import { AccountService } from '../../services/account.service';
import { CategoryService } from '../../services/category.service';
import { ProcedureService } from '../../services/procedure.service';
import { ThemeService } from '../../services/theme.service';
import { AlertService } from '../../services/alert.service';
import { ImageService } from '../../services/image.service';


import { TileBlocksDirective } from '../../components/widgets/tileblocks.directive';
//import { DragDropDirectiveModule} from "angular4-drag-drop";

//import { SlimScrollModule } from 'ng2-slimscroll';
//import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { FilterByTextPipe, OrderByPipe, ReversePipe } from '../../helpers/filters.pipe';
import { SafePipe } from '../../helpers/ili-security.pipe';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { DropTargetDirective } from '../../helpers/drop-target.directive';
import { OnlyNumbersDirective } from '../../helpers/only-numbers.directive';
import { DateTimePickerDirective } from '../../helpers/date-time-picker.directive';
import 'hammerjs';
import 'mousetrap';
import { GalleryModule } from '../../module/gallery.module';
import { NgSelectModule } from '../../ng-select';

@NgModule({
  imports: [
    CommonModule, MalihuScrollbarModule.forRoot(), FormsModule, HomeRoutingModule,
    ColorPickerModule, CKEditorModule, GalleryModule.forRoot(), NgSelectModule
  ],
  entryComponents: [TileBlocksComponents],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent,
    TilesListComponent, FilterByTextPipe, OrderByPipe, ReversePipe, TilesComponent, TileBlocksComponents, SafePipe,
    TileBlocksDirective, DateTimePickerDirective, DraggableDirective, DropTargetDirective, EventsComponent,
    FoldersComponent, AccountComponent, CategoriesComponent, ThemeComponent, ProceduresComponent, OnlyNumbersDirective,
    ProcessesComponent, PagesComponent, DemoComponent, NotificationsComponent, SmartComponent],
  providers: [HeaderService, TileService, CommonService, DragService, EventService,
    FolderService, AccountService, CategoryService, ProcedureService, ThemeService, ImageService]
})

export class HomeModule { }
