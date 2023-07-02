import { Vector } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Camera } from "./Camera.js";
export declare enum TrackingCameraDisableMode {
    DISABLE = 0,
    DISABLE_ONCE = 1,
    DONT_DISABLE = 2
}
export declare class TrackingCamera extends Camera {
    /**
     * The object the camera should track, if null, stops tracking
     */
    trackedObject: GameObject | Vector | null;
    /**
     * The number of second it should theorycally take to the camera to travel the current distance from the camera to the object.
     */
    trackLag: number;
    /**
     * The minimum speed at which the camera should travel when the speed reach do to the track lag is to slow
     */
    minTrackSpeed: number;
    autoDisableTracking: TrackingCameraDisableMode;
    trackedZoom: number | null;
    zoomTrackLag: number;
    zoomMinTrackSpeed: number;
    autoDisableZoomTracking: TrackingCameraDisableMode;
    constructor();
    update(dt: number): void;
}
