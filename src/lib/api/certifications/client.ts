import { BaseApiClient } from '../base-client';
import type { ApiResponse } from '../types';

export interface Certification {
	id: string;
	name: string;
	issuer: string;
	issueDate: string;
	expiryDate?: string;
	credentialUrl?: string;
	credentialId?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Certifications API Client
 */
class CertificationsApiClient extends BaseApiClient {
	constructor() {
		super('/certifications');
	}

	async createCertification(data: Partial<Certification>): Promise<Certification> {
		return this.create<Certification>(data);
	}

	async listCertifications(page = 1, limit = 10) {
		return this.list<Certification>(page, limit);
	}

	async getCertification(id: string): Promise<Certification> {
		return this.getById<Certification>(id);
	}

	async updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
		return this.update<Certification>(id, data);
	}

	async deleteCertification(id: string): Promise<void> {
		return this.delete(id);
	}
}

export const certificationsClient = new CertificationsApiClient();
