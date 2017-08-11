import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from '../components/home/home.component';
import { WidgetsComponent } from '../components/widgets/widgets.component';
import { HomeRoutingModule } from '../components/home/home-routing.module';
import { HeaderComponent } from '../components/header/header.component';
import { TilesListComponent } from '../components/tiles-list/tiles-list.component';
import { TileBlocksComponents } from '../components/widgets/tileblocks.components';
import { HeaderService } from '../services/header.service';

import { TileBlocksDirective } from '../components/widgets/tileblocks.directive';

@NgModule({
  imports: [
    CommonModule, FormsModule, HomeRoutingModule
  ],
  entryComponents: [TileBlocksComponents],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent, TilesListComponent, TileBlocksComponents, TileBlocksDirective],
  providers: [HeaderService]
})

export class HomeModule { }
