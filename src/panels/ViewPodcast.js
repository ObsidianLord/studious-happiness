import React from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    RichCell,
    Avatar,
    Separator,
    Div, Caption,
    Group, Link, Title, Button, FixedLayout
} from "@vkontakte/vkui";
import placeholder from '../img/placeholder.png';
import {getStore} from "../store";


export default class ViewPodcast extends React.Component {
    convertDurationToStr() {
        console.log(this.state.duration)
        const duration = this.state.duration;
        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration - h * 3600) / 60);
        const s = Math.floor(duration - h * 3600 - m * 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        } else {
            return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
    };

    constructor(data) {
        super(data);
        this.state = {
            id: data.id,
            go: data.go,

            name: null,
            description: null,

            image: null,
            timecodes: [],
            duration: 0
        }

        this.convertDurationToStr = this.convertDurationToStr.bind(this)
    }

    componentDidMount() {
        this.loadFromStore(true)
    }

    loadFromStore(performUpdate) {
        const s = getStore()
        const change = {
            name: s.name,
            description: s.description,
            duration: s.duration,
            image: s.imageFileUrl,
            timecodes: s.timecodes
        }

        if(performUpdate) {
            this.setState(change)
        } else {
            this.state = {...this.state, ...change}
        }
    }

    render() {
        return (<Panel id={this.state.id}>
            <PanelHeader
                left={<PanelHeaderBack onClick={this.state.go} data-to="back"/>}
            >
                Новый подкаст
            </PanelHeader>
            <RichCell
                before={<Avatar mode="app" size={48} src={this.state.image ?? placeholder} />}
                text="ПараDogs"
                caption={`Длительность: ${this.convertDurationToStr()}`}
            >
                {this.state.name}
            </RichCell>
            <Separator/>
            <Div>
                <Group header={<Title style={{marginTop: 0}} level="3" weight="semibold">Описание</Title>}>
                    {this.state.description && this.state.description}
                    {!this.state.description && 
                        <Caption level="2" weight="regular" style={{color: 'var(--text_placeholder)'}}>
                            Здесь пока пусто.<br />Вы можете добавить описание на странице создания подкаста.
                        </Caption>}
                </Group>
            </Div>
            <Separator/>
            <Div>
                <Group header={<Title style={{marginTop: 0, marginBottom: 8}} level="3" weight="semibold">Содержание</Title>}>
                    {this.state.timecodes.length > 0 && this.state.timecodes.map((tc) => <div style={{marginBottom: 8}}>
                        <Link>{tc.time}</Link> — {tc.name ? tc.name : "Секция"}
                    </div>)}
                    {this.state.timecodes.length === 0 && 
                        <Caption level="2" weight="regular" style={{color: 'var(--text_placeholder)'}}>
                            Здесь пока пусто.<br />Вы можете добавить таймкоды и скорректировать подкаст в режиме редактирования.
                        </Caption>}
                </Group>
            </Div>
            <div style={{marginBottom: "60"}}/>
            <FixedLayout vertical="bottom" filled>
                <Div>
                    <Button size="xl" onClick={this.state.go} data-to="share">
                        Опубликовать
                    </Button>
                </Div>
            </FixedLayout>
        </Panel>
    );
    }
}
