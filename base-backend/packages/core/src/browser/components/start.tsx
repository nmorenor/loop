
import { DisposableCollection } from '../../common';
import React, { useEffect, useState } from 'react';
import { RegionAttributes, RegionsService } from '../../common/services/regions';
import { RegionsClient } from '../services/region-service';

export interface StartProps {
    message: string;
    title: string;
    regionsService: RegionsService;
    regionsServiceClient: RegionsClient;
    disposables: DisposableCollection;
}

const Start: React.FC<StartProps> = ({ message, title, regionsService, regionsServiceClient, disposables }) => {
    if (!message || !title) {
        return <></>;
    }
    const [ regions, setRegions ] = useState(new Array<RegionAttributes>());
    const [ regionInput, setRegionInput ] = useState(React.createRef<HTMLInputElement>());
    const [ regionNameInput, setRegionNameInput ] = useState(React.createRef<HTMLInputElement>());
    useEffect(() => {
        regionsService.getAllRegions().then(allRegions => {
            if (allRegions && allRegions.length) {
                setRegions(allRegions);
            }
        });
        disposables.push(regionsServiceClient.onRegionChange(async () => {
            const allRegions = await regionsService.getAllRegions();
            setRegions(allRegions);
        }));
        return () => {
            disposables.dispose();
        };
    }, []);
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
                            {regions.map(next =>
                                <div key={next.code}>{next.name}</div>
                            )}
                            <div>
                                <div>
                                    <input placeholder='code' ref={regionInput} type='text' name='regionCode'/>
                                </div>
                                <div>
                                    <input placeholder='name' ref={regionNameInput} type='text' name='regionName'/>
                                </div>
                                <div>
                                    <button onClick={async e => {
                                        e.preventDefault();
                                        const code = regionInput.current?.value;
                                        const name = regionNameInput.current?.value;
                                        if (code && code.trim().length > 0 && name && name.trim().length > 0) {
                                            await regionsService.addRegion({ code, name });
                                            regionInput.current.value = '';
                                            regionNameInput.current.value = '';
                                        }
                                    }}>New Region</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Start;
