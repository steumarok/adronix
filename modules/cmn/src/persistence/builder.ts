import { EntityIODefinitions } from "@adronix/persistence";
import { TypeORMPersistence } from "@adronix/typeorm";
import { CmnLocality } from "./entities/CmnLocality";
import { CmnMeasurementUnit } from "./entities/CmnMeasurementUnit";

const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: CmnLocality
    },
    {
        entityClass: CmnMeasurementUnit
    }
]


export default TypeORMPersistence.build()
    .addDefinitions(ioDefinitions);

