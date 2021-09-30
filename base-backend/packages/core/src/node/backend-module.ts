import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../common/contribution-provider';
import { CliContribution, CliManager } from './cli';
import { ApplicationPackage } from '@theia/application-package';
import { ApplicationConfigProvider, BackendApplication, BackendApplicationCliContribution, BackendApplicationContribution } from './backend-application';
export const backendApplicationModule = new ContainerModule(bind => {
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
});
