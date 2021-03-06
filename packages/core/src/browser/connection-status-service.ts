/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { inject, injectable, optional, postConstruct } from 'inversify';
import { Event, Emitter } from '../common/event';
import { DefaultFrontendApplicationContribution } from './frontend-application';
import { WebSocketConnectionProvider } from './ws-connection-provider';
import { Disposable, DisposableCollection } from '../common';

/**
 * Service for listening on backend connection changes.
 */
export const ConnectionStatusService = Symbol('ConnectionStatusService');
export interface ConnectionStatusService {

    /**
     * The actual connection status.
     */
    readonly currentStatus: ConnectionStatus;

    /**
     * Clients can listen on connection status change events.
     */
    readonly onStatusChange: Event<ConnectionStatus>;

}

/**
 * The connection status.
 */
export enum ConnectionStatus {

    /**
     * Connected to the backend.
     */
    ONLINE,

    /**
     * The connection is lost between frontend and backend.
     */
    OFFLINE
}

@injectable()
export class ConnectionStatusOptions {

    static DEFAULT: ConnectionStatusOptions = {
        offlineTimeout: 5000,
    };

    /**
     * Timeout in milliseconds before the application is considered offline. Must be a positive integer.
     */
    readonly offlineTimeout: number;

}

export const PingService = Symbol('PingService');
export interface PingService {
    ping(): Promise<void>;
}

@injectable()
export abstract class AbstractConnectionStatusService implements ConnectionStatusService, Disposable {

    protected readonly statusChangeEmitter = new Emitter<ConnectionStatus>();

    protected connectionStatus: ConnectionStatus = ConnectionStatus.ONLINE;

    constructor(@inject(ConnectionStatusOptions) @optional() protected readonly options: ConnectionStatusOptions = ConnectionStatusOptions.DEFAULT) { }

    get onStatusChange(): Event<ConnectionStatus> {
        return this.statusChangeEmitter.event;
    }

    get currentStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    dispose(): void {
        this.statusChangeEmitter.dispose();
    }

    protected updateStatus(success: boolean): void {
        const previousStatus = this.connectionStatus;
        const newStatus = success ? ConnectionStatus.ONLINE : ConnectionStatus.OFFLINE;
        if (previousStatus !== newStatus) {
            this.connectionStatus = newStatus;
            this.fireStatusChange(newStatus);
        }
    }

    protected fireStatusChange(status: ConnectionStatus): void {
        this.statusChangeEmitter.fire(status);
    }

}

@injectable()
export class FrontendConnectionStatusService extends AbstractConnectionStatusService {

    private scheduledPing: number | undefined;

    @inject(WebSocketConnectionProvider) protected readonly wsConnectionProvider: WebSocketConnectionProvider;
    @inject(PingService) protected readonly pingService: PingService;

    constructor(@inject(ConnectionStatusOptions) @optional() protected readonly options: ConnectionStatusOptions = ConnectionStatusOptions.DEFAULT) {
        super(options);
    }

    @postConstruct()
    protected init(): void {
        this.wsConnectionProvider.onSocketDidOpen(() => {
            this.updateStatus(true);
            this.schedulePing();
        });
        this.wsConnectionProvider.onSocketDidClose(() => {
            this.clearTimeout(this.scheduledPing);
            this.updateStatus(false);
        });
        this.wsConnectionProvider.onIncomingMessageActivity(() => {
            // natural activity
            this.updateStatus(true);
            this.schedulePing();
        });
    }

    protected schedulePing(): void {
        this.clearTimeout(this.scheduledPing);
        this.scheduledPing = this.setTimeout(async () => {
            await this.performPingRequest();
            this.schedulePing();
        }, this.options.offlineTimeout);
    }

    protected async performPingRequest(): Promise<void> {
        try {
            await this.pingService.ping();
            this.updateStatus(true);
        } catch (e) {
            this.updateStatus(false);
            console.log(e);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected setTimeout(handler: (...args: any[]) => void, timeout: number): number {
        return window.setTimeout(handler, timeout);
    }

    protected clearTimeout(handle?: number): void {
        if (handle !== undefined) {
            window.clearTimeout(handle);
        }
    }
}

@injectable()
export class ApplicationConnectionStatusContribution extends DefaultFrontendApplicationContribution {

    protected readonly toDisposeOnOnline = new DisposableCollection();

    constructor(
        @inject(ConnectionStatusService) protected readonly connectionStatusService: ConnectionStatusService
    ) {
        super();
        this.connectionStatusService.onStatusChange(state => this.onStateChange(state));
    }

    protected onStateChange(state: ConnectionStatus): void {
        switch (state) {
            case ConnectionStatus.OFFLINE: {
                this.handleOffline();
                break;
            }
            case ConnectionStatus.ONLINE: {
                this.handleOnline();
                break;
            }
        }
    }

    protected handleOnline(): void {
        this.toDisposeOnOnline.dispose();
    }

    protected handleOffline(): void {
        console.log('offline');
    }
}
