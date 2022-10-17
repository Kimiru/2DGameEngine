import { Button, Camera, CheckBox, GameScene, Label, Network, TextBox } from "../js/2DGameEngine.js";

class UnerlinedInput extends TextBox {

    constructor(size, width, placeholder) {

        super(size, width, 'dogicapixel', 'white')

        this.addTag('UnerlinedInput')

        this.placeholder = placeholder

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

class JoinUser extends Button {

    constructor() {

        super(10, 80, 'dogicapixel', 'orange')

        this.text = 'Rejoindre'
        // this.rect.display = true

        Network.on(Network.events.CLIENT_P2P_CONFIRMED_CONNECTION, () => {

            if (!this.engine) return

            this.engine.setScene(GameScene.list.get('MainScene'))

        })

    }

    onActive() {

        if (Network.hasConnections()) return


        let id = this.joinUserInput.text

        if (id === Network.id) return


        this.engine.soundBank.get('bip').play()

        Network.connectTo(id)



    }

}

class Host extends Button {

    usewl
    wl
    bl

    constructor() {

        super(10, 80, 'dogicapixel', 'orange')

        this.text = 'Héberger'
        // this.rect.display = true

    }

    onActive() {

        if (Network.hasConnections()) return

        Network.whitelist = this.wl.text.split(/\s/)
        Network.blacklist = this.bl.text.split(/\s/)
        Network.useWhitelist = this.usewl.checked

        this.engine.soundBank.get('bip')

        Network.enableHosting()

        this.engine.setScene(GameScene.list.get('MainScene'))

    }

}

class VolumeButton extends Button {

    volume

    constructor(volume, text) {

        super(6, 20, 'dogicapixel', 'lightblue', 'bip')
        this.text = text

        this.volume = volume
        // this.rect.display = true

    }

    onActive() {

        this.engine?.soundBank.forEach(sound => sound.setVolume(this.volume))

        localStorage.setItem('volume', this.volume)

    }

}

export class SelectionScene extends GameScene {

    id = 'SelectionScene'

    constructor() {

        super()

        let scale = 200 / 8
        let cam = new Camera()
        cam.transform.scale.set(scale, scale)
        this.camera = cam

        let userLabel = new Label(null, 'center', 15, 'dogicapixel', 'white', 'middle', 200)
        userLabel.update = function () { if (!this.text) this.text = Network.id }
        userLabel.transform.translation.set(0, 80)

        this.add(userLabel)

        let joinUserInput = new UnerlinedInput(10, 80, '-> Pseudo')
        let joinUserButton = new JoinUser()
        joinUserButton.joinUserInput = joinUserInput

        joinUserInput.transform.translation.set(-50, 50)
        joinUserButton.transform.translation.set(50, 50)

        this.add(joinUserInput)
        this.add(joinUserButton)

        let useWhitelistCheckbox = new CheckBox(true, 8, 'white', 'lightgray', 'bip')

        useWhitelistCheckbox.transform.translation.set(-40, 10)

        this.add(useWhitelistCheckbox)

        let whiteListLabel = new Label('Liste blanche', 'center', 6, 'dogicapixel', 'white', 'middle', 100)
        let blackListLabel = new Label('Liste noire', 'center', 6, 'dogicapixel', 'white', 'middle', 100)

        whiteListLabel.transform.translation.set(0, 10)
        blackListLabel.transform.translation.set(0, -20)

        this.add(whiteListLabel)
        this.add(blackListLabel)

        let allowedUsers = new UnerlinedInput(6, 150, '-> Pseudo autorisés')
        let bannedUsers = new UnerlinedInput(6, 150, '-> Pseudo bannis')

        allowedUsers.transform.translation.set(0, -2)
        bannedUsers.transform.translation.set(0, -32)

        this.add(allowedUsers)
        this.add(bannedUsers)

        let host = new Host()
        host.transform.translation.set(0, -60)

        host.usewl = useWhitelistCheckbox
        host.wl = allowedUsers
        host.bl = bannedUsers

        this.add(host)

        let volumeLabel = new Label('Volume son', 'center', 8, 'dogicapixel', 'white', 'middle', 200)

        volumeLabel.transform.translation.set(0, -80)

        this.add(volumeLabel)

        let volume0 = new VolumeButton(0, '0%')
        let volume25 = new VolumeButton(1 / 27, '25%')
        let volume50 = new VolumeButton(1 / 9, '50%')
        let volume75 = new VolumeButton(1 / 3, '75%')
        let volume100 = new VolumeButton(1, '100%')

        volume0.transform.translation.set(-50, -90)
        volume25.transform.translation.set(-25, -90)
        volume50.transform.translation.set(0, -90)
        volume75.transform.translation.set(25, -90)
        volume100.transform.translation.set(50, -90)

        this.add(volume0, volume25, volume50, volume75, volume100)

        this.store()

    }

}