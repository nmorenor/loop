import { IncomingMessage } from 'http';
import { injectable, postConstruct, inject, interfaces } from 'inversify';
import { AuthenticatedWebSocketChannel } from '../../common/messaging/web-socket-channel';
import { ApplicationConfigProvider } from '../backend-application';
import { WsRequestValidatorContribution } from '../ws-request-validators';
import { MessagingContribution } from './messaging-contribution';
import * as jwt from 'jsonwebtoken';
import * as ws from 'ws';
import { bindContributionProvider, AuthenticatedConnectionHandler, ContributionProvider, ConnectionHandler } from '../../common';
import { createWebSocketConnection } from 'vscode-ws-jsonrpc/lib/socket/connection';
import { ConsoleLogger } from './logger';
import { AuthenticatedConnectionContainerModule } from './connection-container-module';
export const AuthenticatedMessagingContainer = Symbol('AuthenticatedMessagingContainer');

@injectable()
export class AuthenticatedMessagingContribution extends MessagingContribution {

    @postConstruct()
    protected init(): void {
        this.ws(AuthenticatedWebSocketChannel.wsPath, (_, socket) => this.handleChannels(socket));
        for (const contribution of this.contributions.getContributions()) {
            contribution.configure(this);
        }
    }
    protected getConnectionChannelHandlers(socket: ws): MessagingContribution.ConnectionHandlers<AuthenticatedWebSocketChannel> {
        const connectionContainer = this.createSocketContainer(socket);
        bindContributionProvider(connectionContainer, AuthenticatedConnectionHandler);
        connectionContainer.load(...this.getConnectionModules().getContributions());
        const connectionChannelHandlers = new MessagingContribution.ConnectionHandlers(this.channelHandlers);
        const connectionHandlers = connectionContainer.getNamed<ContributionProvider<ConnectionHandler>>(ContributionProvider, AuthenticatedConnectionHandler);
        for (const connectionHandler of connectionHandlers.getContributions(true)) {
            connectionChannelHandlers.push(connectionHandler.path, (_, channel) => {
                const connection = createWebSocketConnection(channel, new ConsoleLogger());
                connectionHandler.onConnection(connection);
            });
        }
        return connectionChannelHandlers;
    }

    protected getConnectionModules(): ContributionProvider<interfaces.ContainerModule> {
        if (this.connectionModules) {
            return this.connectionModules;
        }
        this.connectionModules = this.container.getNamed<ContributionProvider<interfaces.ContainerModule>>(ContributionProvider, AuthenticatedConnectionContainerModule);
        return this.connectionModules;
    }
}

@injectable()
export class AuthenticatedWsRequestValidatorContribution implements WsRequestValidatorContribution {
    @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider;
    async allowWsUpgrade(request: IncomingMessage): Promise<boolean> {
        if (!this.appConfig || !this.appConfig.config || !this.appConfig.config.jwtSecret || typeof this.appConfig.config.jwtSecret !== 'string') {
            return false;
        }
        if (request.url && request.url.indexOf(AuthenticatedWebSocketChannel.wsPath) >= 0) {
            const baseURL = 'http://' + request.headers.host + '/';
            const url = new URL(request.url, baseURL);
            const auth = url.searchParams.get('authorization');
            if (auth && auth.startsWith('Bearer ')) {
                const token = auth.substring(7);
                const result = jwt.verify(token, this.appConfig.config.jwtSecret, {ignoreExpiration: false});
                if (result) {
                    return true;
                }
            }
        }
        return true;
    }
}
