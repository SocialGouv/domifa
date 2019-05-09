import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from './modules/home/home.component';
import { UsagersFormComponent } from './modules/usagers/components/form/usagers-form';
import { ManageUsagersComponent } from './modules/usagers/components/manage/manage.component';
import { UsagersProfilComponent } from './modules/usagers/components/profil/profil-component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'nouveau', component: UsagersFormComponent },
  { path: 'profil/:id/edit', component: UsagersFormComponent },
  { path: 'profil/:id', component: UsagersProfilComponent },
  { path: 'manage', component: ManageUsagersComponent }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}
