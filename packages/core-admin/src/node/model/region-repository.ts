import { injectable, inject } from 'inversify';
import { RegionsServiceClient } from '../../common/services/regions';
import { Region } from './region-model';

export const RegionClientsManagerService = Symbol('RegionClientsManagerService');

@injectable()
export class RegionClientsManager {
    private regionClients: Set<RegionsServiceClient> = new Set<RegionsServiceClient>();
    addRegionClient(client: RegionsServiceClient): void {
        this.regionClients.add(client);
    }
    removeClient(client: RegionsServiceClient): void {
        this.regionClients.delete(client);
    }
    regionsChanged(): void {
        for (const nextClient of this.regionClients) {
            nextClient.regionsChanged();
        }
    }
}

export const RegionRepositoryService = Symbol('RegionRepository');

@injectable()
export class RegionRepository {
    @inject(RegionClientsManager)
    private regionClientsManager: RegionClientsManager;
    async upsertRegion(name: string, code: string): Promise<Region | null> {
        await Region.upsert({
            name,
            code
        });
        const region = await this.getRegion(code);
        if (region) {
            this.regionClientsManager.regionsChanged();
        }
        return region;
    }
    async getRegion(code: string): Promise<Region | null> {
        return Region.findOne({
            where: {
                code: code
            }
        });
    }
    async getAllRegions(): Promise<Region[]> {
        return Region.findAll();
    }
}
