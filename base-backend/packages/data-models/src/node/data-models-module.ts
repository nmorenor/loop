import { ContainerModule } from 'inversify';
import { RegionsMonitor } from './services/regions-monitor';
import { ContinentModelContribution } from './model/region-model';
import { DataModelsManager, ModelServiceContribution, SequelizeModelContribution } from './data-models-manager';
import { bindContributionProvider, BackendApplicationContribution, ConnectionHandler, JsonRpcConnectionHandler } from '@loop/core/lib';
import { RegionsService, RegionsServiceClient, regionsPath } from '@loop/core/lib/common/services/regions';
import { RegionClientsManager, RegionRepository, RegionClientsManagerService, RegionRepositoryService } from './model/region-repository';
import { RegionsServiceServerImpl } from './services/regions-service';

export default new ContainerModule(bind => {
    bind(DataModelsManager).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toDynamicValue(ctx => ctx.container.get(DataModelsManager));

    bindContributionProvider(bind, SequelizeModelContribution);
    bindContributionProvider(bind, ModelServiceContribution);

    bind(ContinentModelContribution).toSelf();
    bind(SequelizeModelContribution).toDynamicValue(ctx => ctx.container.get(ContinentModelContribution));

    bind(RegionsMonitor).toSelf().inSingletonScope();
    bind(ModelServiceContribution).toDynamicValue(ctx => ctx.container.get(RegionsMonitor));

    bind(RegionRepository).toSelf().inSingletonScope().onActivation((context, target) => {
        context.container.bind(RegionRepositoryService).toConstantValue(target);
        return target;
    });
    bind(RegionClientsManager).toSelf().inSingletonScope().onActivation((context, target) => {
        context.container.bind(RegionClientsManagerService).toConstantValue(target);
        return target;
    });

    bind(RegionsServiceServerImpl).toSelf();
    bind(RegionsService).to(RegionsServiceServerImpl);
    bind(ConnectionHandler).toDynamicValue(context =>
        new JsonRpcConnectionHandler<RegionsServiceClient>(regionsPath, client => {
            const server = context.container.get<RegionsServiceServerImpl>(RegionsServiceServerImpl);
            server.regionRepository = context.container.get<RegionRepository>(RegionRepositoryService);
            server.regionClientsManager = context.container.get<RegionClientsManager>(RegionClientsManagerService);
            server.setClient(client);
            const closeDispose = client.onDidCloseConnection(() => {
                server.dispose();
                closeDispose.dispose();
            });
            return server;
        })
    ).inSingletonScope();
});
