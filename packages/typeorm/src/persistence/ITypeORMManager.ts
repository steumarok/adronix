import { IPersistenceManager } from "@adronix/persistence"
import { DataSource } from "typeorm"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"

export interface ITypeORMManager extends IPersistenceManager {
    getDataSource(name?: string): DataSource
    getTransactionManager(name?: string): TypeORMTransactionManager
}