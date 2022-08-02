import { defineModule } from "@adronix/server"
import persistenceBuilder from "./persistence/builder"
import { CmnLocality } from "./persistence/entities/CmnLocality"
import { localitiesProviders } from "./providers/localities"
import { CmnService } from "./services/CmnService"

export { CmnEntities } from "./persistence"
export { CmnLocality }

export const CmnModule = defineModule()
    .addServices(CmnService)
    .buildPersistence(persistenceBuilder)
    .addDataProviders(localitiesProviders)

