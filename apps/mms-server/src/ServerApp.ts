import { ExpressApplication } from "@adronix/express";
import { IamAuthModule } from "@adronix/iam";
import { MmsPersistenceModule, MmsWebModule } from "@adronix/mms";
import { CmnModule } from "@adronix/cmn";
import { extendTypeORMContext } from "@adronix/typeorm";
import e from "express";
import { DataSource } from "typeorm";

export class ServerApp extends ExpressApplication {

    constructor(express: e.Application, protected dataSource: DataSource) {
        super(express/*, {
            jwt: {
                enable: true
                secret: 'test'
            }
        }*/)
    }

    initialize() {
        super.initialize()

        this.addModule(CmnModule, {
            http: {
                urlContext: '/cmn'
            }
        });
        this.addModule(IamAuthModule);
        this.addModule(MmsPersistenceModule);
        this.addModule(MmsWebModule, {
            http: {
                urlContext: '/mms'
            }
        });

        this.extendContext(extendTypeORMContext(_context => this.dataSource))
    }
}