import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Service {
	id: string;
	title: string;
	description: string;
	icon: string;
	route: string;
	category: string;
}

@Component({
	selector: 'app-services-landing',
	templateUrl: './services-landing.component.html',
	styleUrls: ['./services-landing.component.scss'],
})
export class ServicesLandingComponent implements OnInit {
	services: Service[] = [
		{
			id: 'farm-renewal',
			title: 'Farm Renewal Application',
			description:
				'Apply for renewal of your agricultural record and farm registration',
			icon: 'bi bi-tree',
			route: '/application/create',
			category: 'Agricultural Services',
		},
		{
			id: 'greenhouse',
			title: 'Greenhouse Permit',
			description:
				'Apply for permission to build or expand greenhouse facilities',
			icon: 'bi bi-house-check',
			route: '/services',
			category: 'Agricultural Services',
		},
		{
			id: 'water-rights',
			title: 'Water Rights Application',
			description: 'Apply for water usage rights for agricultural purposes',
			icon: 'bi bi-water',
			route: '/services',
			category: 'Water Resources',
		},
		{
			id: 'organic-cert',
			title: 'Organic Certification',
			description:
				'Apply for organic farming certification for your agricultural products',
			icon: 'bi bi-award',
			route: '/services',
			category: 'Certifications',
		},
		{
			id: 'export-permit',
			title: 'Export Permit',
			description:
				'Apply for permits to export agricultural products internationally',
			icon: 'bi bi-box-seam',
			route: '/services',
			category: 'Trade & Export',
		},
		{
			id: 'subsidy',
			title: 'Agricultural Subsidy',
			description: 'Apply for government subsidies for agricultural activities',
			icon: 'bi bi-cash-coin',
			route: '/services',
			category: 'Financial Support',
		},
	];

	filteredServices: Service[] = [];
	categories: string[] = [];
	selectedCategory: string = 'All';
	searchQuery: string = '';

	// Color palettes for card decorations
	private colorPalettes = [
		['#EAAB7F', '#F7CDB1'], // Sand/Beige
		['#8FB876', '#C4DDB0'], // Green
		['#7FAADC', '#B1CCF3'], // Blue
		['#E2AA76', '#F4D2B0'], // Amber
		['#BF8BBF', '#DDBBDD'], // Purple
	];

	constructor(private router: Router) {
		console.log('ServicesLandingComponent constructed');
	}

	ngOnInit(): void {
		console.log('ServicesLandingComponent initialized');

		// Initialize filteredServices immediately
		this.filteredServices = [...this.services];

		// Extract unique categories
		this.categories = [
			'All',
			...Array.from(new Set(this.services.map((service) => service.category))),
		];

		console.log('Services initialized:', this.filteredServices.length);
	}

	filterByCategory(category: string): void {
		this.selectedCategory = category;
		this.applyFilters();
	}

	applyFilters(): void {
		this.filteredServices = this.services.filter((service) => {
			// Apply category filter
			const categoryMatch =
				this.selectedCategory === 'All' ||
				service.category === this.selectedCategory;

			// Apply search filter
			const searchMatch =
				this.searchQuery === '' ||
				service.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				service.description
					.toLowerCase()
					.includes(this.searchQuery.toLowerCase());

			return categoryMatch && searchMatch;
		});
	}

	resetFilters(): void {
		this.searchQuery = '';
		this.selectedCategory = 'All';
		this.filteredServices = this.services;
	}

	navigateToService(route: string): void {
		console.log('Navigating to route:', route);
		try {
			this.router.navigate([route]);
		} catch (error) {
			console.error('Navigation error:', error);
		}
	}

	/**
	 * Returns a random background color for card decoration
	 */
	getRandomColor(serviceId: string): string {
		// Use the service ID to consistently get the same color for the same service
		const index =
			this.getNumberFromString(serviceId) % this.colorPalettes.length;
		const palette = this.colorPalettes[index];
		return palette[0]; // Use the main color
	}

	/**
	 * Returns a light background color for the service icon
	 */
	getIconBackground(serviceId: string): string {
		// Use the service ID to consistently get the same color for the same service
		const index =
			this.getNumberFromString(serviceId) % this.colorPalettes.length;
		const palette = this.colorPalettes[index];
		return palette[1]; // Use the lighter color
	}

	/**
	 * Convert a string to a number for consistent color selection
	 */
	private getNumberFromString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return Math.abs(hash);
	}
}
