import { Button, GameObject, GameScene, NetworkGameObject, Polygon, RenderingStyle, TrackingCamera, Transform, TransformMatrix, Vector } from "../js/2DGameEngine.js";
import { Door, Floor, LayerChanger, Wall, World, WorldEntity } from "./World.js";

class MenuButton extends Button {

    constructor() {

        super(1, 1, 'dogicapixel', 'white', 'bip', 0)

        this.text = ''

        this.addTag('menubutton')

    }

    update(dt) {

        super.update(dt)

        this.transform.translation.copy(this.engine.usableScale.divS(2).subS(.5, .5))

    }

    onActive() {
        this.engine.setScene(GameScene.list.get('MenuScene'))
    }


    draw(ctx) {

        ctx.fillStyle = this.currentColor
        ctx.fillRect(-.4, -.4, .8, .2)
        ctx.fillRect(-.4, -.1, .8, .2)
        ctx.fillRect(-.4, .2, .8, .2)

    }

}


export class MainScene extends GameScene {

    id = 'MainScene'

    renderingStyle = RenderingStyle.IN_VIEW

    constructor() {

        super()

        this.store()

        let cam = new TrackingCamera()

        this.camera = cam
        this.add(cam)

        let world = new World()
        this.add(world)

        let w1 = new WorldEntity()
        w1.transform.translation.set(2, 0)
        world.add(w1)

        let w2 = new WorldEntity()
        w2.transform.translation.set(-3, -1)
        world.add(w2)

        let w3 = new WorldEntity()
        w3.transform.translation.set(0, 0)
        world.add(w3)

        cam.trackLag = 1
        cam.minTrack = .01
        cam.transform.translation.set(0, 0)
        cam.zIndex = Number.MAX_SAFE_INTEGER

        for (let i = -1.5; i < 3; i++)
            world.add(new Wall(0, new Vector(0, i), 'h'))

        for (let i = -2.5; i < 6; i += 2)
            world.add(new Wall(0, new Vector(i, 0), 'v'))
        for (let l = 0; l < 2; l++)
            for (let i = -3; i < 4; i++)
                for (let j = -3; j < 4; j++) {

                    let floor = new Floor(l)
                    floor.transform.translation.set(i, j)

                    world.add(floor)

                }

        let door = new Door(0, new Vector(.5, 0), 'v')
        world.add(door)

        let layerChanger = new LayerChanger(0, 1, 1)
        layerChanger.transform.translation.set(4, 1)
        world.add(layerChanger)

        let layerChanger2 = new LayerChanger(1, -1, 1)
        layerChanger2.transform.translation.set(4, 1)
        world.add(layerChanger2)

        world.cook()

        let menuButton = new MenuButton()

        cam.add(menuButton)

    }

}