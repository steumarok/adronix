import { defineModule } from "@adronix/server"
import persistenceBuilder from "./persistence/builder"
import { clientsProviders } from "./providers/clients"
import { areasProviders } from "./providers/areas"
import { MmsService } from "./services/MmsService"

export { MmsEntities } from "./persistence"

export const MmsPersistenceModule = defineModule()
    .addServices(MmsService)
    .buildPersistence(persistenceBuilder)

export const MmsWebModule = defineModule()
    .addDataProviders(clientsProviders)
    .addDataProviders(areasProviders)


