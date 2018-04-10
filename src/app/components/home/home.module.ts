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
import { ImagelibraryComponent } from '../../components/imagelibrary/imagelibrary.component';
import { OrganizationsComponent } from '../../components/organizations/organizations.component';
import { StudiousersComponent } from '../../components/studiousers/studiousers.component';
import { MenuBackgroundComponent } from '../../components/menu-background/menu-background.component';
import { SettingsComponent } from '../../components/settings/settings.component';
import { AppgridComponent } from '../../components/organizations/appgrid.component';
import { EnginesComponent } from '../../components/organizations/engines.component';
import { IntegrationComponent } from '../../components/organizations/integration.component';
import { LocationComponent } from '../../components/organizations/location.component';
import { IntegrationwidgetsComponent } from '../../components/organizations/integrationwidgets.component';
import { StreamComponent } from '../../components/organizations/stream.component';
import { LanguageComponent } from '../../components/organizations/language.component';
import { UserprofileComponent } from '../../components/userprofile/userprofile.component';
import { ProfilebuilderComponent } from '../../components/profilebuilder/profilebuilder.component';

import { AuthandsecurityComponent } from '../../components/authandsecurity/authandsecurity.component';

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
import { OrganizationsService } from '../../services/organizations.service';
import { AppsService } from '../../services/apps.service';
import { LivestreamService } from '../../services/livestream.service';
import { LanguageService } from '../../services/language.service';
import { TileBlocksDirective } from '../../components/widgets/tileblocks.directive';
//import { DragDropDirectiveModule} from "angular4-drag-drop";

//import { SlimScrollModule } from 'ng2-slimscroll';
//import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { FilterByTextPipe, OrderByPipe, ReversePipe } from '../../helpers/filters.pipe';
import { SafePipe, SafeHtmlPipe } from '../../helpers/ili-security.pipe';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { DraggableDirective } from '../../helpers/draggable.directive';
import { DropTargetDirective } from '../../helpers/drop-target.directive';
import { OnlyNumbersDirective } from '../../helpers/only-numbers.directive';
import { DateTimePickerDirective } from '../../helpers/date-time-picker.directive';
import 'hammerjs';
import 'mousetrap';
//import { GalleryModule } from '../../module/gallery.module';
import { NgSelectModule } from '../../ng-select';
import { ModalModule } from 'ngx-bootstrap';
import { ProgressHttpModule, HTTP_FACTORY } from 'angular-progress-http';
import { MatIconModule } from '@angular/material/icon';
import { jqxGridComponent } from '../../grid/jqwidgets-ts/angular_jqxgrid';
import { jqxWindowComponent } from '../../grid/jqwidgets-ts/angular_jqxwindow';
import { jqxExpanderComponent } from '../../grid/jqwidgets-ts/angular_jqxexpander';
import { jqxTooltipComponent } from '../../grid/jqwidgets-ts/angular_jqxtooltip';
import { jqxButtonComponent } from '../../grid/jqwidgets-ts/angular_jqxbuttons';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GeoValidator } from '../../helpers/geo.validator';

@NgModule({
  imports: [
    CommonModule, MalihuScrollbarModule.forRoot(), FormsModule, HomeRoutingModule,
    ColorPickerModule, CKEditorModule, NgSelectModule, MatIconModule, MatToolbarModule, ProgressHttpModule, ModalModule.forRoot()
  ],
  entryComponents: [TileBlocksComponents],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent,
    TilesListComponent, FilterByTextPipe, OrderByPipe, ReversePipe, TilesComponent, TileBlocksComponents, SafePipe, SafeHtmlPipe,
    TileBlocksDirective, DateTimePickerDirective, DraggableDirective, DropTargetDirective, EventsComponent,
    FoldersComponent, AccountComponent, CategoriesComponent, ThemeComponent, ProceduresComponent, OnlyNumbersDirective,
    ProcessesComponent, PagesComponent, DemoComponent, NotificationsComponent, SmartComponent, ImagelibraryComponent,
    OrganizationsComponent, StudiousersComponent, MenuBackgroundComponent, SettingsComponent, UserprofileComponent,
    ProfilebuilderComponent, AuthandsecurityComponent, jqxGridComponent, jqxWindowComponent, jqxExpanderComponent, jqxTooltipComponent,
    jqxButtonComponent, AppgridComponent, EnginesComponent, IntegrationComponent, LocationComponent, IntegrationwidgetsComponent, StreamComponent, LanguageComponent, GeoValidator],
  providers: [HeaderService, TileService, CommonService, DragService, EventService,
    FolderService, AccountService, CategoryService, ProcedureService, ThemeService, ImageService, OrganizationsService, AppsService, LivestreamService, LanguageService]
})

export class HomeModule { }
