import { EntityIODefinitions } from "@adronix/persistence";
import { TypeORMPersistence } from "@adronix/typeorm";
import { CmnLocality } from "./entities/CmnLocality";

const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: CmnLocality
    }
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

