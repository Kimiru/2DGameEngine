import { SVGStringToImage } from "../images/Utils.js"

export type imageBank = Map<string, HTMLImageElement>

/**
 * loads multiple images and use callbacks for progression checks and at the end
 * 
 * @param {{ name: string, src: string }[]} images 
 * @param {(completed:number) => void} incrementCallback 
 * @param {() => void}finishedCallback 
 * @returns 
 */
export function loadImages(images: { name: string, src: string }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): imageBank {

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

export type svgBank = Map<string, { raw: string, image: HTMLImageElement }>

export function loadSVGs(svgs: { name: string, src: string }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): svgBank {

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

    volume: number = 1

    soundsFifo: HTMLAudioElement[][] = []
    currentSound: number = 0

    constructor(soundsFifo: HTMLAudioElement[][]) {

        this.soundsFifo = soundsFifo

    }

    play(): void {

        let sounds = this.soundsFifo[this.currentSound]

        for (let sound of sounds)
            sound.pause()

        let sound = sounds[Math.floor(Math.random() * sounds.length)]

        sound.volume = this.volume
        sound.currentTime = 0
        sound.play()

        this.currentSound += 1
        this.currentSound %= this.soundsFifo.length

    }

    pause(): void {

        for (let sounds of this.soundsFifo)
            for (let sound of sounds)
                sound.pause()

    }

    setVolume(volume: number) { this.volume = volume }

}

export type soundBank = Map<string, Sound>

export function loadSounds(sounds: { name: string, srcs: string[], backup?: number }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): soundBank {

    let bank: Map<string, Sound> = new Map()
    let completed: { n: number } = { n: 0 }
    let toComplete: { n: number } = { n: 0 }

    for (let sound of sounds) {

        let backups = []

        for (let index = 0; index < (sound.backup ?? 1); index++) {

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

            backups.push(snds)

        }

        bank.set(sound.name, new Sound(backups))

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

export function HSLToRGB(h: number, s: number, l: number): [number, number, number] {

    s /= 100
    l /= 100

    let k = n => (n + h / 30) % 12
    let a = s * Math.min(l, 1 - l)
    let f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]

}

export function RGBToHSL(r: number, g: number, b: number): [number, number, number] {

    r /= 255
    g /= 255
    b /= 255

    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0

    return [
        Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h),
        Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)),
        Math.round((100 * (2 * l - s)) / 2),
    ]

}

export function HexColorToRGB(hexColor: string): [number, number, number] {

    let match: RegExpExecArray

    if ((match = /^#?([0-9a-fA-F]{3})$/.exec(hexColor))) {

        return match[1]
            .split('')
            .map(v => v + v)
            .map(v => parseInt(v, 16)) as [number, number, number]

    }

    if ((match = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hexColor))) {

        return match.slice(1, 4).map(v => parseInt(v, 16)) as [number, number, number]

    }

    return [0, 0, 0]

}

export function RBGToHexColor(r: number, g: number, b: number): string {

    let rStr = r.toString(16)
    if (rStr.length === 1) rStr = '0' + rStr

    let gStr = g.toString(16)
    if (gStr.length === 1) gStr = '0' + gStr

    let bStr = b.toString(16)
    if (bStr.length === 1) bStr = '0' + bStr

    return `#${rStr}${gStr}${bStr}`

}

export type stringable = string | (() => string)

export function resolveStringable(value: stringable) {
    return typeof value === 'string' ? value : value()
}