import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  public title = null;
  constructor() {
  }

  ngOnInit() {
    this.title = "Domifa : faciliter la vie des CCAS";
  }

}
