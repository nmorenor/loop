import '../../src/browser/styles/index.css';
import 'font-awesome/css/font-awesome.min.css';

import { ContainerModule } from 'inversify';
import { FrontendApplication } from './frontend-application';

export const frontendApplicationModule = new ContainerModule(bind => {

    bind(FrontendApplication).toSelf().inSingletonScope().onActivation((ctx, app) => {
        app.container = ctx.container;
        return app;
    });
});
