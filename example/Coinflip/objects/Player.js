import { NetworkGameObject, PositionIntegrator, Rectangle, Segment, SpriteSheet, Timer, Vector } from "../js/2DGameEngine.js";
import { PlayerModelBuilder } from './PlayerModelBuilder.js'

const IDLE = 0
const WALKING = 1
const SMOKING = 2
const HOLDING = 3

const smokeTiming = [100, 1000, 200, 200, 200, 200, 200]

const dirToVec = {

    'down': new Vector(0, -1),
    'right': new Vector(1, 0),
    'up': new Vector(0, 1),
    'left': new Vector(-1, 0),

}

export class NPC extends NetworkGameObject {

    static { this.inherit() }

    positionIntegrator = new PositionIntegrator()

    state_0 = IDLE
    state_1 = null

    timer_0 = new Timer()
    timer_1 = new Timer()

    itemHeld = null
    itemStored = null
    watered = false
    guarding = false

    dir = 'down'

    zIndex = 10

    source = null

    pv

    static MaxPV = 5
    static speed = 16 * 3
    static scale = new Vector(60, 60)

    constructor(source = PlayerModelBuilder.getDefaultSource(), updateEnabledAfterLoading = false) {

        super()

        this.pv = NPC.MaxPV

        this.source = source

        this.addTag('TakeDamage')
        this.addTag('NPC')

        this.rect = new Rectangle(0, 0, NPC.scale.x / 2, NPC.scale.y / 2, true, 'red')
        this.add(this.rect)

        if (this.source)
            this.reskin(source, () => { this.updateEnabled = updateEnabledAfterLoading })

        this.updateEnabled = false
        this.drawAfterChildren()

    }

    reskin(source = PlayerModelBuilder.getDefaultSource(), then = function () { }) {

        PlayerModelBuilder.buildPlayer(this.source).then((spriteSheet) => {

            this.spriteSheet = spriteSheet

            this.spriteSheet.scale.copy(NPC.scale)
            this.spriteSheet.zIndex = 1

            this.add(this.spriteSheet)

            this.spriteSheet.position.y = (14 / 32) * NPC.scale.y

            then()

        })

    }

    hit(damages, source) {

        if (this.isCounter() && this.timer_0.lessThan(500)) {

            this.punch()

        } else this.pv -= damages

        this.pv = Math.max(0, this.pv)
        console.log(this.pv)

        if (this.pv <= 0) this.die()

    }

    heal(pv) {

    }

    die() { }

    idle() { }

    isIdle(item = false, smoke = false) {

        if (this.isSmoking())
            return smoke

        if (this.isHoldingIdle())
            return item

        return this.spriteSheet.isLoop('idle_down') ||
            this.spriteSheet.isLoop('idle_right') ||
            this.spriteSheet.isLoop('idle_up') ||
            this.spriteSheet.isLoop('idle_left')

    }

    walk() { }

    isMoving() {

        return this.spriteSheet.isLoop('walk_down') ||
            this.spriteSheet.isLoop('walk_right') ||
            this.spriteSheet.isLoop('walk_up') ||
            this.spriteSheet.isLoop('walk_left') ||
            this.spriteSheet.isLoop('hold_walk_down') ||
            this.spriteSheet.isLoop('hold_walk_right') ||
            this.spriteSheet.isLoop('hold_walk_up') ||
            this.spriteSheet.isLoop('hold_walk_left')

    }

    hold(item) {

        this.itemHeld = item
    }

    dropItem() { }

    isHoldingIdle() {

        return this.spriteSheet.isLoop('hold_idle_down') ||
            this.spriteSheet.isLoop('hold_idle_right') ||
            this.spriteSheet.isLoop('hold_idle_up') ||
            this.spriteSheet.isLoop('hold_idle_left')

    }

    smoke() {

        this.spriteSheet.useLoop('smoking_idle')
        this.timer_0.reset()

    }

    isSmoking() {

        return this.spriteSheet.isLoop('smoking_idle') ||
            this.spriteSheet.isLoop('smoking_smoke') ||
            this.spriteSheet.isLoop('smoking_active')

    }

    swim() { }

    guard() {

        if (this.itemHeld) this.dropItem()

        this.spriteSheet.useLoop(`guard_${this.dir}`)
        this.timer_1.reset()
        this.guarding = true

    }

    isGuarding() {

        return this.spriteSheet.isLoop(`guard_${this.dir}`)

    }

    punch() {

        this.timer_0.reset()
        this.timer_1.reset()
        this.spriteSheet.useLoop(`punch_${this.dir}`)

        let wp = this.getWorldPosition()
        let dir = dirToVec[this.dir].clone().multS(NPC.scale.x).rotate(this.getWorldRotation())

        let ray = new Segment(wp, wp.clone().add(dir))

        for (let object of this.scene.getTags('TakeDamage')) {

            if (object === this) continue

            let segs = object.rect.getWorldSegment()

            for (let seg of segs) if (ray.intersect(seg)) {

                object.hit(1, this)

                break

            }

        }

    }

    isPunching() {

        return this.spriteSheet.isLoop(`punch_${this.dir}`)

    }

    counter() {

        this.timer_0.reset()
        this.timer_1.reset()
        this.spriteSheet.useLoop(`counter_${this.dir}`)

    }

    isCounter() {

        return this.spriteSheet.isLoop(`counter_${this.dir}`)

    }

    plouf() {

        this.watered = true
        this.itemHeld = null

    }

    noplouf() {

        this.watered = false

    }





    brain(dt) { }

    update(dt) {

        if (!this.spriteSheet) return


        if (!this.positionIntegrator.velocity.nil()) {

            if (this.watered) {

                if (this.positionIntegrator.velocity.x > 0)
                    this.spriteSheet.useLoop('hold_walk_right', this.spriteSheet.getLoopIndex())
                else if (this.positionIntegrator.velocity.x < 0)
                    this.spriteSheet.useLoop('hold_walk_left', this.spriteSheet.getLoopIndex())
                else if (this.positionIntegrator.velocity.y > 0)
                    this.spriteSheet.useLoop('hold_walk_up', this.spriteSheet.getLoopIndex())
                else if (this.positionIntegrator.velocity.y < 0)
                    this.spriteSheet.useLoop('hold_walk_down', this.spriteSheet.getLoopIndex())

            }
            else {
                if (this.itemHeld) {

                    if (this.positionIntegrator.velocity.x > 0)
                        this.spriteSheet.useLoop('hold_walk_right', this.spriteSheet.getLoopIndex())
                    else if (this.positionIntegrator.velocity.x < 0)
                        this.spriteSheet.useLoop('hold_walk_left', this.spriteSheet.getLoopIndex())
                    else if (this.positionIntegrator.velocity.y > 0)
                        this.spriteSheet.useLoop('hold_walk_up', this.spriteSheet.getLoopIndex())
                    else if (this.positionIntegrator.velocity.y < 0)
                        this.spriteSheet.useLoop('hold_walk_down', this.spriteSheet.getLoopIndex())

                } else {

                    if (this.positionIntegrator.velocity.x > 0)
                        this.spriteSheet.useLoop('walk_right', this.spriteSheet.getLoopIndex())
                    else if (this.positionIntegrator.velocity.x < 0)
                        this.spriteSheet.useLoop('walk_left', this.spriteSheet.getLoopIndex())
                    else if (this.positionIntegrator.velocity.y > 0)
                        this.spriteSheet.useLoop('walk_up', this.spriteSheet.getLoopIndex())
                    else if (this.positionIntegrator.velocity.y < 0)
                        this.spriteSheet.useLoop('walk_down', this.spriteSheet.getLoopIndex())

                }

                if (this.timer_0.greaterThan(50) && this.spriteSheet.getLoopIndex() % 2 == 0) {
                    this.spriteSheet.next()
                    this.timer_0.reset()
                }

                if (this.timer_0.greaterThan(100) && this.spriteSheet.getLoopIndex() % 2 == 1) {
                    this.spriteSheet.next()
                    this.timer_0.reset()
                }

            }



        }
        else {

            if (this.isPunching()) {
                if (this.timer_0.greaterThan(200))
                    this.spriteSheet.useLoop(`guard_${this.dir}`)
            }

            else if (this.isCounter()) {

                this.timer_1.reset()

            }

            else if (this.guarding && !this.spriteSheet.isLoop(`guard_${this.dir}`)) {

                this.spriteSheet.useLoop(`guard_${this.dir}`)

            }



            if (this.isMoving() || (this.isGuarding() && !this.guarding)) {

                this.spriteSheet.setLoop(this.spriteSheet.indexToXY(this.spriteSheet.loopOrigin)[1] * this.spriteSheet.horizontalCount, 1)

            }

            if (this.isSmoking()) { // smoking animation

                if (this.spriteSheet.isLoop('smoking_idle') && this.timer_0.greaterThan(200)) {

                    this.spriteSheet.useLoop('smoking_smoke')
                    this.timer_0.reset()

                }

                if (this.spriteSheet.isLoop('smoking_smoke') && this.timer_0.greaterThan(200)) {
                    if (this.spriteSheet.getLoopIndex() == 2 && Math.random() > .75)
                        this.spriteSheet.useLoop('smoking_active')

                    else
                        this.spriteSheet.next()

                    this.timer_0.reset()
                }

                if (this.spriteSheet.isLoop('smoking_active') && this.timer_0.greaterThan(smokeTiming[this.spriteSheet.getLoopIndex()])) {

                    if (this.spriteSheet.getLoopIndex() == 5)
                        this.spriteSheet.useLoop('smoking_smoke')

                    else
                        this.spriteSheet.next()

                    this.timer_0.reset()

                }

            }

        }

        if (this.guarding && this.timer_1.greaterThan(3000)) {

            this.guarding = false


        }

        if (this.isMine()) {

            this.brain(dt)

            if (this.positionIntegrator.velocityHasChanged())
                this.sendUpdate(this.message(0, {
                    pos: this.positionIntegrator.clone(),
                    vel: this.positionIntegrator.velocity.clone()
                }))


        }

    }

    physics(dt) {

        this.positionIntegrator.integrate(dt)

        this.position.copy(this.positionIntegrator.position)

        if (this.positionIntegrator.velocity.x > 0) this.dir = 'right'
        else if (this.positionIntegrator.velocity.x < 0) this.dir = 'left'
        else if (this.positionIntegrator.velocity.y < 0) this.dir = 'down'
        else if (this.positionIntegrator.velocity.y > 0) this.dir = 'up'

    }

    draw(ctx) {

        if (this.pv != NPC.MaxPV) {

            ctx.fillStyle = 'red'

            ctx.fillRect(-NPC.scale.x / 2, NPC.scale.y / 2, this.pv / NPC.MaxPV * NPC.scale.x, NPC.scale.y / 16)

        }

    }

    message(event, data) {

        return { event, data }

    }

    recvUpdate(message = { event: 0, data: {} }) {

        if (message.event === 0) {

            this.positionIntegrator.position.copy(message.data.pos)
            this.positionIntegrator.velocity.copy(message.data.vel)

        }

    }

}

export class Player extends NPC {

    angle = 0

    static { this.inherit() }

    constructor(source = PlayerModelBuilder.getDefaultSource()) {

        super(source, true)

        this.removeTag('NPC')
        this.addTag('Player')


    }


    brain(dt) {

        let input = this.input

        let z = input.isDown('KeyW')
        let q = input.isDown('KeyA')
        let s = input.isDown('KeyS')
        let d = input.isDown('KeyD')
        let space = input.isDown('Space')
        let t = input.isPressed('KeyT')
        let a = input.isPressed('KeyQ')
        let e = input.isPressed('KeyE')

        if (this.isIdle(false, false) && t) this.smoke()

        this.positionIntegrator.velocity.set(0, 0)
        if ((this.isIdle(true, true) || this.isMoving() || this.isGuarding()) && (z || q || s || d)) {

            if (z) this.positionIntegrator.velocity.y += 1
            if (q) this.positionIntegrator.velocity.x -= 1
            if (s) this.positionIntegrator.velocity.y -= 1
            if (d) this.positionIntegrator.velocity.x += 1

            if (!this.positionIntegrator.velocity.nil()) this.positionIntegrator.velocity.normalize()

            this.positionIntegrator.velocity.multS(NPC.speed * (this.itemHeld ? (this.itemHeld.large ? .6 : .9) : 1))

        }

        if (this.guarding && this.isGuarding() && a) return this.punch()
        if (this.guarding && this.isGuarding() && space) return this.counter()
        if (this.isCounter() && !space) return this.guard()
        if (this.isIdle(true, true) && !this.guarding && a) return this.guard()


    }

    source(data) {

        this.updateEnabled = false

        this.position.copy(data.position)

    }

    recvUpdate(data) {

        this.position.copy(data)

    }

    update(dt) {

        super.update(dt)

        this.angle += dt

    }

    draw(ctx) {

        // ctx.fillStyle = 'white'
        // ctx.fillRect(-50, -50, 100, 100)

        ctx.save()

        ctx.fillStyle = 'white'

        let c = Math.cos(this.angle)
        let s = Math.sin(this.angle)

        ctx.transform(1, 0, c, s, 0, 0);

        ctx.fillRect(0, 0, 10, 10)

        ctx.restore()

        ctx.save()


        ctx.restore()

    }

}
