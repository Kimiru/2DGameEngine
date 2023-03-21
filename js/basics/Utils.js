import { Rectangle } from "../2DGameEngine.js";
import { SVGStringToImage } from "../images/Utils.js";
import { GameObject } from "./GameObject.js";
/**
 * loads multiple images and use callbacks for progression checks and at the end
 *
 * @param {{ name: string, src: string }[]} images
 * @param {(completed:number) => void} incrementCallback
 * @param {() => void}finishedCallback
 * @returns
 */
export function loadImages(images, incrementCallback, finishedCallback) {
    let bank = new Map();
    let completed = { n: 0 };
    for (let image of images) {
        let img = document.createElement('img');
        img.src = image.src;
        img.onload = function () {
            completed.n++;
            incrementCallback(completed.n);
            if (completed.n == images.length)
                finishedCallback();
        };
        img.onerror = function (err) {
            console.error(`Could not load image "${image.name}" for source "${image.src}"`);
            console.error(err);
            completed.n++;
            incrementCallback(completed.n);
            if (completed.n == images.length)
                finishedCallback();
        };
        bank.set(image.name, img);
    }
    if (images.length === 0)
        finishedCallback();
    return bank;
}
export function loadSVGs(svgs, incrementCallback, finishedCallback) {
    let bank = new Map();
    let completed = { n: 0 };
    for (let svg of svgs) {
        let data = { raw: '', image: null };
        fetch(svg.src)
            .then(res => {
            if (res.ok)
                return res.text();
            throw res;
        })
            .then(svg => {
            data.raw = svg;
            return svg;
        })
            .then(SVGStringToImage)
            .then(image => {
            data.image = image;
            completed.n++;
            incrementCallback(completed.n);
        })
            .catch(err => {
            console.error(`Could not load image "${svg.name}" for source "${svg.src}"`);
            console.error(err);
            completed.n++;
            incrementCallback(completed.n);
        })
            .finally(() => {
            if (completed.n == svgs.length)
                finishedCallback();
        });
        bank.set(svg.name, data);
    }
    if (svgs.length === 0)
        finishedCallback();
    return bank;
}
export class Sound {
    volume = 1;
    soundsFifo = [];
    currentSound = 0;
    constructor(soundsFifo) {
        this.soundsFifo = soundsFifo;
    }
    play() {
        let sounds = this.soundsFifo[this.currentSound];
        for (let sound of sounds)
            sound.pause();
        let sound = sounds[Math.floor(Math.random() * sounds.length)];
        sound.volume = this.volume;
        sound.currentTime = 0;
        sound.play();
        this.currentSound += 1;
        this.currentSound %= this.soundsFifo.length;
    }
    pause() {
        for (let sounds of this.soundsFifo)
            for (let sound of sounds)
                sound.pause();
    }
    setVolume(volume) { this.volume = volume; }
}
export function loadSounds(sounds, incrementCallback, finishedCallback) {
    let bank = new Map();
    let completed = { n: 0 };
    let toComplete = { n: 0 };
    for (let sound of sounds) {
        let backups = [];
        for (let index = 0; index < (sound.backup ?? 1); index++) {
            let snds = [];
            for (let src of sound.srcs) {
                toComplete.n++;
                let snd = document.createElement('audio');
                snd.src = src;
                snd.oncanplay = function () {
                    completed.n++;
                    incrementCallback(completed.n);
                    if (completed.n == toComplete.n)
                        finishedCallback();
                };
                snd.onerror = function (err) {
                    console.error(`Could not load sound "${sound.name}" for source "${src}"`);
                    console.error(err);
                    completed.n++;
                    incrementCallback(completed.n);
                    if (completed.n == toComplete.n)
                        finishedCallback();
                };
                snds.push(snd);
            }
            backups.push(snds);
        }
        bank.set(sound.name, new Sound(backups));
    }
    if (completed.n == toComplete.n)
        finishedCallback();
    return bank;
}
let idCount = 0;
export function id() { return ++idCount; }
export function* range(min, max = null, step = 1) {
    if (!max) {
        max = min;
        min = 0;
    }
    for (let i = min; i < max; i += step)
        yield i;
}
export function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value))
                return;
            seen.add(value);
        }
        return value;
    };
}
export function badclone(o) { return JSON.parse(JSON.stringify(o, getCircularReplacer())); }
export function resolveStringable(value) {
    if (value === null)
        return '';
    return typeof value === 'string' ? value : value();
}
export function dummy(x = 0, y = 0) {
    let obj = new GameObject();
    obj.position.set(x, y);
    let rect = new Rectangle(0, 0, 1, 1);
    rect.fill = false;
    rect.display = true;
    obj.add(rect);
    return obj;
}
