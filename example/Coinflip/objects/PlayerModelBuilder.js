import { ImageManipulator, SpriteSheet, TextureMapper } from "../js/2DGameEngine.js"

const defaultPlayerSource = {

    skinTone: 0,
    sexe: 'female',
    leftEye: 'brown',
    rightEye: 'red',

}

const skinTones = [
    'player_model_color_light'
]

// player_head
// player_legs
// player_bust
// player_model_colorchart
// player_model_color_light

export class PlayerModelBuilder {

    static getDefaultSource() { return { ...defaultPlayerSource } }

    static buildPlayer(source = defaultPlayerSource) {

        return new Promise((ok, ko) => {

            let imageBank = window.engine.imageBank

            let tileSize = 32

            let tw = 24
            let th = 12

            let output = new ImageManipulator(tileSize * 16, tileSize * 9)

            let playerHeadIM = ImageManipulator.fromImage(imageBank.get('player_head'))
            let playerBustIM = ImageManipulator.fromImage(imageBank.get('player_bust'))
            let playerLegsIM = ImageManipulator.fromImage(imageBank.get('player_legs'))
            let playerModelColorCHartIM = ImageManipulator.fromImage(imageBank.get('player_model_colorchart'))

            let skinTexture = ImageManipulator.fromImage(imageBank.get(skinTones[source.skinTone]))
            skinTexture.setPixel(2, 0, source.leftEye)
            skinTexture.setPixel(3, 0, source.rightEye)

            let head = TextureMapper.map(playerHeadIM, playerModelColorCHartIM, skinTexture)
            let bust = TextureMapper.map(playerBustIM, playerModelColorCHartIM, skinTexture)
            let legs = TextureMapper.map(playerLegsIM, playerModelColorCHartIM, skinTexture)


            let female = (source.sexe === 'female' ? th * 5 : 0)
            let legoff = [4, 20]
            let bustoff = [4, 13]
            let headoff = [4, 8]

            // idle and walk
            for (let x = 0; x < 9; x++)
                for (let y = 0; y < 4; y++) {

                    output.ctx.drawImage(legs.canvas, x * tw, y * th, tw, th, x * tileSize + legoff[0], y * tileSize + legoff[1], tw, th)
                    output.ctx.drawImage(head.canvas, x * tw, y * th, tw, th, x * tileSize + headoff[0], y * tileSize + headoff[1], tw, th)
                    output.ctx.drawImage(bust.canvas, x * tw, y * th + female, tw, th, x * tileSize + bustoff[0], y * tileSize + bustoff[1], tw, th)

                }

            // smoke 
            for (let x = 0; x < 10; x++) {

                let y = 4

                output.ctx.drawImage(legs.canvas, 0, 0, tw, th, x * tileSize + legoff[0], y * tileSize + legoff[1], tw, th)
                output.ctx.drawImage(head.canvas, x * tw, y * th, tw, th, x * tileSize + headoff[0], y * tileSize + headoff[1], tw, th)
                output.ctx.drawImage(bust.canvas, x * tw, y * th + female, tw, th, x * tileSize + bustoff[0], y * tileSize + bustoff[1], tw, th)

            }

            // eat 
            for (let x = 10; x < 12; x++) {

                let y = 4

                output.ctx.drawImage(legs.canvas, 9 * tw, 2 * th, tw, th, x * tileSize + legoff[0], y * tileSize + legoff[1], tw, th)
                output.ctx.drawImage(head.canvas, 0, 2 * th, tw, th, x * tileSize + headoff[0], y * tileSize + headoff[1] + 2, tw, th)
                output.ctx.drawImage(bust.canvas, x * tw, y * th + female, tw, th, x * tileSize + bustoff[0], y * tileSize + bustoff[1], tw, th)

            }

            // fight poses
            for (let x = 10; x < 13; x++)
                for (let y = 0; y < 4; y++) {

                    output.ctx.drawImage(legs.canvas, 0, y * th, tw, th, x * tileSize + legoff[0], y * tileSize + legoff[1], tw, th)
                    output.ctx.drawImage(head.canvas, 0, y * th, tw, th, x * tileSize + headoff[0], y * tileSize + headoff[1], tw, th)
                    output.ctx.drawImage(bust.canvas, x * tw, y * th + female, tw, th, x * tileSize + bustoff[0], y * tileSize + bustoff[1], tw, th)


                }

            // hold_idle and hold_walk
            for (let x = 0; x < 9; x++)
                for (let y = 0; y < 4; y++) {

                    let down = ((x - 1) % 4 < 2 ? 1 : 0) + (x != 0 ? 1 : 0)
                    let left = (y == 1 ? 1 : 0) + (y == 3 ? -1 : 0)

                    output.ctx.drawImage(legs.canvas, x * tw, y * th, tw, th, x * tileSize + legoff[0], y * tileSize + legoff[1] + 5 * tileSize, tw, th)
                    output.ctx.drawImage(head.canvas, 0, y * th, tw, th, x * tileSize + headoff[0] + left, y * tileSize + headoff[1] + 5 * tileSize + down - 2 + (y & 1 ? 0 : 1), tw, th)
                    output.ctx.drawImage(bust.canvas, 9 * tw, y * th + female, tw, th, x * tileSize + bustoff[0] + left, y * tileSize + bustoff[1] + 5 * tileSize + down - 2, tw, th)

                }

            { // swim

                let x = 8,
                    y = 1,
                    w = 8,
                    h = 7

                for (let line = 0; line < 4; line++)
                    output.ctx.drawImage(head.canvas, x, line * th + y, w, h, 9 * tileSize + 12, line * tileSize + 23, w, h)


            }



            // output.download()

            let image = output.getImage()

            image.onload = () => {

                let spriteSheet = new SpriteSheet(image, { cellWidth: tileSize, cellHeight: tileSize })

                function line(n) { return n * spriteSheet.horizontalCount }

                spriteSheet.saveLoop('idle_down', 0 + line(0), 1)
                spriteSheet.saveLoop('idle_right', 0 + line(1), 1)
                spriteSheet.saveLoop('idle_up', 0 + line(2), 1)
                spriteSheet.saveLoop('idle_left', 0 + line(3), 1)

                spriteSheet.saveLoop('walk_down', 1 + line(0), 8)
                spriteSheet.saveLoop('walk_right', 1 + line(1), 8)
                spriteSheet.saveLoop('walk_up', 1 + line(2), 8)
                spriteSheet.saveLoop('walk_left', 1 + line(3), 8)

                spriteSheet.saveLoop('smoking_idle', 0 + line(4), 1)
                spriteSheet.saveLoop('smoking_smoke', 1 + line(4), 3)
                spriteSheet.saveLoop('smoking_active', 4 + line(4), 6)

                spriteSheet.saveLoop('hold_idle_down', 0 + line(5), 1)
                spriteSheet.saveLoop('hold_idle_right', 0 + line(6), 1)
                spriteSheet.saveLoop('hold_idle_up', 0 + line(7), 1)
                spriteSheet.saveLoop('hold_idle_left', 0 + line(8), 1)

                spriteSheet.saveLoop('hold_walk_down', 1 + line(5), 8)
                spriteSheet.saveLoop('hold_walk_right', 1 + line(6), 8)
                spriteSheet.saveLoop('hold_walk_up', 1 + line(7), 8)
                spriteSheet.saveLoop('hold_walk_left', 1 + line(8), 8)

                spriteSheet.saveLoop('guard_down', 10 + line(0), 1)
                spriteSheet.saveLoop('guard_right', 10 + line(1), 1)
                spriteSheet.saveLoop('guard_up', 10 + line(2), 1)
                spriteSheet.saveLoop('guard_left', 10 + line(3), 1)

                spriteSheet.saveLoop('punch_down', 11 + line(0), 1)
                spriteSheet.saveLoop('punch_right', 11 + line(1), 1)
                spriteSheet.saveLoop('punch_up', 11 + line(2), 1)
                spriteSheet.saveLoop('punch_left', 11 + line(3), 1)

                spriteSheet.saveLoop('counter_down', 12 + line(0), 1)
                spriteSheet.saveLoop('counter_right', 12 + line(1), 1)
                spriteSheet.saveLoop('counter_up', 12 + line(2), 1)
                spriteSheet.saveLoop('counter_left', 12 + line(3), 1)


                ok(spriteSheet)

            }

        })
    }

}