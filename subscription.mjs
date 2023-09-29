export class MessageSubscription {
    constructor() {
        if (new.target === MessageSubscription) {
            throw new TypeError(`${MessageSubscription.name} has to be extended.`);
        }
    }
};