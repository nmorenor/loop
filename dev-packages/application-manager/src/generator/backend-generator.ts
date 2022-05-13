/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { AbstractGenerator } from './abstract-generator';

export class BackendGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        const backendModules = this.pck.targetBackendModules;
        await this.write(this.pck.backend('server.js'), this.compileServer(backendModules));
        await this.write(this.pck.backend('main.js'), this.compileMain(backendModules));
    }

    protected compileServer(backendModules: Map<string, string>): string {
        return `// @ts-check
require('reflect-metadata');
const path = require('path');
const express = require('express');
const { Container } = require('inversify');
const { backendApplicationModule } = require('@loop/core/lib/node/backend-module');
const { messagingBackendModule } = require('@loop/core/lib/node/messaging/messaging-backend-module');
const { CliManager } = require('@loop/core/lib/node/cli');
const { BackendApplication } = require('@loop/core/lib/node/backend-application');
const { LoopContainer } = require('@loop/core/lib/common/common');
const { DataModelsManager } = require('@loop/core-admin/lib/node/data-models-manager');

const container = new Container();
container.load(backendApplicationModule);
container.load(messagingBackendModule);
container.bind(LoopContainer).toConstantValue(container);

function load(raw) {
    return Promise.resolve(raw.default).then(
        module => container.load(module)
    );
}

function start() {
    const cliManager = container.get(CliManager);
    return cliManager.initializeCli(process.argv).then(function () {
        const application = container.get(BackendApplication);
        const modelsManager = container.get(DataModelsManager);
        modelsManager.initialize();
        application.use(express.static(path.join(__dirname, '../../lib')));
        application.use(express.static(path.join(__dirname, '../../lib/index.html')));
        return application.start();
    });
}

module.exports = () => Promise.resolve()${this.compileBackendModuleImports(backendModules)}
    .then(() => start()).catch(reason => {
        console.error('Failed to start the backend application.');
        if (reason) {
            console.error(reason);
        }
        throw reason;
    });`;
    }

    protected compileMain(backendModules: Map<string, string>): string {
        return `// @ts-check
const { BackendApplicationConfigProvider } = require('@loop/core/lib/node/backend-application-config-provider');
const main = require('@loop/core/lib/node/main');
BackendApplicationConfigProvider.set(${this.prettyStringify(this.pck.props.backend.config)});

const serverModule = require('./server');
const address = main.start(serverModule());
address.then(function (address) {
    if (process && process.send) {
        process.send(address.port.toString());
    }
});
module.exports = address;
`;
    }

}
