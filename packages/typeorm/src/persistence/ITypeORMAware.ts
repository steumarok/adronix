import { IPersistenceManager, PersistenceContext } from "@adronix/persistence"
import { DataSource } from "typeorm"

export interface ITypeORMAware extends IPersistenceManager {

    getDataSource(context: PersistenceContext, name?: string): DataSource

}