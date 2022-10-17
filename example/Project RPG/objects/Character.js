import { Drawable, NetworkGameObject, Path } from "../js/2DGameEngine.js";
import { WorldEntity } from "./World.js";

export class Character extends WorldEntity {

    image
    path = null

    zIndex = 0

    constructor() {

        super()

        this.image = new Drawable(window.engine.imageBank.get('mlp16'))
        this.image.scale.set(.7, .7)
        this.add(this.image)

    }

    update(dt) {


        let mouse = this.input.mouse

        if (mouse.leftClick && !this.path) {

            let myWorldPosition = this.getWorldPosition()
            let delta = mouse.position.clone().round().sub(myWorldPosition)

            console.log(myWorldPosition, delta)

            let path = new Path([this.position.clone(), this.position.clone().add(delta)])
            this.path = path

            console.log(path)

        }



    }



    draw(ctx) {

        // this.image.draw(ctx)

    }

}