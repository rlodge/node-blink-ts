export interface ErrorResponse {
    code: number;
    message: string;
}

export interface AuthResponse {
    account?:                  Account;
    auth?:                     Auth;
    phone?:                    AuthResponsePhone;
    verification?:             Verification;
    lockout_time_remaining?:   number;
    force_password_reset?:     boolean;
    allow_pin_resend_seconds?: number;
}

export interface Account {
    account_id?:                    number;
    country?:                       string;
    user_id?:                       number;
    client_id?:                     number;
    client_trusted?:                boolean;
    new_account?:                   boolean;
    tier?:                          string;
    region?:                        string;
    account_verification_required?: boolean;
    phone_verification_required?:   boolean;
    client_verification_required?:  boolean;
    require_trust_client_device?:   boolean;
    country_required?:              boolean;
    verification_channel?:          string;
    user?:                          User;
    amazon_account_linked?:         boolean;
    braze_external_id?:             string;
}

export interface User {
    user_id?: number;
    country?: string;
}

export interface Auth {
    token?: string;
}

export interface AuthResponsePhone {
    number?:               string;
    last_4_digits?:        string;
    country_calling_code?: string;
    valid?:                boolean;
}

export interface Verification {
    email?: Email;
    phone?: VerificationPhone;
}

export interface Email {
    required?: boolean;
}

export interface VerificationPhone {
    required?: boolean;
    channel?:  string;
}

export interface ValidateResponse {
    valid?:           boolean;
    require_new_pin?: boolean;
    message?:         string;
    code?:            number;
}

export interface HomeScreenResponse {
    account?:          Account;
    networks?:         Network[];
    sync_modules?:     SyncModule[];
    cameras?:          Camera[];
    sirens?:           any[];
    chimes?:           any[];
    video_stats?:      VideoStats;
    doorbell_buttons?: any[];
    owls?:             any[];
    app_updates?:      AppUpdates;
    device_limits?:    DeviceLimits;
    whats_new?:        WhatsNew;
}

export interface AppUpdates {
    message?:          string;
    code?:             number;
    update_available?: boolean;
    update_required?:  boolean;
}

export interface Camera {
    id?:         number;
    created_at?: Date;
    updated_at?: Date;
    name?:       string;
    serial?:     string;
    fw_version?: string;
    type?:       string;
    enabled?:    boolean;
    thumbnail?:  string;
    status?:     string;
    battery?:    string;
    usage_rate?: boolean;
    network_id?: number;
    issues?:     any[];
    signals?:    Signals;
}

export interface Signals {
    lfr?:     number;
    wifi?:    number;
    temp?:    number;
    battery?: number;
}

export interface DeviceLimits {
    camera?:          number;
    chime?:           number;
    doorbell_button?: number;
    owl?:             number;
    siren?:           number;
    total_devices?:   number;
}

export interface Network {
    id?:         number;
    created_at?: Date;
    updated_at?: Date;
    name?:       string;
    time_zone?:  string;
    dst?:        boolean;
    armed?:      boolean;
    lv_save?:    boolean;
}

export interface SyncModule {
    id?:                 number;
    created_at?:         Date;
    updated_at?:         Date;
    onboarded?:          boolean;
    status?:             string;
    name?:               string;
    serial?:             string;
    fw_version?:         string;
    last_hb?:            Date;
    wifi_strength?:      number;
    network_id?:         number;
    enable_temp_alerts?: boolean;
}

export interface VideoStats {
    storage?:          number;
    auto_delete_days?: number;
}

export interface WhatsNew {
    updated_at?: number;
    url?:        string;
}

export interface CommandResponse {
    id?:         number;
    network_id?: number;
    command?:    string;
    state?:      string;
    commands?:   CommandResponse[];
}
