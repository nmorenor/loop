import '../../src/browser/styles/index.css';
import 'font-awesome/css/font-awesome.min.css';

import { ContainerModule, interfaces } from 'inversify';
import { FrontendApplication } from './frontend-application';
import { MessageClient } from '../common/message-service-protocol';
import { MessageService, MessageServiceFactory } from '../common';
import { RegionsClient } from './services/region-service';

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
    bindMessageService(bind);
    bind(RegionsClient).toSelf().inSingletonScope();
});
