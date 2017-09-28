import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from '../../components/home/home.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { HomeRoutingModule } from '../../app-routes/home-routing.module';
import { HeaderComponent } from '../../components/header/header.component';
import { TilesListComponent, TilesComponent } from '../../components/tiles-list/tiles-list.component';
import { TileBlocksComponents, SafePipe } from '../../components/widgets/tileblocks.components';
import { HeaderService } from '../../services/header.service';
import { TileService } from '../../services/tile.service';

import { TileBlocksDirective } from '../../components/widgets/tileblocks.directive';
import { DyBindDirective } from '../../components/widgets/dynamic-bind.directive';

import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';
import { SlimScrollModule } from 'ng2-slimscroll';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

@NgModule({
  imports: [
    CommonModule, FormsModule, HomeRoutingModule, SlimScrollModule, VirtualScrollModule
  ],
  entryComponents: [TileBlocksComponents],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent,
    TilesListComponent, TilesComponent, TileBlocksComponents, SafePipe,
    TileBlocksDirective, DyBindDirective, Ng2Summernote],
    providers: [HeaderService, TileService]
})

export class HomeModule { }
