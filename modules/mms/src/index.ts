import { defineModule } from "@adronix/server"
import persistenceBuilder from "./persistence/builder"
import { clientsProviders } from "./providers/clients"
import { assetsProviders } from "./providers/assets"
import { areasProviders } from "./providers/areas"
import { modelsProviders } from "./providers/models"
import { workPlanProviders } from "./providers/workPlan"
import { MmsService } from "./services/MmsService"

export { MmsEntities } from "./persistence"

export const MmsPersistenceModule = defineModule()
    .addServices(MmsService)
    .buildPersistence(persistenceBuilder)

export const MmsWebModule = defineModule()
    .addDataProviders(
        clientsProviders,
        assetsProviders,
        areasProviders,
        modelsProviders,
        workPlanProviders)
