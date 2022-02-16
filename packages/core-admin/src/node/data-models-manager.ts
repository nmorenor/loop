import { ContributionProvider, LoopContainer, ApplicationConfigProvider, BackendApplicationContribution } from '@loop/core/lib';
import { injectable, interfaces, inject, LazyServiceIdentifer, named } from 'inversify';
import { Sequelize } from 'sequelize';
import { RegionClientsManager, RegionRepository } from './model/region-repository';

export const LoopSequelize = Symbol('LoopSequelize');
export const SequelizeModelContribution = Symbol('SequelizeModelContribution');
export interface SequelizeModelContribution {
    initialize(sequelize: Sequelize): void;
    configure(sequelize: Sequelize): void;
}

export const ModelServiceContribution = Symbol('ModelServiceContribution');
export interface ModelServiceContribution {
    start(): Promise<void>;
    stop(): void;
}

/**
 * 1. Connects to DB
 * 2. Initialize Squelize backend data models
 * 3. Initialize Model Services
 * 4. Dispose DB connection
 */
@injectable()
export class DataModelsManager implements BackendApplicationContribution {
    private initialized: boolean = false;
    private sequelize: Sequelize;
    constructor(
        @inject(new LazyServiceIdentifer(() => LoopContainer))
        protected container: interfaces.Container,
        @inject(ContributionProvider) @named(SequelizeModelContribution)
        protected readonly modelContributionsProvider: ContributionProvider<SequelizeModelContribution>,
        @inject(ContributionProvider) @named(ModelServiceContribution)
        protected readonly modelServiceContributionsProvider: ContributionProvider<ModelServiceContribution>,
        @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider,
        @inject(RegionRepository) protected readonly regionRepository: RegionRepository,
        @inject(RegionClientsManager) protected readonly regionClients: RegionClientsManager
    ) {
        // validate db config
        if (!this.appConfig
            || !this.appConfig.config
            || !this.appConfig.config.database
            || !this.appConfig.config.database.schema
            || !this.appConfig.config.database.host
            || !this.appConfig.config.database.port
            || !this.appConfig.config.database.user
        ) {
            throw new Error('Invalid DB configuration');
        }
        const config = this.appConfig.config.database;
        this.sequelize = new Sequelize(config.schema, config.user, config.password,
            {
                dialect: 'mysql',
                host: config.host,
                port: config.port,
                define: {
                    freezeTableName: true
                }
            }
        );
    }
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        await this.sequelize.authenticate();
        this.container.bind(LoopSequelize).toConstantValue(this.sequelize);
        console.log('Database connection has been established successfully.');

        this.modelContributionsProvider.getContributions().forEach((next: SequelizeModelContribution) => {
            next.initialize(this.sequelize);
        });
        this.modelContributionsProvider.getContributions().forEach((next: SequelizeModelContribution) => {
            next.configure(this.sequelize);
        });
        this.modelServiceContributionsProvider.getContributions().forEach(async (next: ModelServiceContribution) => {
            await next.start();
        });
    }

    /**
     * called when process is terminated
     */
    public stop(): void {
        this.modelServiceContributionsProvider.getContributions().forEach((next: ModelServiceContribution) => {
            next.stop();
        });
        this.sequelize.close();
    }
}
