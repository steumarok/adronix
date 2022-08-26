import { defineModule } from "@adronix/server"
import persistenceBuilder from "./persistence/builder"
import { clientsProviders } from "./providers/clients"
import { assetsProviders } from "./providers/assets"
import { areasProviders } from "./providers/areas"
import { modelsProviders } from "./providers/models"
import { workPlanProviders } from "./providers/workPlan"
import { tasksProviders } from "./providers/tasks"
import { MmsRepoService } from "./services/MmsRepoService"
import { MmsAssetService } from "./services/MmsAssetService"
import { MmsTaskService } from "./services/MmsTaskService"

export { MmsEntities } from "./persistence"

export const MmsPersistenceModule = defineModule()
    .addServices(MmsTaskService)
    .addServices(MmsAssetService)
    .addServices(MmsRepoService)
    .buildPersistence(persistenceBuilder)

export const MmsWebModule = defineModule()
    .addDataProviders(
        clientsProviders,
        assetsProviders,
        areasProviders,
        modelsProviders,
        tasksProviders,
        workPlanProviders)
