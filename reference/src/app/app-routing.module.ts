import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
	},
	{
		path: 'home',
		loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
	},
	{ path: '**', redirectTo: '' },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			initialNavigation: 'enabledNonBlocking',
		}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
