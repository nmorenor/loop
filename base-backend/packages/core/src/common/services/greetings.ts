export const GreetingsService = Symbol('GreetingsService');
export interface GreetingsServiceClient {

}
export interface GreetingsService {
    sayHello(): Promise<string>;
}
