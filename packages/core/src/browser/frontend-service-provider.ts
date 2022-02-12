import { injectable, interfaces } from 'inversify';
import { ContributionProvider } from '../common';
import { IServiceProvider } from '../common/services/service-provider';

@injectable()
export class FrontEndServiceProvider implements IServiceProvider {
    private container: interfaces.Container | undefined = undefined;
    setContainer(container: interfaces.Container): void {
        this.container = container;
    }
    getService<T>(identifier: interfaces.ServiceIdentifier<T>): T | undefined {
        if (this.container) {
            return this.container.get<T>(identifier);
        }
    }
    getContribution<T extends object>(named: string | number | symbol): T | undefined {
        if (this.container) {
            const contributions = this.container.getNamed<ContributionProvider<T>>(ContributionProvider, named);
            if (contributions && contributions.getContributions() && contributions.getContributions().length > 0 && contributions.getContributions()[0] !== undefined) {
                return contributions.getContributions()[0];
            }
        }
    }
    getContributions<T extends object>(named: string | number | symbol): T[] {
        if (this.container) {
            const contributions = this.container.getNamed<ContributionProvider<T>>(ContributionProvider, named);
            if (contributions && contributions.getContributions() && contributions.getContributions().length > 0 && contributions.getContributions()[0] !== undefined) {
                return contributions.getContributions();
            }
        }
        return [];
    }
}
