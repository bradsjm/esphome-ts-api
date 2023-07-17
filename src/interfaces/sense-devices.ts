import { ControlCapability, IntegrationType } from "../enums";

export type SenseDevices = ReadonlyArray<SenseDevice>;

export interface SenseDevice {
    icon: string;
    id: string;
    location?: string;
    make?: string;
    model?: string;
    name: string;
    tags: Tags;
}

export interface Tags {
    Alertable?: string;
    AlwaysOn?: string;
    CombinedDevices?: string;
    ControlCapabilities?: ControlCapability[];
    DCMActive?: string;
    DUID?: string;
    DateCreated?: Date;
    DateFirstUsage?: Date;
    DateSuperseded?: Date;
    DefaultMake?: string;
    DefaultModel?: string;
    DefaultUserDeviceType: string;
    DeployToMonitor?: string;
    DeviceListAllowed: string;
    IntegratedDeviceType?: string;
    IntegrationType?: IntegrationType;
    ModelCreatedVersion?: string;
    ModelRevokedVersion?: string;
    ModelUpdatedVersion?: string;
    NameUserGuess?: string;
    OriginalName?: string;
    PeerNames?: PeerName[];
    Pending?: string;
    PreselectionIndex?: number;
    Revoked?: string;
    SSIEnabled?: string;
    SSIModel?: string;
    SmartPlugModel?: string;
    TimelineAllowed: string;
    TimelineDefault?: string;
    Type?: string;
    UserDeletable?: string;
    UserDeleted?: string;
    UserDeviceType?: string;
    UserDeviceTypeDisplayString: string;
    UserEditable: string;
    UserEditableMeta?: string;
    UserMergeable: string;
    UserShowBubble?: string;
    UserShowInDeviceList: string;
    UserVisibleDeviceId?: string;
    name_useredit?: string;
}

export interface PeerName {
    Icon: string;
    Make?: string;
    Model?: string;
    Name: string;
    Percent: number;
    UserDeviceType: string;
    UserDeviceTypeDisplayString: string;
}
