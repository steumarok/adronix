import { IPersistenceManager } from "@adronix/persistence"
import { Sequelize }  from 'sequelize'
import { SequelizeTransactionManager } from "./SequelizeTransactionManager"

export interface ISequelizeManager extends IPersistenceManager {
    getSequelize(name?: string): Sequelize
    getSequelizeTransactionManager(name?: string): SequelizeTransactionManager
}