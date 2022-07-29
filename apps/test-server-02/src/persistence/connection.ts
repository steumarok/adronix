import { DataSource } from "typeorm"
import { TcmEntities } from "@adronix/test-module-01"
import { TcaEntities } from "@adronix/test-module-02"


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
