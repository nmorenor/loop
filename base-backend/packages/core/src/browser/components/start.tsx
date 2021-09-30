
import React from 'react';

export interface StartProps {
    message: string;
    title: string;
}

const Start: React.FC<StartProps> = ({ message, title }) => {
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
                        <div className='loop-username-container'>
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
