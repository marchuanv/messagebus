import { Config } from "../lib/config.mjs";
class Address extends Config {
    constructor() {
        super(({ Property }) => {
            Property('hostname', 'localhost');
        });
    }
}
class Channel extends Config {
    /**
     * @param { Address } address
     */
    constructor(address) {
        super(({ Reference, Property }) => {
            Reference(address);
            Property('channel', 'apples');
        });
    }
}
fdescribe('when',() => {
    it('should', async () => {
      new Channel(new Address());
    });
});