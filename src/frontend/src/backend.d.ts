import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ImpactCounters {
    totalMealsSaved: bigint;
    cityBreakdown: Array<[string, bigint]>;
    co2Reduced: number;
    totalPeopleFed: bigint;
}
export interface FoodDonation {
    id: bigint;
    status: DonationStatus;
    latitude: number;
    city: string;
    neighborhood: string;
    donorName: string;
    unit: string;
    cookTime: Time;
    claimedBy?: bigint;
    longitude: number;
    timestamp: Time;
    quantity: number;
    storageCondition: StorageCondition;
    foodType: string;
}
export type Time = bigint;
export interface Volunteer {
    id: bigint;
    latitude: number;
    city: string;
    name: string;
    availability: string;
    longitude: number;
    rating: number;
}
export interface NGO {
    id: bigint;
    latitude: number;
    ratingCount: bigint;
    city: string;
    neighborhood: string;
    name: string;
    longitude: number;
    rating: number;
    capacity: bigint;
}
export interface UserProfile {
    city: string;
    neighborhood: string;
    name: string;
    entityType: EntityType;
}
export enum DonationStatus {
    pending = "pending",
    pickedUp = "pickedUp",
    rejected = "rejected",
    confirmed = "confirmed",
    accepted = "accepted"
}
export enum EntityType {
    ngo = "ngo",
    admin = "admin",
    hotel = "hotel",
    volunteer = "volunteer"
}
export enum StorageCondition {
    roomTemperature = "roomTemperature",
    refrigerated = "refrigerated",
    hotStorage = "hotStorage"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelClaim(donationId: bigint, volunteerId: bigint): Promise<void>;
    claimDonation(donationId: bigint, volunteerId: bigint): Promise<void>;
    createFoodDonation(donorName: string, foodType: string, quantity: number, unit: string, cookTime: Time, storageCondition: StorageCondition, city: string, neighborhood: string, latitude: number, longitude: number): Promise<bigint>;
    getAllDonations(): Promise<Array<FoodDonation>>;
    getAllNgosSortedByRating(): Promise<Array<NGO>>;
    getAllVolunteersSortedByName(): Promise<Array<Volunteer>>;
    getAvailableDonationsForVolunteers(): Promise<Array<FoodDonation>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFoodDonation(id: bigint): Promise<FoodDonation | null>;
    getImpactCounters(): Promise<ImpactCounters>;
    getMyNgoRating(ngoId: bigint): Promise<number | null>;
    getNgoRatingSummary(ngoId: bigint): Promise<[number, bigint]>;
    getNgosByCity(city: string): Promise<Array<NGO>>;
    getPendingDonationsSortedByTimestamp(): Promise<Array<FoodDonation>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfilesByEntityType(entityType: EntityType): Promise<Array<UserProfile>>;
    getVolunteersByCity(city: string): Promise<Array<Volunteer>>;
    isAdminCaller(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    rateNgo(ngoId: bigint, ratingValue: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateFoodDonationStatus(id: bigint, newStatus: DonationStatus): Promise<void>;
    updateImpactCounters(mealsSaved: bigint, peopleFed: bigint, co2: number, city: string, cityCount: bigint): Promise<void>;
}
