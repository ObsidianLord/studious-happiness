import React from 'react';
import {Div, Input, IOS, platform} from "@vkontakte/vkui";
import Icon24DismissDark from '@vkontakte/icons/dist/24/dismiss_dark';
import "./Timecode.css";
import InputMask from 'react-input-mask';



const osName = platform();

const Timecode = ({timecode, remove, updateUI}) => {
    const getTime = (t) => {
        const min = Math.floor(t / 60).toString();
        const sec = Math.floor(t - min * 60).toString();
        return `${min.padStart(2, "0")}:${sec.padStart(2, "0")}`;
    };

    const getSeconds = (s) => {
        const arr = s.split(":");
        if (arr.length === 0) return 0;
        else if (arr.length === 1) return Number.parseInt(arr[0]);
        else return Number.parseInt(arr[0]) * 60 + Number.parseInt(arr[1]);
    };

    return <Div style={{display: "flex"}}>
        {osName === IOS ?
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingRight: 0}}>
            <div className="dismiss"
                onClick={remove}
            />
        </div>:
        <Icon24DismissDark
            onClick={remove}
            style={{marginTop: 10}}
        />}
        <Input
            value={timecode.name}
            placeholder="Название"
            onChange={(e) => {timecode.name = e.currentTarget.value; updateUI({});}}
        />
        <InputMask mask="99:99" value={timecode.time} onChange={(e) => {timecode.time = e.currentTarget.value; updateUI({});}}>
            {(inputProps) => <Input  {...inputProps}/>}
        </InputMask>
        
    </Div>;
}

export default Timecode;
