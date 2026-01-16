/**
 * Auth API types and interfaces
 */

export interface User {
	id: string;
	email: string;
	username: string;
	firstName?: string;
	lastName?: string;
	profilePicture?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Profile {
	id: string;
	userId: string;
	bio?: string;
	avatar?: string;
	location?: string;
	website?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken?: string;
	user: User;
	expiresIn?: number;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	username: string;
	firstName?: string;
	lastName?: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export interface LogoutRequest {
	refreshToken?: string;
}

export interface ChangePasswordRequest {
	oldPassword: string;
	newPassword: string;
}

export interface ProfileUpdateRequest {
	firstName?: string;
	lastName?: string;
	bio?: string;
	avatar?: string;
	location?: string;
	website?: string;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}
