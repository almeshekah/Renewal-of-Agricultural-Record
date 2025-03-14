import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	template: ` <router-outlet></router-outlet> `,
	styles: [],
})
export class HomeComponent {
	constructor(public router: Router) {}
}
