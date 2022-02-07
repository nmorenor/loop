import { injectable, inject, named } from 'inversify';
import { ContributionProvider, notEmpty } from '../common';
import { RouteContribution, RoutesApplicationContribution, RoutesProvider } from '../common/routes/routes';

@injectable()
export class FrontEndRoutesProvider implements RoutesProvider {
    @inject(ContributionProvider) @named(RoutesApplicationContribution)
    protected readonly contributions: ContributionProvider<RoutesApplicationContribution>;
    getRoutes(): RouteContribution[] {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return [];
        }
        return this.contributions.getContributions().filter(notEmpty).map(next => next.getRoute());
    }
}
