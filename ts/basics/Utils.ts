import { SVGStringToImage } from "../images/Utils.js"

/**
 * loads multiple images and use callbacks for progression checks and at the end
 * 
 * @param {{ name: string, src: string }[]} images 
 * @param {(completed:number) => void} incrementCallback 
 * @param {() => void}finishedCallback 
 * @returns 
 */
export function loadImages(images: { name: string, src: string }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, HTMLImageElement> {

    let bank: Map<string, HTMLImageElement> = new Map()
    let completed: { n: number } = { n: 0 }

    for (let image of images) {

        let img = document.createElement('img')
        img.src = image.src

        img.onload = function () {

            completed.n++

            incrementCallback(completed.n)

            if (completed.n == images.length)
                finishedCallback()

        }

        img.onerror = function (err) {

            console.error(`Could not load image "${image.name}" for source "${image.src}"`)

            console.error(err)

            completed.n++

            incrementCallback(completed.n)

            if (completed.n == images.length)
                finishedCallback()

        }

        bank.set(image.name, img)

    }

    if (images.length === 0)
        finishedCallback()

    return bank
}

export function loadSVGs(svgs: { name: string, src: string }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, { raw: string, image: HTMLImageElement }> {

    let bank: Map<string, { raw: string, image: HTMLImageElement }> = new Map()
    let completed: { n: number } = { n: 0 }

    for (let svg of svgs) {

        let data: { raw: string, image: HTMLImageElement } = { raw: '', image: null }

        fetch(svg.src)
            .then(res => {

                if (res.ok) return res.text()
                throw res

            })
            .then(svg => {

                data.raw = svg

                return svg

            })
            .then(SVGStringToImage)
            .then(image => {

                data.image = image

                completed.n++

                incrementCallback(completed.n)

            })
            .catch(err => {

                console.error(`Could not load image "${svg.name}" for source "${svg.src}"`)

                console.error(err)

                completed.n++

                incrementCallback(completed.n)

            })
            .finally(() => {

                if (completed.n == svgs.length)
                    finishedCallback()

            })

        bank.set(svg.name, data)

    }

    if (svgs.length === 0)
        finishedCallback()

    return bank

}

export class Sound {

    sounds: HTMLAudioElement[] = []
    volume: number = 1
    currentSound: HTMLAudioElement = null

    constructor(sounds: HTMLAudioElement[]) {

        this.sounds = sounds

    }

    play(): void {

        let sound = this.sounds[Math.floor(Math.random() * this.sounds.length)]
        sound.volume = this.volume

        if (this.currentSound)
            this.currentSound.pause()

        this.currentSound = sound
        this.currentSound.currentTime = 0
        this.currentSound.play()

    }

    setVolume(volume: number) { this.volume = volume }

}

export function loadSounds(sounds: { name: string, srcs: string[] }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, Sound> {

    let bank: Map<string, Sound> = new Map()
    let completed: { n: number } = { n: 0 }
    let toComplete: { n: number } = { n: 0 }

    for (let sound of sounds) {

        let snds = []

        for (let src of sound.srcs) {

            toComplete.n++

            let snd = document.createElement('audio')
            snd.src = src

            snd.oncanplay = function () {

                completed.n++

                incrementCallback(completed.n)

                if (completed.n == toComplete.n)
                    finishedCallback()

            }

            snd.onerror = function (err) {

                console.error(`Could not load sound "${sound.name}" for source "${src}"`)

                console.error(err)

                completed.n++

                incrementCallback(completed.n)

                if (completed.n == toComplete.n)
                    finishedCallback()

            }

            snds.push(snd)

        }

        bank.set(sound.name, new Sound(snds))

    }

    if (completed.n == toComplete.n)
        finishedCallback()

    return bank

}

let idCount = 0
export function id() { return ++idCount }

export function* range(min: number, max: number = null, step: number = 1) {

    if (!max) {
        max = min
        min = 0
    }

    for (let i = min; i < max; i += step)
        yield i

}

export function getCircularReplacer() {

    const seen = new WeakSet()

    return (key, value) => {

        if (typeof value === 'object' && value !== null) {

            if (seen.has(value)) return

            seen.add(value)

        }

        return value
    }

}

export function badclone(o: any): any { return JSON.parse(JSON.stringify(o, getCircularReplacer())) }