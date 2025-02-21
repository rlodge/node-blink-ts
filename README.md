# node-blink-ts

A simple implementation of a nodejs client for Blink Cameras, written in typescript.  Right now it just does auth, arm, and disarm.

Follows the [BlinkMonitorProtocol](https://github.com/MattTW/BlinkMonitorProtocol) specifications.

Inspired by [blinkpy](https://github.com/fronzbot/blinkpy) and [node-blink-security](https://github.com/madshall/node-blink-security).

## Usage

Try something like this:

```typescript
import {Blink} from "blink-ts";

const blink = new Blink('EMAIL', 'SECRET PASSWORD', 'CONSTANT UUID FOR THE DEVICE RUNNING THIS SOFTWARE');

// the following will auth and ... then fail, because you need to put the PIN in there.

blink.authenticate()
    .then(
        r => {
            r.disarmNetwork(0)
                .then(c => console.log(c))
        },
        e => {
            console.log(e);
        }
    )

// once you have a PIN
blink.authenticate("YOURPIN")
    .then(
        r => {
            r.disarmNetwork(0)
                .then(c => console.log(c))
        },
        e => {
            console.log(e);
        }
    )
```

Use responsibly.