import { BaseApiClient } from '../base-client';
import type { Testimonial } from '../types';

/**
 * Testimonials API Client
 */
class TestimonialsApiClient extends BaseApiClient {
	constructor() {
		super('/testimonials');
	}

	async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
		return this.create<Testimonial>(data);
	}

	async listTestimonials(page = 1, limit = 10) {
		return this.list<Testimonial>(page, limit);
	}

	async getTestimonial(id: string): Promise<Testimonial> {
		return this.getById<Testimonial>(id);
	}

	async updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
		return this.update<Testimonial>(id, data);
	}

	async deleteTestimonial(id: string): Promise<void> {
		return this.delete(id);
	}

	async listPublicTestimonials(page = 1, limit = 10) {
		const response = await this.client.get('/public', {
			params: { page, limit }
		});
		return response.data;
	}
}

export const testimonialsClient = new TestimonialsApiClient();
