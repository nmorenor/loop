import { ContainerModule } from 'inversify';
import { RegionsMonitor } from './services/regions-monitor';
import { ContinentModelContribution } from './model/region-model';
import { DataModelsManager, ModelServiceContribution, SequelizeModelContribution } from './data-models-manager';
import { bindContributionProvider, BackendApplicationContribution, ConnectionHandler, JsonRpcConnectionHandler } from '@loop/core/lib';
import { RegionsService, RegionsServiceClient, regionsPath } from '../common/services/regions';
import { RegionClientsManager, RegionRepository, RegionClientsManagerService, RegionRepositoryService } from './model/region-repository';
import { RegionsServiceServerImpl } from './services/regions-service';
import { GroupModelContribution, UserGroupRelationModelContribution, UserModelContribution } from './model/users-model';
import { UsersRepository } from './model/users-repository';
import { AuthServiceServerImpl, InstallServiceServerImpl, SystemStateServiceServerImpl } from './services/users-service';
import { authPath, AuthServiceClient, systemInstallPath, SystemStateClient, systemStatePath } from '../common/services/users';
import { PaymentsService } from './services/payments/payments-service';
import { StripePaymentEventHandlerContribution } from './services/payments/payments';
import { StripeCustomerSubscriptionHandler } from './services/payments/payment-customer-subscription-event-handler';
import { StripeCustomerChangeHandler } from './services/payments/payment-customer-event-handler';

export default new ContainerModule(bind => {
    bind(DataModelsManager).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toDynamicValue(ctx => ctx.container.get(DataModelsManager));

    bindContributionProvider(bind, SequelizeModelContribution);
    bindContributionProvider(bind, ModelServiceContribution);

    bind(ContinentModelContribution).toSelf();
    bind(UserModelContribution).toSelf();
    bind(GroupModelContribution).toSelf();
    bind(UserGroupRelationModelContribution).toSelf();
    bind(SequelizeModelContribution).toDynamicValue(ctx => ctx.container.get(ContinentModelContribution));
    bind(SequelizeModelContribution).toDynamicValue(ctx => ctx.container.get(UserModelContribution));
    bind(SequelizeModelContribution).toDynamicValue(ctx => ctx.container.get(GroupModelContribution));
    bind(SequelizeModelContribution).toDynamicValue(ctx => ctx.container.get(UserGroupRelationModelContribution));

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

    bind(UsersRepository).toSelf().inSingletonScope();
    bind(SystemStateServiceServerImpl).toSelf();
    bind(InstallServiceServerImpl).toSelf();
    bind(AuthServiceServerImpl).toSelf();

    bind(ConnectionHandler).toDynamicValue(({ container }) =>
        new JsonRpcConnectionHandler<SystemStateClient>(systemStatePath, client => {
            const server = container.get<SystemStateServiceServerImpl>(SystemStateServiceServerImpl);
            server.setClient(client);
            const closeDispose = client.onDidCloseConnection(() => {
                server.dispose();
                closeDispose.dispose();
            });
            return server;
        })
    ).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(({ container }) =>
        new JsonRpcConnectionHandler<SystemStateClient>(systemInstallPath, client => {
            const server = container.get<InstallServiceServerImpl>(InstallServiceServerImpl);
            server.setClient(client);
            const closeDispose = client.onDidCloseConnection(() => {
                server.dispose();
                closeDispose.dispose();
            });
            return server;
        })
    ).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(({ container }) =>
        new JsonRpcConnectionHandler<AuthServiceClient>(authPath, client => {
            const server = container.get<AuthServiceServerImpl>(AuthServiceServerImpl);
            server.setClient(client);
            const closeDispose = client.onDidCloseConnection(() => {
                server.dispose();
                closeDispose.dispose();
            });
            return server;
        })
    ).inSingletonScope();
    bind(PaymentsService).toSelf().inSingletonScope();

    bindContributionProvider(bind, StripePaymentEventHandlerContribution)

    bind(StripeCustomerSubscriptionHandler).toSelf().inSingletonScope();
    bind(StripeCustomerChangeHandler).toSelf().inSingletonScope();

    bind(StripePaymentEventHandlerContribution).toDynamicValue(ctx => ctx.container.get(StripeCustomerSubscriptionHandler));
    bind(StripePaymentEventHandlerContribution).toDynamicValue(ctx => ctx.container.get(StripeCustomerChangeHandler));
});
