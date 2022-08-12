import { GameScene, Network } from "../js/2DGameEngine.js";
import { Player } from "./Player.js"

export class CoinFlipScene extends GameScene {

    id = 'CoinFlipScene'

    constructor() {

        super()

        let player = new Player()
        player.sync()

        this.add(player)

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

    update() {

        if (this.engine.input.isPressed('Escape')) {

            Network.closeAllConnections()
            Network.disableHosting(false)

            this.engine.setScene(GameScene.list.get('SelectionScene'))

        }

    }

}