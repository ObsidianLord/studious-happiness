import React from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {Div, Caption, Panel, PanelHeader, PanelHeaderBack, Button, Group, CellButton, Header, Spinner} from "@vkontakte/vkui";
import {getStore, setStore} from "../store";
import WaveSurfer from 'wavesurfer.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';

import "./EditPodcast.css";
import {Icon24Add, Icon24ArrowUturnLeftOutline, Icon24Pause, Icon24Play, Icon24Music} from "@vkontakte/icons";
import Timecode from "../views/Timecode";
import Crunker from 'crunker';


export default class EditPodcast extends React.Component {

    constructor(data) {
        super(data);
        this.state = {
            id: data.id,
            go: data.go,
            setIsLoading: data.setIsLoading,
            podcastFileUrl: null,
            audioBuffer: null,

            waveSurfer: null,
            duration: null,
            isPlaying: false,
            musicSelected: false,

            fadeIn: false,
            fadeOut: false,

            prevBuffer: null,
            isLoading: true,
            initComplete: false,

            timecodes: [],
        }
        
        this.onCutFragmentClicked = this.onCutFragmentClicked.bind(this)
        this.onUndoFragmentClicked = this.onUndoFragmentClicked.bind(this)
        this.onTimecodeAddClicked = this.onTimecodeAddClicked.bind(this)
        this.onTimecodeRemoveClicked = this.onTimecodeRemoveClicked.bind(this)
        this.onPlayPauseClicked = this.onPlayPauseClicked.bind(this)
        this.initWaveSurfer = this.initWaveSurfer.bind(this)

        this.loadFromStore()
    }

    componentDidMount() {
        // this.loadFromStore()
        if (!this.initComplete) {
            this.initWaveSurfer();
        }
    }

    componentWillUnmount() {
        this.state.waveSurfer.stop();
    }

    updateTrackInStore() {
        setStore({

        })
    }

    initWaveSurfer() {
        this.state.setIsLoading(true);
        const waveSurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#4986cc',
            progressColor: '#4986cc',
            cursorColor: 'var(--dynamic_red)',
            height: 96,
            barGap: 3,
            barWidth: 2,
            barHeight: 0.65,
            barRadius: 2,
            fillParent: false,
            scrollParent: true,
            plugins: [
                RegionPlugin.create({}),
                TimelinePlugin.create({
                    container: '#timeline',
                    notchPercentHeight: 40,
                    primaryColor: '#99A2AD',
                    secondaryColor: '#99A2AD',
                    primaryFontColor: '#99A2AD',
                    secondaryFontColor: '#99A2AD',
                    height: 14,
                }),
            ],
        });

        this.setState({
            waveSurfer
        });

        setStore({
            waveSurfer
        });

        waveSurfer.on('seek', (r) => {
            const duration = waveSurfer.getDuration();
            const rd = r * duration;
            const rVal = Object.values(waveSurfer.regions.list);
            if (rVal.length > 0 && (rd > rVal[0].end || rd < rVal[0].start)) {
                waveSurfer.clearRegions();
            } else if (rVal.length === 0) {
                const fr = Math.max(0, rd - 5);
                const sr = Math.min(rd + 5, duration);
                waveSurfer.clearRegions();
                waveSurfer.addRegion({
                    start: fr,
                    end: sr
                });
            }
        });
        waveSurfer.on('ready', () => {
            this.setState({duration: waveSurfer.getDuration()});
            setStore({
                duration: waveSurfer.getDuration()
            })
        });
        waveSurfer.on('play', () => {
            this.setState({isPlaying: true});
        });
        waveSurfer.on('pause', () => {
            this.setState({isPlaying: false});
        });

        waveSurfer.on('ready', () => {
            this.state.setIsLoading(false);
        });

        if (this.state.audioBuffer == null) {
            waveSurfer.loadBlob(this.state.podcastFileUrl);
        } else {
            waveSurfer.loadDecodedBuffer(this.state.audioBuffer);
        }

        waveSurfer.on('audioprocess', (time) => {
            if (!waveSurfer) return;
            const duration = waveSurfer.getDuration();
            if (this.state.fadeIn && time < 3) {
                waveSurfer.setVolume(time / 3);
            } else if (this.state.fadeOut && time > duration - 3) {
                waveSurfer.setVolume((duration - time) / 3);
            } else {
                waveSurfer.setVolume(1);
            }
        });
        this.state.initComplete = true;
    }

    loadFromStore(performUpdate) {
        const s = getStore()
        const change = {
            waveSurfer: s.waveSurfer,
            podcastFileUrl: s.podcastFileUrl,
            audioBuffer: s.audioBuffer,
            musicSelected: s.musicSelected,
            prevBuffer: s.prevBuffer,
            timecodes: s.timecodes
        }

        if(performUpdate) {
            this.setState(change)
        } else {
            this.state = {...this.state, ...change}
        }
    }

    onCutFragmentClicked() {
        // https://stackoverflow.com/q/24551854
        const ws = this.state.waveSurfer;
        ws.pause()

        const rVal = Object.values(ws.regions.list);
        if(rVal.length > 0) {
            const original_buffer = ws.backend.buffer;
            const newLength = ws.getDuration() - (rVal[0].end - rVal[0].start);
            const new_buffer      = ws.backend.ac.createBuffer(original_buffer.numberOfChannels, newLength * original_buffer.sampleRate, original_buffer.sampleRate);

            this.state.prevBuffer = original_buffer

            const first_list_index        = (rVal[0].start * original_buffer.sampleRate);
            const second_list_index       = (rVal[0].end * original_buffer.sampleRate);
            const second_list_mem_alloc   = (original_buffer.length - (rVal[0].end * original_buffer.sampleRate));

            const new_list        = new Float32Array( parseInt( first_list_index ));
            const second_list     = new Float32Array( parseInt( second_list_mem_alloc ));
            const combined        = new Float32Array( new_list.length + second_list.length  );

            original_buffer.copyFromChannel(new_list, 0);
            original_buffer.copyFromChannel(second_list, 0, second_list_index);

            combined.set(new_list);
            combined.set(second_list, first_list_index);

            new_buffer.copyToChannel(combined, 0);
            new_buffer.copyToChannel(combined, 1);

            ws.loadDecodedBuffer(new_buffer);
            setStore({
                audioBuffer: new_buffer
            })
            setTimeout(() => {
                this.setState({duration: ws.getDuration()});
                setStore({
                    duration: ws.getDuration()
                })
            }, 2000);
        }
    }

    onUndoFragmentClicked() {
        if (!this.state.prevBuffer) return;
        try {
            this.state.waveSurfer.pause();
            this.state.waveSurfer.loadDecodedBuffer(this.state.prevBuffer);

            this.state.prevBuffer = null
        } catch (e) {}
    }

    onTimecodeAddClicked() {
        this.state.timecodes.push({
            text: null,
            time: '00:00'
        });
        this.setState({});
        setStore({
            timecodes: this.state.timecodes
        })
    };

    onTimecodeRemoveClicked(idx) {
        this.state.timecodes.splice(idx, 1);
        this.setState({});
        setStore({
            timecodes: this.state.timecodes
        })
    };

    onPlayPauseClicked() {
        this.state.waveSurfer.playPause()
    }

    render() {
        const setState = this.setState.bind(this);
        return (
            <Panel id={this.state.id}>
                <PanelHeader
                    left={<PanelHeaderBack onClick={this.state.go} data-to="back"/>}
                >
                    Редактирование
                </PanelHeader>
                <div style={{position: "relative"}}>
                <div className="wf-container">
                    <div id="timeline"/>
                    <div id="waveform"/>
                    <div style={{position: "absolute", bottom: "0%", left: "0%", zIndex: 10000}}>
                            {this.state.fadeIn && 
                                <Div style={{paddingBottom: 2}}>
                                    <Div style={{paddingBottom: 0, paddingLeft: 2}}>
                                        <Caption level="4">Появление: вкл.</Caption>
                                    </Div>
                                </Div> }
                    </div>
                    <div style={{position: "absolute", bottom: "0%", right: "0%", zIndex: 10000}}>
                            {this.state.fadeOut && 
                                <Div style={{paddingBottom: 2}}>
                                    <Div style={{paddingBottom: 0, paddingRight: 2}}>
                                        <Caption level="4">Затухание: вкл.</Caption>
                                    </Div>
                                </Div> }
                    </div>
                </div>
                </div>
                <div className="btns-container">
                    <Button onClick={this.onPlayPauseClicked} className="square-btn" before={
                        this.state.isPlaying
                            ? <Icon24Pause style={{marginLeft: 12}}/>
                            : <Icon24Play style={{marginLeft: 10}}/>
                    }/>
                    <div style={{display: 'flex'}}>
                        <Button onClick={this.onCutFragmentClicked} className="square-btn" before={<div className="cut"/>} mode="secondary"/>
                        <Button
                            onClick={this.onUndoFragmentClicked}
                            className="square-btn"
                            before={<Icon24ArrowUturnLeftOutline style={{marginLeft: 10}}/>}
                            style={{marginLeft: 4, opacity: this.state.prevBuffer ? 1.0 : 0.5}}
                            mode="secondary"
                        />
                    </div>
                    <div style={{display: 'flex'}}>
                        <Button
                            className="square-btn"
                            before={<Icon24Music style={{marginLeft: 10}}/>}
                            style={{marginRight: 4}}
                            mode={this.state.musicSelected ? 'primary' : 'secondary'}
                            data-to="select-music"
                            onClick={this.state.go}
                        />
                        <Button
                            className="square-btn"
                            before={<div className={`fade-in-${this.state.fadeIn ? 'enabled' : 'disabled'}`}/>}
                            style={{marginRight: 4}}
                            mode={this.state.fadeIn ? 'primary' : 'secondary'}
                            onClick={(e) => this.setState({fadeIn: !this.state.fadeIn})}
                        />
                        <Button
                            className="square-btn"
                            before={<div className={`fade-out-${this.state.fadeOut ? 'enabled' : 'disabled'}`}/>}
                            mode={this.state.fadeOut ? 'primary' : 'secondary'}
                            onClick={(e) => this.setState({fadeOut: !this.state.fadeOut})}
                        />
                    </div>
                </div>
                <Group header={<Header mode="secondary">Таймкоды</Header>}>
                    {this.state.timecodes.map((tc, id) => <Timecode timecode={tc} remove={() => this.onTimecodeRemoveClicked(id)} updateUI={setState}/>)}
                    <CellButton before={<Icon24Add/>} onClick={this.onTimecodeAddClicked}>Добавить таймкод</CellButton>
                </Group>
            </Panel>
        );
    }
}
