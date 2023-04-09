import { GameObject, WFCIndexToPosition, WFCPositionInSolution, WaveFunctionCollapse, drawText } from "../../../js/2DGameEngine.js"

export class SolutionDrawer extends GameObject {

    solution
    wfc

    /**
     * 
     * @param {import("../../../js/2DGameEngine.js").WFCSolution} solution 
     * @param {WaveFunctionCollapse} wfc
     */
    constructor(solution, wfc) {

        super()

        this.solution = solution
        this.wfc = wfc

    }

    update(dt) {

        let input = this.input
        let mouse = input.mouse

        if (mouse.leftClick) {

            mouse.position.addS(this.solution.size[0] / 2, this.solution.size[1] / 2).addS(-.5, -.5).round()

            if (WFCPositionInSolution(this.solution, mouse.position.x, mouse.position.y))
                this.wfc.collapse(this.solution, mouse.position.x, mouse.position.y)
        }

        if (input.isPressed('Space'))
            this.wfc.fullCollapse(this.solution)
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {

        for (let [index, cell] of this.solution.cells.entries()) {

            let [x, y] = WFCIndexToPosition(this.solution, index)

            x += -this.solution.size[0] / 2 + .5
            y += -this.solution.size[1] / 2 + .5

            if (cell.solved) {

                ctx.save()
                ctx.translate(x, y)

                switch (cell.options[0]) {
                    case 0:
                        ctx.fillStyle = 'blue'
                        ctx.fillRect(-.5, -.5, 1, 1)
                        break
                    case 1:
                        ctx.fillStyle = '#E2CA76'
                        ctx.fillRect(-.5, -.5, 1, 1)
                        break
                    case 2:
                        ctx.fillStyle = '#5cac2d'
                        ctx.fillRect(-.5, -.5, 1, 1)
                        break
                    case 3:
                        ctx.fillStyle = '#006800'
                        ctx.fillRect(-.5, -.5, 1, 1)
                        ctx.fillStyle = '#705a46'
                        ctx.fillRect(-.05, -.4, .1, .5)
                        ctx.fillStyle = '#2b5d34'
                        ctx.beginPath()
                        ctx.moveTo(-.2, -.1)
                        ctx.lineTo(0, .3)
                        ctx.lineTo(.2, -.1)
                        ctx.closePath()
                        ctx.fill()
                        break
                    case 4:
                        ctx.fillStyle = '#006800'
                        ctx.fillRect(-.5, -.5, 1, 1)
                        ctx.fillStyle = 'gray'
                        ctx.beginPath()
                        ctx.moveTo(-.4, -.3)
                        ctx.lineTo(0, .3)
                        ctx.lineTo(.4, -.3)
                        ctx.closePath()
                        ctx.fill()
                        break
                }

                ctx.restore()

            } else
                drawText(ctx, cell.options.join(','), {
                    size: .2, color: cell.solved ? 'lime' : 'white', maxWidth: 1, posX: x, posY: y
                })

        }

    }

}