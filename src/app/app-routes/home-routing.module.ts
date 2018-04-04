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
import { ProcessesComponent } from '../components/processes/processes.component';
import { PagesComponent } from '../components/pages/pages.component';
import { DemoComponent } from '../components/demo/demo.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { SmartComponent } from '../components/smart/smart.component';
import { ImagelibraryComponent } from '../components/imagelibrary/imagelibrary.component';
import { OrganizationsComponent } from '../components/organizations/organizations.component';
import { StudiousersComponent } from '../components/studiousers/studiousers.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { UserprofileComponent } from '../components/userprofile/userprofile.component';

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
      },
      {
        path: 'processes',
        component: ProcessesComponent
      },
      {
        path: 'pages',
        component: PagesComponent
      },
      {
        path: 'notifications',
        component: NotificationsComponent
      },
      {
        path: 'smart',
        component: SmartComponent
      },
      {
        path: 'demo',
        component: DemoComponent
      },
      {
        path: 'organizations',
        component: OrganizationsComponent
      },
      {
        path: 'studiousers',
        component: StudiousersComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'userprofile',
        component: UserprofileComponent
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