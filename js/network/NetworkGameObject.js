import { Network, NetworkEvents } from "../../node_modules/@kimiru/peerjs-network/js/Network.js";
import { GameObject } from "../basics/GameObject.js";
import { GameScene } from "../basics/GameScene.js";
import { badclone } from '../basics/Utils.js';
export class NetworkGameObject extends GameObject {
    static list = new Map();
    static inherited = new Map();
    static pendingUpdates = [];
    static inherit() { NetworkGameObject.inherited.set(this.name, this); }
    static { this.inherit(); }
    static build(instruction) {
        let object = new (NetworkGameObject.inherited.get(instruction.proto))();
        object.owner = instruction.data.owner;
        object.secID = instruction.data.id;
        object.source(instruction.data);
        return object;
    }
    static register(object, owner, id) {
        if (!NetworkGameObject.list.has(owner))
            NetworkGameObject.list.set(owner, new Map());
        NetworkGameObject.list.get(owner).set(id, object);
    }
    static getRegistered(owner) {
        return [...(NetworkGameObject.list.get(owner)?.values() ?? [])];
    }
    static getRegisteredObject(owner, id) {
        if (!NetworkGameObject.isRegistered(owner, id))
            return null;
        return NetworkGameObject.list.get(owner).get(id);
    }
    static isRegistered(owner, id) {
        return NetworkGameObject.list.has(owner) && NetworkGameObject.list.get(owner).has(id);
    }
    static flushPendingUpdates() {
        Network.sendToAll({ event: 'Network$updates', data: NetworkGameObject.pendingUpdates });
        NetworkGameObject.pendingUpdates = [];
    }
    static hasPendingUpdates() { return this.pendingUpdates.length !== 0; }
    secID = null;
    synced = false;
    owner = null;
    syncedFunctions = [];
    constructor() {
        super();
    }
    source(data) { }
    getSource() { return badclone(this); }
    sync() {
        if (!window.Peer)
            return;
        if (!this.synced) {
            this.synced = true;
            this.owner = Network.id;
            this.secID = this.id;
            NetworkGameObject.register(this, Network.id, this.id);
        }
        if (this.owner !== Network.id)
            return;
        let parent = this.parent;
        let message = {
            event: 'Network$newobject',
            data: {
                data: this.getSource(),
                proto: this.constructor.name,
                owner: Network.id,
                scene: this.scene?.id,
                parent: {
                    owner: parent?.owner,
                    id: parent?.secID
                }
            }
        };
        Network.sendToAll(message);
    }
    syncCalls(...functionsName) {
        for (let name of functionsName) {
            this.syncedFunctions.push(name);
            let func = this[name];
            this[name] = function () {
                console.log('called synced function');
                this.sendUpdate({ event: 'CALLFUNCTION', func: name, args: arguments });
                func(...arguments);
            };
        }
    }
    sendUpdate(data) {
        let message = { owner: this.owner, id: this.secID, data };
        NetworkGameObject.pendingUpdates.push(message);
    }
    recvUpdate(data) { }
    syncMoveToObject(owner, id) {
        NetworkGameObject.getRegisteredObject(owner, id).add(this);
        let message = {
            move: true, owner: this.owner, id: this.secID, data: {
                scene: undefined,
                parent: { owner, id }
            }
        };
        NetworkGameObject.pendingUpdates.push(message);
    }
    syncMoveToScene(scene) {
        GameScene.list.get(scene).add(this);
        let message = {
            move: true, owner: this.owner, id: this.secID, data: {
                scene,
                parent: {}
            }
        };
        NetworkGameObject.pendingUpdates.push(message);
    }
    syncKill() {
        this.kill();
        let message = {
            kill: true, owner: this.owner, id: this.secID
        };
        NetworkGameObject.pendingUpdates.push(message);
        NetworkGameObject.list.get(this.owner).delete(this.secID);
    }
    isMine() { return this.owner === Network.id; }
}
{ // Auto NetworkGameObject Management
    function moveObjectTo(object, scene, parent) {
        if (scene) {
            if (!GameScene.list.has(scene))
                throw `Missing stored scene with id ${scene}`;
            GameScene.list.get(scene).add(object);
        }
        else {
            if (!NetworkGameObject.isRegistered(parent.owner, parent.id))
                throw `Missing move target for object ${object.owner}:${object.secID}`;
            NetworkGameObject.getRegisteredObject(parent.owner, parent.id).add(object);
        }
    }
    function killObject(owner, id) {
        if (NetworkGameObject.isRegistered(owner, id)) {
            let object = NetworkGameObject.getRegisteredObject(owner, id);
            object.kill();
            NetworkGameObject.list.get(owner).delete(object.secID);
        }
    }
    function createObject(message) {
        if (message.event === 'Network$newobject') {
            let { data, owner, scene, parent } = message.data;
            if (NetworkGameObject.isRegistered(owner, data.id))
                return;
            let object = NetworkGameObject.build(message.data);
            object.source(message.data.data);
            NetworkGameObject.register(object, owner, data.id);
            moveObjectTo(object, scene, parent);
        }
    }
    function newuser(message) {
        if (message.event === 'Network$newuser') {
            executeSync();
        }
    }
    function executeSync() {
        for (let object of NetworkGameObject.getRegistered(Network.id))
            object.sync();
    }
    function updates(message) {
        if (message.event === 'Network$updates') {
            let updates = message.data;
            for (let update of updates) {
                let object = NetworkGameObject.getRegisteredObject(update.owner, update.id);
                if (object) {
                    if (update.move) {
                        moveObjectTo(object, update.data.scene, update.data.parent);
                    }
                    else if (update.kill) {
                        killObject(update.owner, update.id);
                    }
                    else if (typeof update.data === 'object' && update.data.event === 'CALLFUNCTION') {
                        if (object.syncedFunctions.includes(message.data.func))
                            object[message.data.func](message.data.are);
                    }
                    else
                        object.recvUpdate(update.data);
                }
            }
        }
    }
    Network.on(NetworkEvents.PEER_OPENED, function (id) {
        let nulls = NetworkGameObject.list.get(null) ?? [];
        for (let [key, object] of nulls) {
            object.synced = false;
            object.owner = null;
            object.secID = null;
            object.sync();
        }
        NetworkGameObject.list.delete(null);
    });
    Network.on(NetworkEvents.CLIENT_P2P_OPENED, function () {
        executeSync();
    });
    Network.on(NetworkEvents.HOST_P2P_OPENED, function () {
        executeSync();
        Network.sendToAllExcept(this.id, { event: 'Network$newuser', data: this.id });
    });
    Network.on(NetworkEvents.CLIENT_P2P_CLOSED, function () {
        for (let [owner, objects] of NetworkGameObject.list) {
            if (owner === Network.id)
                continue;
            for (let [id, object] of objects)
                object.kill();
            NetworkGameObject.list.delete(owner);
        }
    });
    Network.on(NetworkEvents.HOST_P2P_CLOSED, function () {
        Network.sendToAll({ event: 'Network$killuser', data: this.id });
        let objects = NetworkGameObject.getRegistered(this.id);
        for (let object of objects)
            object.kill();
        NetworkGameObject.list.delete(this.id);
    });
    Network.on(NetworkEvents.CLIENT_P2P_RECEIVED_DATA, function (message) {
        if (typeof message !== 'object')
            return;
        createObject(message);
        newuser(message);
        updates(message);
    });
    Network.on(NetworkEvents.HOST_P2P_RECEIVED_DATA, function (message) {
        if (typeof message !== 'object')
            return;
        Network.sendToAllExcept(this.id, message);
        createObject(message);
        updates(message);
    });
}
