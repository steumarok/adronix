import { DataSource } from "typeorm"
import { Sequelize, DataTypes } from "sequelize"
import { TypeORMTransactionManager } from "@adronix/typeorm"
import { TcmEntities } from "@adronix/test-module-01"
import { TcaEntities, TcaTest } from "@adronix/test-module-02"
import { SequelizeTransactionManager } from "@adronix/sequelize"

export const sequelize = new Sequelize({
    "dialect": "sqlite",
    "database": "/tmp/prova1.db"
})

export const dataSource = new DataSource({
    "type": "sqlite",
    "database": "/tmp/prova.db",
    "synchronize": true,
    logging: true,
    entities: [
        ...TcmEntities,
        ...TcaEntities
    ]
})

export const transactionManager = new TypeORMTransactionManager(dataSource)
export const sequelizeTransactionManager = new SequelizeTransactionManager(sequelize)

TcaTest.init({
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
}, {
    sequelize: sequelize,
    modelName: TcaTest.prototype.constructor.name
})
