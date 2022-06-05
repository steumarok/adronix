export class ObjectA {
    constructor(
        private member1: string,
        private member2: string) {
    }

    public getMember1Value() {
        return this.member1
    }

    public getMember2Value() {
        return this.member2
    }

    public getMemberValues() {
        return {
            member1: this.getMember1Value(),
            member2: this.getMember2Value()
        }
    }
}