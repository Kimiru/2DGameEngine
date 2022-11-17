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
