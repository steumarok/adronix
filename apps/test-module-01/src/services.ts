import { IPersistenceExtender, PersistenceContext } from "@adronix/persistence/src";
import { AbstractService, Application, InjectService } from "@adronix/server";
import { ServiceContext } from "@adronix/server";
import { InjectDataSource, ITypeORMAware } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { TestApplication } from "."
import { TcmProductOptionValue, TcmProductOption, TcmIngredient } from "./entities";





export class Service2 extends AbstractService<TestApplication> {

    @InjectDataSource
    dataSource: DataSource

    constructor(app: TestApplication, context: ServiceContext) {
        super(app, context)
    }

    getTenantId() {
        return this.context.tenantId
    }
}


export class Service1 extends AbstractService<TestApplication> {

    @InjectDataSource
    dataSource: DataSource

    @InjectService
    service2: Service2

    constructor(app: TestApplication, context: ServiceContext) {
        super(app, context)
    }

    async listProductOptions(page: number = 1, limit: number = 10) {
        console.log(this.service2.getTenantId())
        const [ rows, count ] = await this.dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
        return { rows, count }
    }
}


