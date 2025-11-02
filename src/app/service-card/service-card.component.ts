import { Component, Input } from '@angular/core';

export interface ServiceCard {
  id: number;
  title: string;
  category: string;
  rating: number;
  image: string;
  joinedDate: string;
  location: string;
  schedule: string;
  price: number;
  priceUnit: string;
}

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() card!: ServiceCard;
  @Input() designType: 'type1' | 'type2' | 'type3' = 'type1';
}
