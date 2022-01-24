import { injectable, inject, named, postConstruct } from 'inversify';
import express from 'express';
import * as http from 'http';
import * as yargs from 'yargs';
import { AddressInfo } from 'net';
import * as path from 'path';
import * as fs from 'fs-extra';
import { parse } from 'comment-json';
import { MaybePromise } from '../common/types';
import { CliContribution } from './cli';
import { ContributionProvider } from '../common/contribution-provider';
import { Deferred } from '../common/promise-util';

export interface ApplicationConfig {
    database: DatabaseConfig;
}

export interface DatabaseConfig {
    port: number;
    host: string;
    user: string;
    password: string;
    schema: string;
}

export const BackendApplicationContribution = Symbol('BackendApplicationContribution');
export interface BackendApplicationContribution {
    initialize?(): void;
    configure?(app: express.Application): void;
    onStart?(server: http.Server): MaybePromise<void>;

    /**
     * Called when the backend application shuts down. Contributions must perform only synchronous operations.
     * Any kind of additional asynchronous work queued in the event loop will be ignored and abandoned.
     */
    onStop?(app?: express.Application): void;
}

const defaultPort = 3000;
const defaultHost = 'localhost';
const defaultConfig = 'app-config.json';

const appProjectPath = 'app-project-path';

@injectable()
export class BackendApplicationCliContribution implements CliContribution {

    port: number;
    hostname: string | undefined;
    appConfig: string | undefined;
    projectPath: string;

    configure(conf: yargs.Argv): void {
        conf.option('port', { alias: 'p', description: 'The port the backend server listens on.', type: 'number', default: defaultPort });
        conf.option('hostname', { alias: 'h', description: 'The allowed hostname for connections.', type: 'string', default: defaultHost });
        conf.option('config', { alias: 'cfg', description: 'The json config for the application.', type: 'string', default: defaultConfig });
        conf.option(appProjectPath, { description: 'Sets the application project directory', default: this.appProjectPath() });
    }

    setArguments(args: yargs.Arguments): void {
        this.port = args.port;
        this.hostname = args.hostname;
        this.appConfig = args.config;
        this.projectPath = args[appProjectPath];
    }

    protected appProjectPath(): string {
        return process.cwd();
    }
}

@injectable()
export class ApplicationConfigProvider {
    public config: ApplicationConfig;
    constructor(@inject(BackendApplicationCliContribution) protected readonly cliParams: BackendApplicationCliContribution) {
        if (!this.cliParams.appConfig || !fs.pathExistsSync(this.cliParams.appConfig)) {
            throw new Error('Invalid App configuration');
        }
        this.config = parse(fs.readFileSync(this.cliParams.appConfig).toString());
    }
}

@injectable()
export class BackendApplication {

    protected readonly app: express.Application = express();

    constructor(
        @inject(ContributionProvider) @named(BackendApplicationContribution)
        protected readonly contributionsProvider: ContributionProvider<BackendApplicationContribution>,
        @inject(BackendApplicationCliContribution) protected readonly cliParams: BackendApplicationCliContribution,
    ) {
        process.on('uncaughtException', error => {
            if (error) {
                console.error('Uncaught Exception: ', error.toString());
                if (error.stack) {
                    console.error(error.stack);
                }
            }
        });
        // Handles normal process termination.
        process.on('exit', () => this.onStop());
        // Handles `Ctrl+C`.
        process.on('SIGINT', () => process.exit(0));
        // Handles `kill pid`.
        process.on('SIGTERM', () => process.exit(0));

        for (const contribution of this.contributionsProvider.getContributions()) {
            if (contribution.initialize) {
                try {
                    contribution.initialize();
                } catch (error) {
                    console.log('Could not initialize contribution', error);
                }
            }
        }
    }

    use(...handlers: express.Handler[]): void {
        this.app.use(...handlers);
    }

    @postConstruct()
    protected init(): void {
        this.app.get('*.js', this.serveGzipped.bind(this, 'text/javascript'));
        this.app.get('*.js.map', this.serveGzipped.bind(this, 'application/json'));
        this.app.get('*.css', this.serveGzipped.bind(this, 'text/css'));
        this.app.get('*.wasm', this.serveGzipped.bind(this, 'application/wasm'));
        this.app.get('*.gif', this.serveGzipped.bind(this, 'image/gif'));
        this.app.get('*.png', this.serveGzipped.bind(this, 'image/png'));
        this.app.get('*.svg', this.serveGzipped.bind(this, 'image/svg+xml'));
        for (const contribution of this.contributionsProvider.getContributions()) {
            if (contribution.configure) {
                try {
                    contribution.configure(this.app);
                } catch (error) {
                    console.error('Could not configure contribution', error);
                }
            }
        }
    }

    async start(aPort?: number, aHostname?: string): Promise<http.Server> {
        const hostname = aHostname !== undefined ? aHostname : this.cliParams.hostname;
        const port = aPort !== undefined ? aPort : this.cliParams.port;

        const deferred = new Deferred<http.Server>();
        const server: http.Server = http.createServer(this.app);

        server.on('error', error => {
            deferred.reject(error);
            /* The backend might run in a separate process,
             * so we defer `process.exit` to let time for logging in the parent process */
            setTimeout(process.exit, 0, 1);
        });

        server.listen(port, hostname, () => {
            const scheme = 'http';
            console.info(`Loop is listening on ${scheme}://${hostname || 'localhost'}:${(server.address() as AddressInfo).port}.`);
            deferred.resolve(server);
        });

        /* Allow any number of websocket servers.  */
        server.setMaxListeners(0);

        for (const contrib of this.contributionsProvider.getContributions()) {
            if (contrib.onStart) {
                try {
                    await contrib.onStart(server);
                } catch (error) {
                    console.error('Could not start contribution', error);
                }
            }
        }
        return deferred.promise;
    }

    protected async serveGzipped(contentType: string, req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const acceptedEncodings = req.acceptsEncodings();

        const gzUrl = `${req.url}.gz`;
        const gzPath = path.join(this.cliParams.projectPath, 'public', gzUrl);
        if (acceptedEncodings.indexOf('gzip') === -1 || !(await fs.pathExists(gzPath))) {
            next();
            return;
        }

        req.url = gzUrl;

        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', contentType);

        next();
    }

    protected onStop(): void {
        for (const contrib of this.contributionsProvider.getContributions()) {
            if (contrib.onStop) {
                try {
                    contrib.onStop(this.app);
                } catch (error) {
                    console.error('Could not stop contribution', error);
                }
            }
        }
    }
}
