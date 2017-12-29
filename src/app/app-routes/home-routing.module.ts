import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '../components/home/home.component';
import { WidgetsComponent } from '../components/widgets/widgets.component';
import { EventsComponent } from '../components/events/events.component';
import { AccountComponent } from '../components/account/account.component';
import { FoldersComponent } from '../components/folders/folders.component';
import { CategoriesComponent } from '../components/categories/categories.component';
import { ThemeComponent } from '../components/theme/theme.component';
import { ProceduresComponent } from '../components/procedures/procedures.component';

const homeRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'widgets',
        component: WidgetsComponent,
      },
      {
        path: 'events',
        component: EventsComponent,
      },
      {
        path: 'folders',
        component: FoldersComponent
      },
      {
        path: 'account',
        component: AccountComponent
      },
      {
        path: 'categories',
        component: CategoriesComponent
      },
      {
        path: 'theme',
        component: ThemeComponent
      },
      {
        path: 'procedures',
        component: ProceduresComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(homeRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class HomeRoutingModule { }