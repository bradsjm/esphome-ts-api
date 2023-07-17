export interface SenseUpdate {
    _stats: { [key: string]: number };
    c: number;
    channels: number[];
    d_w: number;
    defaultCost: number;
    deltas: Delta[];
    devices: Device[];
    epoch: number;
    frame: number;
    grid_w: number;
    hz: number;
    power_flow: PowerFlow;
    voltage?: number[];
    w: number;
}

export interface Delta {
    channel: number;
    frame: number;
    start_frame: number;
    w: number;
}

export interface Device {
    ao_st?: boolean;
    ao_w?: number;
    attrs: string[];
    icon: string;
    id: string;
    name: string;
    tags: Tags;
    w: number;
}

export interface Tags {
    Alertable?: string;
    AlwaysOn?: string;
    ControlCapabilities?: string[];
    DCMActive?: string;
    DUID?: string;
    DateCreated?: Date;
    DefaultUserDeviceType: string;
    DeployToMonitor?: string;
    DeviceListAllowed: string;
    IntegrationType?: string;
    ModelCreatedVersion?: string;
    ModelUpdatedVersion?: string;
    NameUserGuess?: string;
    OriginalName?: string;
    PeerNames?: PeerName[];
    Pending?: string;
    PreselectionIndex?: number;
    Revoked?: string;
    SSIEnabled?: string;
    SSIModel?: string;
    TimelineAllowed: string;
    TimelineDefault?: string;
    Type?: string;
    UserDeletable?: string;
    UserDeviceType: string;
    UserDeviceTypeDisplayString: string;
    UserEditable: string;
    UserEditableMeta?: string;
    UserMergeable: string;
    UserShowBubble?: string;
    UserShowInDeviceList: string;
    name_useredit?: string;
}

export interface PeerName {
    Icon: string;
    Name: string;
    Percent: number;
    UserDeviceType: string;
    UserDeviceTypeDisplayString: string;
}

export interface PowerFlow {
    grid: string[];
}
