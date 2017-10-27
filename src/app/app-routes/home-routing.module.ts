import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '../components/home/home.component';
import { WidgetsComponent } from '../components/widgets/widgets.component';
import { EventsComponent } from '../components/events/events.component';


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