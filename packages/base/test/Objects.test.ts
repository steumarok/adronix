import { Objects } from '../src'
import { ObjectA } from './ObjectA'
import ObjectAOvr1 from './ObjectAOvr1'
import ObjectAOvr2 from './ObjectAOvr2'


describe("override tests", () => {
    it("should call overridden methods", async () => {

        ObjectAOvr1()
        ObjectAOvr2()

        const objectA = Objects.create(ObjectA, 'm1', 'm2')

        const values = objectA.getMemberValues()

        expect(values.member1).toEqual('m1 [ObjectAOvr1] [ObjectAOvr2]')
        expect(values.member2).toEqual('m2 [ObjectAOvr2]')
    })
})

