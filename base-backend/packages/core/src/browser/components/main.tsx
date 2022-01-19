import { DisposableCollection } from '../../common';
import * as React from 'react';
import ReactDOM = require('react-dom');
import { RegionsService } from '../../common/services/regions';
import { RegionsClient } from '../services/region-service';
import Start from './start';

export const renderStart = (
        target: HTMLElement, title: string, message: string,
        regionsService: RegionsService, regionsServiceClient: RegionsClient,
        disposables: DisposableCollection
    ) => {
    ReactDOM.render(
        <Start title={title} message={message} regionsService={regionsService}
        regionsServiceClient={regionsServiceClient} disposables={disposables}></Start>,
        target
    );
};
