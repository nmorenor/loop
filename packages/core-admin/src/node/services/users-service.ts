
import { JsonRpcServer } from '@loop/core/lib/common/messaging';
import { injectable, inject } from 'inversify';
import { AuthService, AuthServiceClient, LoginResponse, InstallService, InstallServiceClient, SystemStateService, SystemStateClient, InstallResponse, SystemState } from '../../common/services/users';
import { UsersRepository } from '../model/users-repository';
import { ApplicationConfigProvider } from '@loop/core/lib/node/backend-application';
import * as jwt from 'jsonwebtoken';
export interface SystemStateServiceServer extends SystemStateService, JsonRpcServer<SystemStateClient> {}

@injectable()
export class SystemStateServiceServerImpl implements SystemStateServiceServer {
    protected client: SystemStateClient | undefined;
    @inject(UsersRepository) private usersRepository: UsersRepository;
    async getState(): Promise<SystemState> {
        const hasUsers = await this.usersRepository.hasUsers();
        return hasUsers ? SystemState.OK : SystemState.INSTALL_REQUIRED;
    }
    dispose(): void {
        this.client = undefined;
    }
    setClient(client: SystemStateClient | undefined): void {
        this.client = client;
    }

}
export interface InstallServiceServer extends InstallService, JsonRpcServer<InstallServiceClient> {}

@injectable()
export class InstallServiceServerImpl implements InstallServiceServer {
    protected client: InstallServiceClient | undefined;
    @inject(UsersRepository) private usersRepository: UsersRepository;
    private static ERROR_RESPONSE: InstallResponse = { status: 'error' };
    async createAdmin(email: string, password: string): Promise<InstallResponse> {
        const hasUsers = await this.usersRepository.hasUsers();
        if (hasUsers) {
            return InstallServiceServerImpl.ERROR_RESPONSE;
        }
        await this.usersRepository.setupGroups();
        const adminGroup = await this.usersRepository.getAdminGroup();
        const usersGroup = await this.usersRepository.getUsersGroup();
        if (!adminGroup || !usersGroup) {
            return InstallServiceServerImpl.ERROR_RESPONSE;
        }
        const user = await this.usersRepository.upsertUser(email, password, [ adminGroup, usersGroup ]);
        if (!user) {
            return InstallServiceServerImpl.ERROR_RESPONSE;
        }
        return { status: 'ok' };
    }
    dispose(): void {
        this.client = undefined;
    }
    setClient(client: InstallServiceClient | undefined): void {
        this.client = client;
    }

}
export interface AuthServiceServer extends AuthService, JsonRpcServer<AuthServiceClient> {}

@injectable()
export class AuthServiceServerImpl implements AuthServiceServer {
    @inject(UsersRepository) private usersRepository: UsersRepository;
    @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider;
    protected client: AuthServiceClient | undefined = undefined;
    private static LOGIN_ERROR: LoginResponse = {
        status: 'error',
        email: undefined,
        groupIds: undefined,
        token: undefined,
        authWSToken: undefined,
        userId: undefined
    };
    dispose(): void {
        this.client = undefined;
    }
    setClient(client: AuthServiceClient | undefined): void {
        this.client = client;
    }
    async loginWithToken(token: string): Promise<LoginResponse> {
        if (!this.appConfig || !this.appConfig.config || !this.appConfig.config.jwtSecret || typeof this.appConfig.config.jwtSecret !== 'string') {
            return AuthServiceServerImpl.LOGIN_ERROR;
        }
        const result = jwt.verify(token, this.appConfig.config.jwtSecret, { ignoreExpiration: false });
        let userId: number | undefined = undefined;
        if (typeof result === 'string') {
            const user = JSON.parse(result).data.user;
            if (user) {
                userId = user.id;
            }
        } else {
            const user = result.data.user;
            if (user) {
                userId = user.id;
            }
        }
        if (userId === undefined) {
            return AuthServiceServerImpl.LOGIN_ERROR;
        }
        const modelUser = await this.usersRepository.getUserByID(userId);
        if (!modelUser) {
            return AuthServiceServerImpl.LOGIN_ERROR;
        }
        const responseUser = Object.assign({}, modelUser.toJSON(), { password: undefined }); // remove password
        const responseToken = jwt.sign(responseUser, this.appConfig.config.jwtSecret, { issuer: 'loop', expiresIn: '5 days' }); // regular token expires in 5 days
        const authWSToken = jwt.sign(JSON.stringify(responseUser),
            this.appConfig.config.jwtSecret, { issuer: 'loop', expiresIn: 60 }); // token to connect to auth WS expires in 60 seconds
        return {
            status: 'ok',
            authWSToken: authWSToken,
            token: responseToken,
            email: modelUser.email,
            groupIds: modelUser.groups ? modelUser.groups.map(next => next.id) : [],
            userId: modelUser.id
        };
    }
    async loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
        if (!this.appConfig || !this.appConfig.config || !this.appConfig.config.jwtSecret || typeof this.appConfig.config.jwtSecret !== 'string') {
            return AuthServiceServerImpl.LOGIN_ERROR;
        }
        const user = await this.usersRepository.getUser(email);
        if (!user || user.password !== password) {
            return AuthServiceServerImpl.LOGIN_ERROR;
        }
        const responseUser = Object.assign({}, user.toJSON(), { password: undefined }); // remove password
        const responseToken = jwt.sign(responseUser, this.appConfig.config.jwtSecret, { issuer: 'loop', expiresIn: '5 days' }); // regular token expires in 5 days
        const authWSToken = jwt.sign(JSON.stringify(responseUser),
            this.appConfig.config.jwtSecret, { issuer: 'loop', expiresIn: 60 }); // token to connect to auth WS expires in 60 seconds
        return {
            status: 'ok',
            authWSToken: authWSToken,
            token: responseToken,
            email: user.email,
            groupIds: user.groups ? user.groups.map(next => next.id) : [],
            userId: user.id
        };
    }
}
