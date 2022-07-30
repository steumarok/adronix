import { defineModule, PaginatedList } from "@adronix/server";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient, TcmShop } from "./entities";
import { Service1, Service1Aux } from "./services";
import { persistenceBuilder } from "./persistence";
import { lookupProviders } from "./providers/lookup";
import { productOptionProviders } from "./providers/productOption";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue, TcmShop ]

export const Module1 = defineModule()
    .buildPersistence(persistenceBuilder)
    .addDataProviders(lookupProviders, productOptionProviders)
    .addServices(Service1, Service1Aux)

export { Service1 }