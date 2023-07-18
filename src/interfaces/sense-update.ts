import { SenseDevice } from "./sense-devices";

export interface SenseUpdate {
    _stats: { [key: string]: number };
    c: number;
    channels: number[];
    d_w: number;
    defaultCost: number;
    devices: SenseDevice[];
    epoch: number;
    frame: number;
    grid_w: number;
    hz: number;
    voltage?: number[];
    w: number;
}
