export const regionsPath = '/services/regions';
export const RegionsService = Symbol('RegionsService');
export interface RegionsServiceClient {
    regionsChanged(): Promise<void>;
}
export interface RegionAttributes {
    code: string;
    name: string;
}
export interface RegionsService {
    getAllRegions(): Promise<RegionAttributes[]>;
    addRegion(region: RegionAttributes): Promise<void>;
}
