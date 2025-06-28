// tests/utils/math.test.ts
import {Blink, BlinkURLHandler} from '../src';

describe('blink', () => {
    it('Should not throw exceptions on instantiation', () => {
        expect(new Blink("", "", "")).toBeTruthy();
    });

    it('Should have expected values on instantiation', () => {
        let blink = new Blink("", "", "");
        expect(blink.deviceName).toBe("node-blink-ts");
        expect(blink.urls).toBeFalsy();
        expect(blink.httpExecutor).toBeTruthy();
    });

    it('Should uptake the expected values when options are applied', () => {
        let executor = {
            get: function <T>(url: string, headers: { [key: string]: string; }): Promise<T> {
                throw new Error('Function not implemented.');
            },
            post: function <T>(url: string, headers: { [key: string]: string; }, body?: any): Promise<T> {
                throw new Error('Function not implemented.');
            }
        };
        let urls = new BlinkURLHandler(7, "prod", 33);
        let blink = new Blink("",
            "",
            "",
            {
                urls: urls,
                deviceName: "me",
                httpExecutor: executor
            }
        );
        expect(blink.deviceName).toBe("me");
        expect(blink.urls).toBe(urls);
        expect(blink.httpExecutor).toBe(executor);
    })

    // jest.spyOn(global, "fetch").mockImplementation(
    //   jest.fn(
    //     () => Promise.resolve({ json: () => Promise.resolve({ data: 100 }),
    //   }),
    // ) as jest.Mock )
});

describe('BlinkURLHandler', () => {
    let urlHandler = new BlinkURLHandler(333, "stage", 201);

    it('Should produce the expected base url', () => {
        expect(urlHandler.baseUrl).toBe("https://rest-stage.immedia-semi.com");
    });

    it('Should produce the expected home url', () => {
        expect(urlHandler.homeUrl).toBe("https://rest-stage.immedia-semi.com/api/v3/accounts/333/homescreen");
    });

    it('Should produce the expected verify url', () => {
        expect(urlHandler.verifyUrl).toBe("https://rest-stage.immedia-semi.com/api/v4/account/333/client/201/pin/verify");
    });

    it('Should produce the expected arm url', () => {
        expect(urlHandler.armUrl(9918)).toBe("https://rest-stage.immedia-semi.com/api/v1/accounts/333/networks/9918/state/arm");
    });

    it('Should produce the expected disarm url', () => {
        expect(urlHandler.disarmUrl(23899)).toBe("https://rest-stage.immedia-semi.com/api/v1/accounts/333/networks/23899/state/disarm");
    });

});
