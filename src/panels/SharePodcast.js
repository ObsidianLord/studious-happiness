import React from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {Button, Panel, PanelHeader, Placeholder, Title} from "@vkontakte/vkui";
import Icon56CheckCircleOutline from '@vkontakte/icons/dist/56/check_circle_outline';

const SharePodcast = ({id, go}) => {
    return (
        <Panel id={id}>
            <PanelHeader>Подкасты</PanelHeader>
            <Placeholder stretched action={<Button onClick={go} data-to='new-podcast'>Добавить подкаст</Button>}>
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: 10}}>
                    <Icon56CheckCircleOutline fill={'var(--accent)'}/>
                </div>
                <Title level="2" weight="bold" style={{color: 'var(--landing_text_primary)'}}>
                    Поделиться подкастом
                </Title>
                Расскажите своим подписчикам<br/>о новом подкасте, чтобы получить<br/>больше слушателей
            </Placeholder>
        </Panel>
    );
}

export default SharePodcast;
