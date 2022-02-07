import '../../src/browser/styles/index.css';
import 'font-awesome/css/font-awesome.min.css';

import { ContainerModule, interfaces } from 'inversify';
import { DefaultFrontendApplicationContribution, FrontendApplication, FrontendApplicationContribution } from './frontend-application';
import { MessageClient, messageServicePath } from '../common/message-service-protocol';
import { bindContributionProvider, MessageService, MessageServiceFactory } from '../common';
import { RegionsClient } from './services/region-service';
import { WebSocketConnectionProvider } from './messaging';
import { ConnectionStatusService, FrontendConnectionStatusService, PingService } from './connection-status-service';
import { EnvVariable, envVariablesPath, EnvVariablesServer } from '../common/env-variables';
import { RoutesApplicationContribution } from '../common/routes/routes';
import { FrontEndRoutesProvider } from './routes-provider';
import { HeroesPageContribution } from './pages/heroes/contribution';

export function bindMessageService(bind: interfaces.Bind): interfaces.BindingWhenOnSyntax<MessageService> {
    bind(MessageClient).toSelf().inSingletonScope();
    bind(MessageServiceFactory).toFactory(({ container }) => () => container.get(MessageService));
    return bind(MessageService).toSelf().inSingletonScope();
}

export const frontendApplicationModule = new ContainerModule(bind => {

    bind(FrontendApplication).toSelf().inSingletonScope().onActivation((ctx, app) => {
        app.container = ctx.container;
        return app;
    });
    bind(DefaultFrontendApplicationContribution).toSelf();
    bindContributionProvider(bind, FrontendApplicationContribution);

    bind(FrontendConnectionStatusService).toSelf().inSingletonScope();
    bind(ConnectionStatusService).toService(FrontendConnectionStatusService);
    bind(FrontendApplicationContribution).toService(FrontendConnectionStatusService);

    bindMessageService(bind).onActivation(({ container }, messages) => {
        const client = container.get(MessageClient);
        WebSocketConnectionProvider.createProxy(container, messageServicePath, client);
        return messages;
    });
    bind(RegionsClient).toSelf().inSingletonScope();

    bind(EnvVariablesServer).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<EnvVariablesServer>(envVariablesPath);
    }).inSingletonScope();
    bind(PingService).toDynamicValue(ctx => {
        // let's reuse a simple and cheap service from this package
        const envServer: EnvVariablesServer = ctx.container.get(EnvVariablesServer);
        return {
            ping(): Promise<EnvVariable | undefined> {
                return envServer.getValue('does_not_matter');
            }
        };
    });
    bindContributionProvider(bind, RoutesApplicationContribution);
    bind(FrontEndRoutesProvider).toSelf().inSingletonScope();

    bind(HeroesPageContribution).toSelf();
    bind(RoutesApplicationContribution).toService(HeroesPageContribution);
});
