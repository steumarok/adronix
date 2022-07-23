import { IPersistenceManager } from "@adronix/persistence"
import { Sequelize }  from 'sequelize'
import { SequelizeTransactionManager } from "./SequelizeTransactionManager"

export interface ISequelizeAware extends IPersistenceManager {

    getSequelize(name?: string): Sequelize

}