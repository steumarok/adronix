import { IncomingMessage } from "http";
import { EntityIO } from "./EntityIO";
import { PersistenceContext } from "./PersistenceContext";
import { EntityClass } from "./types";

export interface IPersistenceManager {
    getEntityIO(type: string | EntityClass<unknown>, context: PersistenceContext): EntityIO<unknown>;
}

