import { Camera, GameComponent } from "./2DGameEngine.js";
export class CameraDragComponent extends GameComponent {
    componentTag = 'camera-drag';
    unique = true;
    static leftButton = 0;
    static rightButton = 1;
    static middleButton = 2;
    button;
    scrollZoomEnabled;
    constructor(button = 1, scrollZoomEnabled = true) {
        super();
        this.button = button;
        this.scrollZoomEnabled = scrollZoomEnabled;
    }
    onAdd() {
        if (!this.parent || !(this.parent instanceof Camera))
            throw 'Parent of this component must be a Camera';
    }
    #target = null;
    update(dt) {
        let mouse = this.input.mouse;
        let button = false;
        if (this.button === 0)
            button = mouse.left;
        else if (this.button === 1)
            button = mouse.right;
        else if (this.button === 2)
            button = mouse.middle;
        if (button) {
            if (!this.#target)
                this.#target = mouse.position.clone();
            let delta = this.#target.clone().sub(mouse.position);
            this.parent.transform.translation.add(delta);
        }
        else
            this.#target = null;
        if (this.scrollZoomEnabled && mouse.scroll) {
            let scale = 1.1 ** mouse.scroll;
            let delta = mouse.position.clone().sub(this.parent.transform.translation);
            this.parent.transform.translation.add(delta);
            this.parent.transform.scale.multS(scale);
            this.parent.transform.translation.sub(delta.multS(scale));
        }
    }
}
