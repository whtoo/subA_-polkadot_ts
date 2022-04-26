import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
const WS_ADDRESS = "ws://127.0.0.1:9944";
const connectSubstrate = async () => {
    const wsProvider = new WsProvider(WS_ADDRESS);
    const api = await ApiPromise.create({ provider: wsProvider, types: {} });
    await api.isReady;
    console.log("connection to substrate is OK.");
    return api;
};
const getConst = async (api) => {
    return api.consts.balances.existentialDeposit.toHuman();
};
const getFreeBalance = async (api, address) => {
    const aliceAccount = await api.query.system.account(address);
    return aliceAccount["data"]["free"].toHuman();
};
const printBalance = async (api) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');
    console.log("alice balance is ", await getFreeBalance(api, alice.address));
    console.log("bob balance is ", await getFreeBalance(api, bob.address));
};
const subscribeAliceAndBob = async (api) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    await api.query.system.account(alice.address, (aliceAcc) => {
        console.log("Subscribe to Alice account");
        const aliceFreeSub = aliceAcc.data.free;
        console.log(`Alice Account (sub): ${aliceFreeSub}`);
    });
};
const subscribeEvents = async (api) => {
    api.query.system.events((events) => {
        console.log(`\nReceived ${events.length} events:`);
        events.forEach((record) => {
            const { event, phase } = record;
            const types = event.typeDef;
            console.log(`\t${event.section}:${event.method}:: (phase=${phase})`);
            console.log(`\t\t${event.meta.documentation}`);
            event.data.forEach((data, index) => {
                console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
            });
        });
    });
};
const sleep = async (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};
const main = async () => {
    const api = await connectSubstrate();
    const t = await getConst(api);
    console.log("existentialDeposit " + t);
    const d = await printBalance(api);
    console.log("connection executed~");
    await subscribeAliceAndBob(api);
    await subscribeEvents(api);
    await sleep(600000);
    console.log("successfuly exit");
};
main().then(() => {
    console.log("connection succefully!");
    process.exit(0);
}).catch((err) => {
    console.log("connection failed: " + err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map