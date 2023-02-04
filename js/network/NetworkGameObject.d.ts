import { GameObject } from "../basics/GameObject.js";
export declare class NetworkGameObject extends GameObject {
    static list: Map<string, Map<number, NetworkGameObject>>;
    static inherited: Map<string, new () => NetworkGameObject>;
    static pendingUpdates: any[];
    static inherit(): void;
    static build(instruction: {
        data: any;
        proto: string;
    }): NetworkGameObject;
    static register(object: NetworkGameObject, owner: string, id: number): void;
    static getRegistered(owner: string): NetworkGameObject[];
    static getRegisteredObject(owner: string, id: number): NetworkGameObject;
    static isRegistered(owner: string, id: number): boolean;
    static flushPendingUpdates(): void;
    static hasPendingUpdates(): boolean;
    secID: number;
    synced: boolean;
    owner: string;
    syncedFunctions: string[];
    constructor();
    source(data: any): void;
    getSource(): any;
    sync(): void;
    syncCalls(...functionsName: string[]): void;
    sendUpdate(data: any): void;
    recvUpdate(data: any): void;
    syncMoveToObject(owner: string, id: number): void;
    syncMoveToScene(scene: string): void;
    syncKill(): void;
    isMine(): boolean;
}
