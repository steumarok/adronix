import { DataSource } from "typeorm"
import { TypeORMTransactionManager } from "@adronix/typeorm"
import { TcmEntities } from '@adronix/test-module-01'
import { TcaEntities } from "@adronix/test-module-02"

export const dataSource = new DataSource({
    "type": "sqlite",
    "database": "/tmp/prova.db",
    "synchronize": true,
    entities: [
        ...TcmEntities,
        ...TcaEntities
    ]
})

export const transactionManager = new TypeORMTransactionManager(dataSource)
