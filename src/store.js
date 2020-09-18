export let store = null;

export const availabilityTargets = [
    { value: 'Всем пользователям', key: 'all' },
    { value: 'Только маме', key: 'not-all' }
]

export function getStore(returnCleared) {
    if(!store || returnCleared) {
        store = {
            name: null,
            description: null,
            duration: null,

            waveSurfer: null,
            prevBuffer: null,
            imageFileUrl: null,
            podcastFileName: null,
            podcastFileUrl: null,
            musicSelected: false,

            isExplicit: null,
            isExcludedFromExport: null,
            isTrailer: null,

            availableTo: availabilityTargets[0].key,

            audioBuffer: null,

            timecodes: []
        };
    }
    return store;
}

export function setStore(update) {
    store = { ...getStore(), ...update }
    return store
}
