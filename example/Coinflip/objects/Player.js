import { GameObject, NetworkGameObject, PerlinNoise, PositionIntegrator, Rectangle } from "../js/2DGameEngine.js";

export class Player extends NetworkGameObject {

    static { this.inherit() }

    pi = new PositionIntegrator()

    state = 0

    static speed = 16 * 3

    constructor() {

        super()

        this.zIndex = 10

        this.addTag('player')

        this.rect = new Rectangle(0, 0, 16, 16, true, 'red')

        this.add(this.rect)

        this.sync()

    }

    update(dt) {

        if (this.state == 0) {

            this.pi.velocity.set(0, 0)

            if (this.engine.input.isDown('KeyW')) this.pi.velocity.addS(0, 1)
            if (this.engine.input.isDown('KeyS')) this.pi.velocity.addS(0, -1)
            if (this.engine.input.isDown('KeyD')) this.pi.velocity.addS(1, 0)
            if (this.engine.input.isDown('KeyA')) this.pi.velocity.addS(- 1, 0)

            if (!this.pi.velocity.nil()) this.pi.velocity.normalize().multS(Player.speed)

        }

        this.pi.integrate(dt)
        this.position.copy(this.pi.position)

    }

    source(data) {

        this.updateEnabled = false

        this.position.copy(data.position)

    }

    recvUpdate(data) {

        this.position.copy(data)

    }

}
