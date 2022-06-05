import { Objects } from "../src"
import { ObjectA } from "./ObjectA"

export default () => {
    Objects.override(ObjectA, base => {
        return class extends base {
            public getMember1Value(): string {
                return super.getMember1Value() + " [ObjectAOvr1]"
            }
        }
    })
}