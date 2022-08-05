import { defineModule } from "@adronix/server"
import persistenceBuilder from "./persistence/builder"
import { CmnLocality } from "./persistence/entities/CmnLocality"
import { CmnMeasurementUnit } from "./persistence/entities/CmnMeasurementUnit"
import { localitiesProviders } from "./providers/localities"
import { measurementUnitsProviders } from "./providers/measurementUnits"
import { CmnService } from "./services/CmnService"

export { CmnEntities } from "./persistence"
export { CmnLocality, CmnMeasurementUnit }

export const CmnModule = defineModule()
    .addServices(CmnService)
    .buildPersistence(persistenceBuilder)
    .addDataProviders(localitiesProviders, measurementUnitsProviders)

