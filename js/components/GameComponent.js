import { GameObject } from "../basics/GameObject.js";
export class GameComponent extends GameObject {
    unique = false;
    componentTag = 'basic-component';
    constructor() {
        super();
        this.addTag('component');
        this.addTag(this.componentTag);
    }
}
