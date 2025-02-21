import {AuthResponse, CommandResponse, HomeScreenResponse, Network, ValidateResponse} from "./api";
import {BlinkAuthenticationException, BlinkException} from "./exceptions";

// This is all based on info here: https://github.com/MattTW/BlinkMonitorProtocol/tree/master

class Constants {
    static BLINK_URL = 'immedia-semi.com';
    static DEFAULT_URL = 'prod.' + Constants.BLINK_URL;
    static BASE_URL = 'https://rest-prod.' + Constants.BLINK_URL;
    static LOGIN_URL = Constants.BASE_URL + '/api/v5/account/login';
    static DEVICE_ID = 'ColeHomeAutomation';
    static TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S%z"
    static DEFAULT_MOTION_INTERVAL = 1
    static DEFAULT_REFRESH = 30
    static MIN_THROTTLE_TIME = 2
    static SIZE_NOTIFICATION_KEY = 152
    static SIZE_UID = 16
    static TIMEOUT = 10
    static TIMEOUT_MEDIA = 90
}

export interface Options {
    verificationTimeout?: number;
    deviceName?: string;
    urls?: BlinkURLHandler;
    httpExecutor?: HttpExecutor;
}

export interface HttpExecutor {
    get<T>(url: string, headers: { [key: string]: string }): Promise<T>

    post<T>(url: string, headers: { [key: string]: string }, body?: any): Promise<T>
}

class BlinkURLHandler {

    baseUrl: string;
    homeUrl: string;
    verifyUrl: string;

    constructor(private accountId: number, private accountTier: string, private clientId: number) {
        this.baseUrl = 'https://rest-' + accountTier + '.' + Constants.BLINK_URL;
        this.homeUrl = `${this.baseUrl}/api/v3/accounts/${accountId}/homescreen`;
        this.verifyUrl = `https://rest-prod.${Constants.BLINK_URL}/api/v4/account/${this.accountId}/client/${clientId}/pin/verify`
    }

    public armUrl(networkId: number): string {
        return `${this.baseUrl}/api/v1/accounts/${this.accountId}/networks/${networkId}/state/arm`;
    }

    public disarmUrl(networkId: number): string {
        return `${this.baseUrl}/api/v1/accounts/${this.accountId}/networks/${networkId}/state/disarm`;
    }
}

export class Blink {

    verificationTimeout: number;
    deviceName: string;
    urls?: BlinkURLHandler;
    httpExecutor: HttpExecutor;
    token?: string;

    constructor(private username: string, private password: string, private device_id: string, options: Options = {}) {
        this.verificationTimeout = options.verificationTimeout || 1e3 * 60;
        this.deviceName = options.deviceName || "node-blink-ts";
        this.urls = options.urls;
        this.httpExecutor = options.httpExecutor || {
            get: async <T>(url: string, headers: { [key: string]: string }): Promise<T> => {
                let response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                });
                if (!response.ok) {
                    throw new BlinkException(`HTTP error! status: ${response.status}/${response.statusText}`);
                }
                return response.json() as T;
            },
            post: async <T>(url: string, headers: { [key: string]: string }, body: any): Promise<T> => {
                let response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: body ? JSON.stringify(body) : undefined
                });
                if (!response.ok) {
                    throw new BlinkException(`HTTP error! status: ${response.status}/${response.statusText}`);
                }
                return response.json() as T;
            }
        };
    }

    private readonly defaultHeaders: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'User-Agent': 'node-blink-ts'
    };

    private headersWithToken(): { [key: string]: string } {
        const newHeaders: { [key: string]: string } = {};
        Object.assign(newHeaders, this.defaultHeaders);
        if (this.token) {
            newHeaders["token-auth"] = this.token;
        }
        return newHeaders;
    }

    public async authenticate(pin?: string | null): Promise<BlinkSystem> {
        return this.httpExecutor.post<AuthResponse>(
            Constants.LOGIN_URL,
            this.defaultHeaders,
            {
                email: this.username,
                password: this.password,
                unique_id: this.device_id,
                device_identifier: this.device_id,
                client_name: this.deviceName,
                reauth: "true"
            }
        )
            .then(authResponse => {
                if (!authResponse.auth?.token) {
                    throw new BlinkAuthenticationException("Unable to authenticate: no token found");
                }
                if (!authResponse.account?.account_id) {
                    throw new BlinkAuthenticationException("Unable to authenticate: no account id found");
                }
                if (!authResponse?.account?.tier) {
                    throw new BlinkAuthenticationException("Unable to authenticate: no tier found");
                }
                if (!authResponse?.account?.client_id) {
                    throw new BlinkAuthenticationException("Unable to authenticate: no client id found");
                }
                this.token = authResponse.auth.token;
                this.urls = new BlinkURLHandler(authResponse.account.account_id, authResponse.account.tier, authResponse.account.client_id);
                if (authResponse.account?.client_verification_required) {
                    if (!pin) {
                        throw new BlinkAuthenticationException("2fa auth required and you did not supply a pin.  Check your email or text messages.");
                    }
                    return this.httpExecutor.post<ValidateResponse>(
                        this.urls.verifyUrl,
                        this.headersWithToken(), {
                            pin: pin
                        }
                    )
                        .then(validateResponse => {
                            if (!validateResponse.valid) {
                                throw new BlinkAuthenticationException("PIN invalid");
                            }
                            if (validateResponse.require_new_pin) {
                                throw new BlinkAuthenticationException("You need a new PIN.  Replace with latest email.  May have to null out PIN first.");
                            }
                            return this.homeScreen()
                                .then(homeScreen => new BlinkSystem(this, homeScreen))
                        })
                } else {
                    return this.homeScreen()
                        .then(homeScreen => new BlinkSystem(this, homeScreen))
                }
            });
    }

    public async homeScreen(): Promise<HomeScreenResponse> {
        return this.httpExecutor.get(this.getUrlsRequired().homeUrl, this.headersWithToken());
    }

    public async armNetwork(networkId: number): Promise<CommandResponse> {
        return this.httpExecutor.post(this.getUrlsRequired().armUrl(networkId), this.headersWithToken());
    }

    public async disarmNetwork(networkId: number): Promise<CommandResponse> {
        return this.httpExecutor.post(this.getUrlsRequired().disarmUrl(networkId), this.headersWithToken());
    }

    private getUrlsRequired() {
        if (!this.urls) {
            throw new BlinkException("System not yet properly authenticated");
        }
        return this.urls!!;
    }
}

export class BlinkSystem {

    constructor(private blink: Blink, private homeScreen: HomeScreenResponse) {
    }

    public async armNetwork(index: number) {
        return this.blink.armNetwork(this.getRequiredNetwork(index).id!!)
    }

    public async disarmNetwork(index: number) {
        return this.blink.disarmNetwork(this.getRequiredNetwork(index).id!!)
    }

    private getRequiredNetwork(index: number): Network {
        if (!this.homeScreen.networks) {
            throw new BlinkException("No networks");
        }
        if (!this.homeScreen.networks[index]) {
            throw new BlinkException(`No network with index ${index}`);
        }
        return this.homeScreen.networks[index];
    }

}
