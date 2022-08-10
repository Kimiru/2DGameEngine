import { GameObject, NetworkGameObject, PerlinNoise, Rectangle } from "../js/2DGameEngine.js";

export class Player extends NetworkGameObject {

    static { this.inherit() }

    loop = 256

    perlin = new PerlinNoise(Math.floor(Math.random() * 1000), this.loop, this.loop, 1)

    t = 0

    constructor() {

        super()

        this.rect = new Rectangle(0, 0, 10, 10, true, 'red')

        this.add(this.rect)

        let r = Math.random() * Math.PI * 2

        this.position.set(Math.cos(r), Math.sin(r)).multS(Math.random() * 50)

    }

    update(dt) {

        this.t += dt
        this.t = this.t % this.loop

        this.position.set(this.perlin.get(this.t, 0), this.perlin.get(0, this.t))
        this.position.multS(50)

        this.sendUpdate(this.position.clone())

    }

    source(data) {

        this.updateEnabled = false

        this.position.copy(data.position)

    }

    recvUpdate(data) {

        this.position.copy(data)

    }

}
