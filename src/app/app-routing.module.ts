import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CostCalculatorComponent } from './cost-calculator/cost-calculator.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfessionalCardComponent } from './professional-card/professional-card.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cost-calculator', component: CostCalculatorComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'professionals', component: ProfessionalCardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

