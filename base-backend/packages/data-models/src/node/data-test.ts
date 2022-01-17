
import { JsonRpcServer } from '@loop/core/lib/common/messaging';
import { injectable } from 'inversify';
import { GreetingsServiceClient, GreetingsService } from '@loop/core/lib/common/services/greetings';
export interface GreetingsServiceServer extends GreetingsService, JsonRpcServer<GreetingsServiceClient> {
}

@injectable()
export class GreetingsServiceServerImpl implements GreetingsServiceServer {
    async sayHello(): Promise<string> {
        return 'hello - ' + new Date().getTime();
    }
    dispose(): void {
        // do nothing
    }
    setClient(client: GreetingsServiceClient | undefined): void {
        // do nothing
    }

}
