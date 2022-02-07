import { JsonRpcServer } from '@loop/core/lib/common/messaging';
import { injectable } from 'inversify';
import { RegionAttributes, RegionsService, RegionsServiceClient } from '@loop/core/lib/common/services/regions';
import { RegionClientsManager, RegionRepository } from '../model/region-repository';
export interface RegionsServiceServer extends RegionsService, JsonRpcServer<RegionsServiceClient> {
}

@injectable()
export class RegionsServiceServerImpl implements RegionsServiceServer {
    protected client: RegionsServiceClient | undefined;
    regionClientsManager: RegionClientsManager;
    regionRepository: RegionRepository;
    dispose(): void {
        if (this.client && this.regionClientsManager) {
            this.regionClientsManager.removeClient(this.client);
        }
        this.client = undefined;
    }
    setClient(client: RegionsServiceClient | undefined): void {
        this.client = client;
        if (this.client && this.regionClientsManager) {
            this.regionClientsManager.addRegionClient(this.client);
        }
    }
    getAllRegions(): Promise<RegionAttributes[]> {
        if (this.regionRepository) {
            return this.regionRepository.getAllRegions();
        }
        return Promise.resolve([]);
    }

    async addRegion(region: RegionAttributes): Promise<void> {
        if (this.regionRepository) {
            await this.regionRepository.upsertRegion(region.name, region.code);
        }
    }

}
