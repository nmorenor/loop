import { ContainerModule } from 'inversify';
import { HostsMonitor } from './services/hosts-monitor';
import { ContinentModelContribution } from './model/region-model';
import { DataModelsManager, ModelServiceContribution, SequelizeModelContribution } from './data-models-manager';
import { GeoIpService } from './services/geo-ip';
import { bindContributionProvider, BackendApplicationContribution } from '@loop/core/lib';

export default new ContainerModule(bind => {
    bind(DataModelsManager).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toDynamicValue(ctx => ctx.container.get(DataModelsManager));

    bindContributionProvider(bind, SequelizeModelContribution);
    bindContributionProvider(bind, ModelServiceContribution);

    bind(ContinentModelContribution).toSelf();
    bind(SequelizeModelContribution).toDynamicValue(ctx => ctx.container.get(ContinentModelContribution));

    bind(GeoIpService).toSelf().inSingletonScope();
    bind(HostsMonitor).toSelf();
    bind(ModelServiceContribution).toDynamicValue(ctx => ctx.container.get(HostsMonitor));
    bind(ModelServiceContribution).toDynamicValue(ctx => ctx.container.get(GeoIpService));
});
