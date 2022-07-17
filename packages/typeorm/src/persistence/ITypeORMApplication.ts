import { DataSource } from "typeorm"
import { TypeORMTransactionManager } from "./TypeORMTransactionManager"

export type ITypeORMApplication = {
    getDataSource: () => DataSource,
    getTransactionManager: () => TypeORMTransactionManager
}