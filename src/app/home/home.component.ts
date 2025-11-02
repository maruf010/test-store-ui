import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceCard } from '../service-card/service-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: ServiceCard[] = [];
  currentDesignType: 'type1' | 'type2' | 'type3' = 'type1';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    // Load from JSON file
    fetch('/assets/data/services.json')
      .then(response => response.json())
      .then(data => {
        this.services = data;
      })
      .catch(error => console.error('Error loading services:', error));
  }

  switchDesign(type: 'type1' | 'type2' | 'type3') {
    this.currentDesignType = type;
  }

  navigateToCalculator() {
    this.router.navigate(['/cost-calculator']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}

