import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from './components/view/view.component';
import { CameraPreviewComponent } from './components/camera-preview/camera-preview.component';

const routes: Routes = [
   { path: '', redirectTo: '/view', pathMatch: 'full' },
   { path: 'view', component: ViewComponent },
   { path: 'camera-preview/:id', component: CameraPreviewComponent },
];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
   exports: [RouterModule],
})
export class AppRoutingModule {}
