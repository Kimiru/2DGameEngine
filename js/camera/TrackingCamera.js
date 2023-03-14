import { Vector } from "../2DGameEngine.js";
import { Camera } from "./Camera.js";
export var TrackingCameraDisableMode;
(function (TrackingCameraDisableMode) {
    TrackingCameraDisableMode[TrackingCameraDisableMode["DISABLE"] = 0] = "DISABLE";
    TrackingCameraDisableMode[TrackingCameraDisableMode["DISABLE_ONCE"] = 1] = "DISABLE_ONCE";
    TrackingCameraDisableMode[TrackingCameraDisableMode["DONT_DISABLE"] = 2] = "DONT_DISABLE";
})(TrackingCameraDisableMode || (TrackingCameraDisableMode = {}));
export class TrackingCamera extends Camera {
    /**
     * The object the camera should track, if null, stops tracking
     */
    trackedObject = null;
    /**
     * The number of second it should theorycally take to the camera to travel the current distance from the camera to the object.
     */
    trackLag = 1;
    /**
     * The minimum speed at which the camera should travel when the speed reach do to the track lag is to slow
     */
    minTrackSpeed = 1;
    autoDisableTracking = TrackingCameraDisableMode.DONT_DISABLE;
    trackedZoom = null;
    zoomTrackLag = 1;
    zoomMinTrackSpeed = 1;
    autoDisableZoomTracking = TrackingCameraDisableMode.DONT_DISABLE;
    constructor() {
        super();
        this.updateEnabled = true;
    }
    update(dt) {
        if (this.trackedObject && (this.trackedObject instanceof Vector || this.scene === this.trackedObject.scene)) {
            let cameraWorldPosition = this.getWorldPosition();
            let objectWorldPosition = this.trackedObject instanceof Vector ? this.trackedObject.clone() : this.trackedObject.getWorldPosition();
            if (!cameraWorldPosition.equal(objectWorldPosition)) {
                let rawOffset = objectWorldPosition.clone().sub(cameraWorldPosition);
                let offset = rawOffset.clone().divS(this.trackLag);
                let len = offset.length();
                if (len < this.minTrackSpeed)
                    offset.normalize().multS(this.minTrackSpeed);
                offset.multS(dt);
                if (offset.length() > cameraWorldPosition.distanceTo(objectWorldPosition))
                    this.transform.translation.add(rawOffset);
                else
                    this.transform.translation.add(offset);
            }
            else {
                if (this.autoDisableTracking === TrackingCameraDisableMode.DISABLE_ONCE) {
                    this.trackedObject = null;
                    this.autoDisableTracking = TrackingCameraDisableMode.DONT_DISABLE;
                }
                else if (this.autoDisableTracking === TrackingCameraDisableMode.DISABLE)
                    this.trackedObject = null;
            }
        }
        if (this.trackedZoom) {
            if (this.transform.scale.x !== this.trackedZoom) {
                let rawZoomOffset = this.trackedZoom - this.transform.scale.x;
                let offset = rawZoomOffset / this.zoomTrackLag;
                let len = Math.abs(offset);
                if (len < this.zoomMinTrackSpeed)
                    offset = Math.sign(offset) * this.zoomMinTrackSpeed;
                offset *= dt;
                let trueDist = this.transform.scale.x - this.transform.scale.x * (1 + offset);
                if (Math.abs(trueDist) > Math.abs(rawZoomOffset))
                    this.transform.scale.set(this.trackedZoom, this.trackedZoom);
                else
                    this.transform.scale.multS(1 + offset);
            }
            else {
                if (this.autoDisableZoomTracking === TrackingCameraDisableMode.DISABLE_ONCE) {
                    this.trackedZoom = undefined;
                    this.autoDisableZoomTracking = TrackingCameraDisableMode.DONT_DISABLE;
                }
                else if (this.autoDisableZoomTracking === TrackingCameraDisableMode.DISABLE)
                    this.trackedZoom = undefined;
            }
        }
    }
}
