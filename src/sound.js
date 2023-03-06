const DEFAULT_VOLUME = 0.5;

const loadAudio = (path, volume = 1) => {
    const newAudio = new Audio(path);
    newAudio.volume = volume * DEFAULT_VOLUME;
    return newAudio;
}

export class Sound {
    constructor() {
        this.hit = loadAudio("hit.wav", 0.75);
        this.step = loadAudio("step.wav");
        this.success = loadAudio("success.wav");
    }
}