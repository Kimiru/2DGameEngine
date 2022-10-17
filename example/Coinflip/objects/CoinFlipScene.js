import { Drawable, GameObject, GameScene, Network, SpriteSheet, Timer } from "../js/2DGameEngine.js";
import { NPC, Player } from "./Player.js"
import { PlayerModelBuilder } from "./PlayerModelBuilder.js";

export class CoinFlipScene extends GameScene {

    id = 'CoinFlipScene'

    spriteSheet
    timer = new Timer()

    constructor() {

        super()

        let player = new Player()
        player.sync()

        let source = PlayerModelBuilder.getDefaultSource()
        source.sexe = 'male'
        let npc = new NPC(source, true)
        npc.position.set(40, 0)

        npc.brain = function (dt) {

            if (!this.isSmoking())
                this.smoke()

        }


        this.add(player)
        this.add(npc)

        this.store()

        let me = this

        Network.on(Network.events.CLIENT_P2P_CLOSED, function () {

            if (!me.engine) return

            setTimeout(() => {
                if (!me.engine) return
                Network.connectTo(this.id)
            }, 500)

        })


    }

    onSet() {

    }

    update() {

        if (this.engine.input.isPressed('Escape')) {

            Network.closeAllConnections()
            Network.disableHosting(false)

            this.engine.setScene(GameScene.list.get('SelectionScene'))

        }

    }

}