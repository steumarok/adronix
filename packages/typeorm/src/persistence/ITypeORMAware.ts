import { IPersistenceManager } from "@adronix/persistence"
import { DataSource } from "typeorm"

export interface ITypeORMAware extends IPersistenceManager {

    getDataSource(name?: string): DataSource

}