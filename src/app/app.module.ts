import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { CostCalculatorComponent } from './cost-calculator/cost-calculator.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfessionalCardComponent } from './professional-card/professional-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CostCalculatorComponent,
    ProfileComponent,
    ProfessionalCardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

