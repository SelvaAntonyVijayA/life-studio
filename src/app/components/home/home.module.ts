import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from '../../components/home/home.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { HomeRoutingModule } from './home-routing.module';
import { HeaderComponent } from '../../components/header/header.component';
import { TilesListComponent } from '../../components/tiles-list/tiles-list.component';
import { TileBlocksComponents } from '../../components/widgets/tileblocks.components';
import { HeaderService } from '../../services/header.service';

import { InquiryBlockComponent } from '../../components/widgets/tileblocks.components';
import { NotesBlockComponent } from '../../components/widgets/tileblocks.components';

import { TileBlocksDirective }          from '../../components/widgets/tileblocks.directive';

@NgModule({
  imports: [
    CommonModule, FormsModule, HomeRoutingModule
  ],
  entryComponents: [InquiryBlockComponent, NotesBlockComponent],
  declarations: [HomeComponent, HeaderComponent, WidgetsComponent, TilesListComponent, TileBlocksComponents, TileBlocksDirective],
  providers: [HeaderService]
})

export class HomeModule { }
