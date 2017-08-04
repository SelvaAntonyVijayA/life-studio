import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { HomeComponent } from '../../components/home/home.component';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { HomeRoutingModule } from './home-routing.module';
import { HeaderComponent } from '../../components/header/header.component';
import { TilesListComponent } from '../../components/tiles-list/tiles-list.component';
import { HeaderService } from '../../services/header.service';

@NgModule({
    imports: [
        CommonModule, FormsModule, HomeRoutingModule
    ],
    declarations: [HomeComponent, HeaderComponent, WidgetsComponent, TilesListComponent],
    providers: [HeaderService]
})

export class HomeModule { }
