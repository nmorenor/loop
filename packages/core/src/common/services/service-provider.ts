import { interfaces } from 'inversify';
export interface IServiceProvider {
    setContainer(container: interfaces.Container): void;
    getService<T>(identifier: interfaces.ServiceIdentifier<T>): T | undefined;
    getContribution<T extends object>(named: string | number | symbol): T | undefined;
    getContributions<T extends object>(named: string | number | symbol): T[];
}
