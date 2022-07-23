import { EntityIO } from "./EntityIO";
import { Transaction } from "./Transaction";
import { EntityClass } from "./types";

export interface IPersistenceManager {
    getEntityIO(type: string | EntityClass<unknown>): EntityIO<unknown>;
}

