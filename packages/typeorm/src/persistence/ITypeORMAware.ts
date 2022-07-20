import { IPersistenceManager } from "@adronix/persistence"
import { DataSource } from "typeorm"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"

export interface ITypeORMAware extends IPersistenceManager {
    getDataSource(name?: string): DataSource
    getTypeORMTransactionManager(name?: string): TypeORMTransactionManager
}