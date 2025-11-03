import { Component, OnInit } from '@angular/core';

export interface ProfessionalCard {
  id?: number;
  name?: string;
  title?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  coverImage?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-professional-card',
  templateUrl: './professional-card.component.html',
  styleUrls: ['./professional-card.component.scss']
})
export class ProfessionalCardComponent implements OnInit {
  public services: ProfessionalCard[] = [];
  public filteredServices: ProfessionalCard[] = [];
  public isDrawerOpen: boolean = false;
  public selectedCategory: string = 'any';
  public selectedRating: number | 'any' = 'any';
  public searchTerm: string = '';

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    // Load from JSON file
    fetch('/assets/data/users.json')
      .then(response => response.json())
      .then(data => {
        this.services = data;
        this.applyFilters();
      })
      .catch(error => console.error('Error loading users:', error));
  }

  openDrawer() {
    this.isDrawerOpen = true;
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onRatingChange(rating: string) {
    this.selectedRating = rating === 'any' ? 'any' : Number(rating);
    this.applyFilters();
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value || '';
    this.applyFilters();
  }

  private normalizeCategory(text?: string): string {
    if (!text) return '';
    return text.trim().toLowerCase().replace(/\s+/g, '-');
  }

  private applyFilters() {
    const normalizedSelected = this.normalizeCategory(this.selectedCategory);

    this.filteredServices = (this.services || []).filter((s) => {
      // Category match
      const serviceCat = this.normalizeCategory(s.category || s.title || '');
      const catOk =
        this.selectedCategory === 'any' ||
        normalizedSelected.length === 0 ||
        serviceCat.includes(normalizedSelected);

      // Rating match (minimum)
      const ratingOk =
        this.selectedRating === 'any' ||
        (typeof this.selectedRating === 'number' && (s.rating || 0) >= this.selectedRating);

      // Name search
      const q = this.searchTerm.trim().toLowerCase();
      const searchOk =
        q.length === 0 ||
        (s.name || s.title || '').toLowerCase().includes(q);

      return catOk && ratingOk && searchOk;
    });
  }
}

