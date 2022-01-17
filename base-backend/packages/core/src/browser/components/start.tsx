
import React from 'react';
import { GreetingsService } from '../../common/services/greetings';

export interface StartProps {
    message: string;
    title: string;
    greetingsService: GreetingsService;
}

const Start: React.FC<StartProps> = ({ message, title, greetingsService }) => {
    if (!message || !title) {
        return <></>;
    }
    return (
        <div className='section over-hide z-bigger'>
            <div className='loop-box'>
                <div className='loop-inner-box'>
                    <div className='loop-logo-icon-setup'></div>
                    <div>

                    <div>
                        <p className='loop-text-alert format'>{title}</p>
                        <div onClick={async e => {
                            e.preventDefault();
                            const value = await greetingsService.sayHello();
                            console.log(value);
                        }} className='loop-username-container'>
                            <label className='loop-info'>
                                {message}
                            </label>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Start;
