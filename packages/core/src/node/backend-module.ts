import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../common/contribution-provider';
import { CliContribution, CliManager } from './cli';
import { ApplicationPackage } from '@theia/application-package';
import { ApplicationConfigProvider, BackendApplication, BackendApplicationCliContribution, BackendApplicationContribution } from './backend-application';
import { ConnectionContainerModule } from './messaging/connection-container-module';
import { ConnectionHandler, JsonRpcConnectionHandler, MessageClient, MessageService, messageServicePath } from '../common';
import { WsRequestValidator, WsRequestValidatorContribution } from './ws-request-validators';
import { AuthenticatedWsRequestValidatorContribution } from './messaging/authenticated-messaging-contribution';
import { envVariablesPath, EnvVariablesServer } from '../common/env-variables';
import { EnvVariablesServerImpl } from './env-variables';

const messageConnectionModule = ConnectionContainerModule.create(({ bind, bindFrontendService }) => {
    bindFrontendService(messageServicePath, MessageClient);
    bind(MessageService).toSelf().inSingletonScope();
});

export const backendApplicationModule = new ContainerModule(bind => {
    bind(ConnectionContainerModule).toConstantValue(messageConnectionModule);
    bind(CliManager).toSelf().inSingletonScope();
    bindContributionProvider(bind, CliContribution);

    bind(BackendApplicationCliContribution).toSelf().inSingletonScope();
    bind(CliContribution).toService(BackendApplicationCliContribution);

    bind(BackendApplication).toSelf().inSingletonScope();
    bindContributionProvider(bind, BackendApplicationContribution);

    bind(ApplicationConfigProvider).toSelf().inSingletonScope();
    bind(ApplicationPackage).toDynamicValue(({ container }) => {
        const { projectPath } = container.get(BackendApplicationCliContribution);
        return new ApplicationPackage({ projectPath });
    }).inSingletonScope();
    bind(WsRequestValidator).toSelf().inSingletonScope();
    bindContributionProvider(bind, WsRequestValidatorContribution);
    bind(AuthenticatedWsRequestValidatorContribution).toSelf().inSingletonScope();
    bind(WsRequestValidatorContribution).toService(AuthenticatedWsRequestValidatorContribution);

    bind(EnvVariablesServer).to(EnvVariablesServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(envVariablesPath, () => {
            const envVariablesServer = ctx.container.get<EnvVariablesServer>(EnvVariablesServer);
            return envVariablesServer;
        })
    ).inSingletonScope();
});
