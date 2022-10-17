import { Button, Camera, GameObject, GameScene, Label, Network, TextBox } from "../js/2DGameEngine.js";

class LoginTextInput extends TextBox {

    constructor() {

        super(12, 200, 'dogicapixel', 'white')


        this.addTag('logintextinput')

        this.placeholder = '-> Pseudo'

        // this.rect.display = true

    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {

        ctx.fillStyle = 'white'
        ctx.fillRect(-this.width / 2, -this.fontSize / 2 - 3, this.width, 1)

        super.draw(ctx)

    }

}

class LoginButton extends Button {

    constructor() {

        super(8, 80, 'dogicapixel', 'orange')

        this.text = 'Me connecter'

        // this.rect.display = true

        Network.on(Network.events.UNAVAILABLE_ID, () => {

            this.engine.soundBank.get('wrong').play()

            this.scene.getTags('errorLabel')[0].text = 'Non disponible'

        })

        Network.on(Network.events.INVALID_ID, () => {

            this.engine.soundBank.get('wrong').play()

            this.scene.getTags('errorLabel')[0].text = 'Invalide'

        })

        Network.on(Network.events.PEER_OPENED, () => {

            if (!this.engine) return

            this.engine.setScene(GameScene.list.get('SelectionScene'))

            console.log('logedin')

        })

    }

    onActive() {

        if (!this.engine || Network.id) return

        this.engine.soundBank.get('bip').play()

        let id = this.scene.getTags('logintextinput')[0].text

        let obj = this.scene.getTags('errorLabel')[0]

        obj.text = ''
        if (id.length === 0) {

            this.engine.soundBank.get('wrong').play()

            return obj.text = 'Pseudo manquant'
        }

        if (/\s/.exec(id)) {

            this.engine.soundBank.get('wrong').play()

            return obj.text = 'Espaces non autorisés'

        }

        Network.start(id)

    }

}

export class LogScene extends GameScene {

    id = 'LogScene'

    constructor() {

        super()

        let scale = 200 / 8
        let cam = new Camera()
        cam.transform.scale.set(scale, scale)
        this.camera = cam

        this.add(new LoginTextInput())

        let title = new Label('Coinflip', 'center', 16, 'dogicapixel', 'white', 'middle', 200)
        title.transform.translation.set(0, 50)

        this.add(title)

        let button = new LoginButton()
        button.transform.translation.set(0, -20)

        this.add(button)

        let errorLabel = new Label('', 'center', 8, 'dogicapixel', 'red', 'middle', 200)
        errorLabel.addTag('errorLabel')
        errorLabel.transform.translation.set(0, -40)

        this.add(errorLabel)

        this.store()

    }

}