import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tiles-list',
  templateUrl: './tiles-list.component.html',
  styleUrls: ['./tiles-list.component.css']
})

export class TilesListComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

@Component({
  selector: 'tiles',
  template: `<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet" />
             <link rel="stylesheet" type="text/css" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" />
             <link rel="stylesheet" href="assets/css/ti_icons.css">
             <div class="page_block tiles_list_single"> 
             <img class="tile_list_art tile-content-img" [src]="'http://ili.ms/img/orgs/546c35cb41278ffc2f000093/Connection_-_1.jpg' | safe">
             <div class="tile_list_title tile-content-title">Widget 6 - connection card ADFASF ASFASF AFAFAF</div>
             <div class="tile_icons">
             <span title="" style="display:block;" class="step weight"></span>
             <span style="display: block;" title="" class="step smart smarticon report-rule-tile"> <i class="icon ion-heart"></i> </span>
             <span style="display: block;" title="" class="step smart smarticon smarticon-tile"> <i class="icon ion-medkit"></i> </span>
             <span title="" style="display:block;" class="step smart smarticon smarticon-tile"> <i class="icon ion-lightbulb"></i> </span>
             <span title="" class="step smart noteicon smarticon-tile"  style="display: block;" aria-hidden="true"><i class="icon ion-android-notifications-none"></i></span>
             <span title="" style="display: block;" class="step smart smarticon smarticon-tile"> <i class="icon ion-android-person"></i> </span>
             </div>
             </div>`,
  styleUrls: ['./tiles-list.component.css'],
  encapsulation: ViewEncapsulation.None, 
})

export class TilesComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
