import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from '../../components/home/home.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { HomeRoutingModule } from '../../app-routes/home-routing.module';
import { HeaderComponent } from '../../components/header/header.component';
import { TilesListComponent } from '../../components/tiles-list/tiles-list.component';
import { TileBlocksComponents } from '../../components/widgets/tileblocks.components';
import { HeaderService } from '../../services/header.service';

import { TileBlocksDirective } from '../../components/widgets/tileblocks.directive';
import { DyBindDirective } from '../../components/widgets/dynamic-bind.directive';

import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';
import { SlimScrollModule } from 'ng2-slimscroll';

@NgModule({
  imports: [
    CommonModule, FormsModule, HomeRoutingModule, SlimScrollModule
  ],
  entryComponents: [TileBlocksComponents],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent,
    TilesListComponent, TileBlocksComponents,
    TileBlocksDirective, DyBindDirective, Ng2Summernote],
  providers: [HeaderService]
})

export class HomeModule { }
