export const authPath = '/services/auth';
export const systemStatePath = '/services/system';
export const systemInstallPath = '/services/install';
export const AuthService = Symbol('AuthService');
export const SystemStateService = Symbol('SystemStateService');
export interface InstallServiceClient {
    // such empty
}
export interface AuthServiceClient {
    // such empty
}
export interface SystemStateClient {
    // such empty
}
export interface UserAttributes {
    id: number;
    email: string;
    password: string;
}
export interface GroupAttributes {
    id: number;
    name: string;
}
export interface GroupMember {
    userId: number;
    groupId: number;
}
export enum SystemState {
    INSTALL_REQUIRED = 'INSTALL_REQUIRED',
    OK = 'OK'
}
export interface LoginResponse {
    token: string | undefined;
    authWSToken: string | undefined; // token that expires in a minute, used to authenticate the auth WS connection
    userId: number | undefined;
    email: string | undefined;
    groupIds: number[] | undefined;
    status: 'error' | 'ok';
}
export interface InstallResponse {
    status: 'error' | 'ok';
}
export interface AuthService {
    loginWithToken(token: string): Promise<LoginResponse>;
    loginWithCredentials(email: string, password: string): Promise<LoginResponse>;
}
export interface SystemStateService {
    getState(): Promise<SystemState>;
}
export interface InstallService {
    createAdmin(email: string, password: string): Promise<InstallResponse>;
}
