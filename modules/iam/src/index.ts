import { defineModule } from "@adronix/server"
import persistenceBuilder from "./persistence/builder"
import authForms from "./handlers/auth"
import { AuthService } from "./services/AuthService"

export const IamAuthModule = defineModule()
    .buildPersistence(persistenceBuilder)
    .addFormHandlers(authForms)
    .addServices(AuthService)

