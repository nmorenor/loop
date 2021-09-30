import * as React from 'react';
import ReactDOM = require('react-dom');
import Start from './start';

export const renderStart = (target: HTMLElement, title: string, message: string) => {
    ReactDOM.render(
        <Start title={title} message={message} ></Start>,
        target
    );
};
