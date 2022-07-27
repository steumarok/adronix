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

export const dataSources = {
    't1': new DataSource({
        "type": "sqlite",
        "database": "/tmp/t1.db",
        "synchronize": true,
        logging: true,
        entities: [
            ...TcmEntities,
            ...TcaEntities
        ]
    }),
    't2': new DataSource({
        "type": "sqlite",
        "database": "/tmp/t2.db",
        "synchronize": true,
        logging: true,
        entities: [
            ...TcmEntities,
            ...TcaEntities
        ]
    })
}


TcaTest.init({
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
}, {
    sequelize: sequelize,
    modelName: TcaTest.prototype.constructor.name
})
