import * as React from 'react';
import ReactDOM = require('react-dom');
import { GreetingsService } from '../../common/services/greetings';
import Start from './start';

export const renderStart = (target: HTMLElement, title: string, message: string, greetingsService: GreetingsService) => {
    ReactDOM.render(
        <Start title={title} message={message} greetingsService={greetingsService}></Start>,
        target
    );
};
