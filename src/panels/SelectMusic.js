import React from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {Panel, PanelHeader, PanelHeaderButton, IOS, platform, Button, Group, CellButton, Header, Search, SimpleCell, Avatar} from "@vkontakte/vkui";
import {getStore, setStore} from "../store";
import Icon28ChevronBack from "@vkontakte/icons/dist/28/chevron_back";
import Icon24Back from "@vkontakte/icons/dist/24/back";
import WaveSurfer from 'wavesurfer.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import "./EditPodcast.css";
import {Icon24Add, Icon24ArrowUturnLeftOutline, Icon24Pause, Icon24Play, Icon24Music} from "@vkontakte/icons";
import Timecode from "../views/Timecode";
import Crunker from 'crunker';

const osName = platform();

class SelectMusic extends React.Component {

    constructor(data) {
        super(data);    
        this.state = {
            id: data.id,
            go: data.go,
            setIsLoading: data.setIsLoading
        }

        this.applyMusic = this.applyMusic.bind(this)
    }

    async applyMusic(e) {
        this.state.setIsLoading(true);
        const ws = getStore().waveSurfer;
        const audio = new Crunker();
        const originalBuffer = ws.backend.buffer;
        const result = await audio
            .fetchAudio('/music.mp3')
            .then(buffers => {
                return audio.mergeAudio(buffers.concat(originalBuffer))
            });

        ws.loadDecodedBuffer(result);
        setStore({
            audioBuffer: result,
            prevBuffer: originalBuffer
        });
        setStore({
            musicSelected: true
        });
        this.state.setIsLoading(false);
        this.state.go({
            currentTarget: {
                dataset: {
                    to: 'back'
                }
            }
        });
    }

    render() {
        return (
            <Panel id={this.state.id}>
                <PanelHeader
                    left={<PanelHeaderButton onClick={this.state.go} data-to="back">
                        {osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
                    </PanelHeaderButton>}
                >
                    Выбрать музыку
                </PanelHeader>
                <Search />
                <SimpleCell
                    before={<Avatar size={48} src={'/album.jpg'} mode="image" />}
                    description="Citizen Cope"
                    indicator="04:17"
                    data-to="back"
                    style={{cursor: 'pointer'}}
                    onClick={this.applyMusic}
                >
                    Let The Drummer Kick
                </SimpleCell>
            </Panel>
        );
    }
}

export default SelectMusic;
