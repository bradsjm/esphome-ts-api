export type SenseDevices = ReadonlyArray<SenseDevice>;

export interface SenseDevice {
    icon: string;
    id: string;
    location?: string;
    make?: string;
    model?: string;
    name: string;
    tags: Record<string, boolean | string | number | []>;
    w: number;
}
