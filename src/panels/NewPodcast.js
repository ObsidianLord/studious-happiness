import React from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import {
    PanelHeaderBack,
    FormLayout, Input,
    Panel, PanelHeader,
    platform, Textarea,
    Button, Div,
    Separator,
    Title, Placeholder,
    Checkbox, FormLayoutGroup,
    Select, SimpleCell, Caption,
} from "@vkontakte/vkui";
import Icon28PictureOutline from '@vkontakte/icons/dist/28/picture_outline';
import {availabilityTargets, getStore, setStore} from "../store";
import {Icon28PodcastOutline} from "@vkontakte/icons";

import "./NewPodcast.css";

const osName = platform();

class NewPodcast extends React.Component {
    constructor(data) {
        super(data);

        this.state = {
            id: data.id,
            go: data.go,

            name: null,
            description: null,
            duration: 0,

            imageFileUrl: null,
            podcastFileName: null,
            podcastFileUrl: null,

            isExplicit: null,
            isExcludedFromExport: null,
            isTrailer: null,

            availableTo: availabilityTargets[0].value,
        }

        this.onImageFileSelected = this.onImageFileSelected.bind(this)
        this.onPodcastFileSelected = this.onPodcastFileSelected.bind(this)
        this.clearImage = this.clearImage.bind(this)
        this.openEditPodcastView = this.openEditPodcastView.bind(this)
        this.canGoNext = this.canGoNext.bind(this)
        this.saveAndGo = this.saveAndGo.bind(this)
        this.saveToStore = this.saveToStore.bind(this)
        this.loadFromStore = this.loadFromStore.bind(this)
        this.shortDuration = this.shortDuration.bind(this)

    }

    componentDidMount() {
        this.loadFromStore(true)
    }

    shortDuration(t) {
        if (t <= 0) {
            return "";
        }
        const m = Math.floor(t / 60);
        const s = Math.floor(t - m * 60);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    onImageFileSelected(e) {
        const files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        const file = files[0];

        const reader = new FileReader();
        reader.onload = (fileReader) => {
            const dataUri = fileReader.target.result.toString();
            this.setState({imageFileUrl: dataUri})
        };
        reader.readAsDataURL(file);
    }

    onPodcastFileSelected(e) {
        const component = this

        const files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        const file = files[0];

        const reader = new FileReader();
        reader.onload = (fileReader) => {
            component.setState({
                podcastFileName: file.name,
                podcastFileUrl: file
            })
        };
        reader.readAsDataURL(file);
    }

    clearImage() {
        this.setState({imageFileUrl: null})
    }

    openEditPodcastView(e) {
        this.saveToStore();
        this.state.go(e);
    }

    canGoNext() {
        const nameDefined = !!this.state.name
        // const descriptionDefined = !!this.state.description
        // const imageDefined = !!this.state.imageFileUrl
        const podcastFileChosen = !!this.state.podcastFileUrl
        return nameDefined && podcastFileChosen;
    }

    saveAndGo(e) {
        if (this.canGoNext()) {
            this.saveToStore();
            this.state.go(e);
        }
    }

    saveToStore() {
        setStore({
            image: this.state.image,
            name: this.state.name,
            description: this.state.description,

            imageFileUrl: this.state.imageFileUrl,
            podcastFileName: this.state.podcastFileName,
            podcastFileUrl: this.state.podcastFileUrl,

            isExplicit: this.state.isExplicit,
            isExcludedFromExport: this.state.isExcludedFromExport,
            isTrailer: this.state.isTrailer,

            availableTo: this.state.availableTo,
        });
    };

    loadFromStore(performUpdate) {
        const s = getStore()
        const change = {
            name: s.name,
            description: s.description,
            duration: s.duration,

            imageFileUrl: s.imageFileUrl,
            podcastFileName: s.podcastFileName,
            podcastFileUrl: s.podcastFileUrl,

            isExplicit: s.isExplicit,
            isExcludedFromExport: s.isExcludedFromExport,
            isTrailer: s.isTrailer,

            availableTo: s.availableTo,
        }

        if(performUpdate) {
            this.setState(change)
        } else {
            this.state = {...this.state, ...change}
        }
    }

    render() {
        return (
            <Panel id={this.state.id}>
                <PanelHeader
                    left={<PanelHeaderBack onClick={this.state.go} data-to="back"/>}
                >
                    Новый подкаст
                </PanelHeader>
                <Div style={{display: 'flex'}}>
                    {this.state.imageFileUrl
                        ? <div className="background-image" style={{backgroundImage: `url(${this.state.imageFileUrl})`}}>
                            <div className="remove-button" onClick={this.clearImage}>✕</div>
                          </div>
                        : <label>
                            <div className="select-file">
                                <div className="select-file-text"><Icon28PictureOutline/></div>
                            </div>
                            <input onChange={this.onImageFileSelected} type="file" accept="image/*"
                                   style={{display: "none"}}/>
                        </label>
                    }
                    <div style={{width: 'calc(100%)'}}>
                        <FormLayout className='formLayout'>
                            <Input
                                top="Название"
                                placeholder="Введите название подкаста"
                                value={this.state.name}
                                onChange={(e) => this.setState({name: e.currentTarget.value})}
                            />
                        </FormLayout>
                    </div>
                </Div>
                <FormLayout>
                    <Textarea
                        top="Описание подкаста"
                        placeholder=""
                        value={this.state.description}
                        onChange={(e) => this.setState({description: e.currentTarget.value})}
                    />
                </FormLayout>
                {!this.state.podcastFileUrl ?
                    <Placeholder className="load-block" action={
                        <label>
                            <Button Component="div" size="l" mode="outline">Загрузить файл</Button>
                            <input onChange={this.onPodcastFileSelected} type="file"
                                   style={{display: "none"}}/>
                        </label>
                    }>
                        <Title level="2" weight="semibold" style={{color: 'var(--landing_text_primary)', marginBottom: 10}}>
                            Загрузите Ваш подкаст
                        </Title>
                        Выберите готовый аудиофайл из вашего телефона и добавьте его
                    </Placeholder>
                    :
                    <SimpleCell
                        before={<div className="podcast-icon"><Icon28PodcastOutline style={{opacity: 0.4}}/></div>}
                        after={
                            <Caption level="2" weight="regular" style={{color: 'var(--text_placeholder)', textAlign: "center"}}>
                                {this.shortDuration(this.state.duration)}
                            </Caption>
                        }>
                        <span style={{marginLeft: 12}}>{this.state.podcastFileName}</span>
                    </SimpleCell>}
                {this.state.podcastFileUrl && <Div>
                    <Caption level="2" weight="regular" style={{color: 'var(--text_placeholder)'}}>
                        Вы можете добавить таймкоды и скорректировать подкаст в режиме редактирования
                    </Caption>
                    <Button
                        size="xl"
                        mode="outline"
                        onClick={this.openEditPodcastView}
                        data-to="edit-podcast"
                        style={{marginTop: 16}}
                    >Редактировать аудиозапись</Button>
                </Div>}
                <Separator/>
                <FormLayout>
                    <FormLayoutGroup>
                        <Checkbox checked={this.state.isExplicit}
                                  onChange={(e) => this.setState({isExplicit: e.currentTarget.checked})}>
                            Ненормативный контент
                        </Checkbox>
                        <Checkbox checked={this.state.isExcludedFromExport}
                                  onChange={(e) => this.setState({isExcludedFromExport: e.currentTarget.checked})}>
                            Исключить эпизод из экспорта
                        </Checkbox>
                        <Checkbox checked={this.state.isTrailer}
                                  onChange={(e) => this.setState({isTrailer: e.currentTarget.checked})}>
                            Трейлер подкаста
                        </Checkbox>
                    </FormLayoutGroup>

                </FormLayout>
                    <SimpleCell expandable description="Всем пользователям" style={{marginBottom: 0, paddingBottom: 0}}>
                        Кому доступен данный подкаст
                    </SimpleCell>
                    <Div style={{paddingTop: 0, marginTop: 0}}>
                        <Caption level="1" weight="regular" style={{paddingTop: 0, marginTop: 0}}>
                            При публикации записи с эпизодом, он становится доступным для всех пользователей
                        </Caption>
                    </Div>

                    <Div>
                    <Button
                        size="xl" onClick={this.saveAndGo} data-to="view-podcast"
                        disabled={!this.canGoNext()}>Далее</Button>

                    </Div>
            </Panel>
        );
    }
}

export default NewPodcast;
