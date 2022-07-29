import { IPersistenceExtender, PersistenceContext } from "@adronix/persistence/src";
import { AbstractService, Application, InjectService } from "@adronix/server";
import { ServiceContext } from "@adronix/server";
import { InjectDataSource, ITypeORMAware } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient } from "./entities";





export class Service1_2 extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    constructor(app: Application, context: ServiceContext) {
        super(app, context)
    }

    getTenantId() {
        return this.context.tenantId
    }

    static get({ app, context }: { app: Application, context: ServiceContext }) {
        return app.services<Service1_2>(Service1_2, context)
    }
}


export class Service1 extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    @InjectService
    service2: Service1_2

    constructor(app: Application, context: ServiceContext) {
        super(app, context)
    }

    async listProductOptions(page: number = 1, limit: number = 10) {
        console.log(this.service2.getTenantId())
        const [ rows, count ] = await this.dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .leftJoinAndSelect("po.shop", "shop")
            .leftJoinAndSelect("po.ingredients", "ingredients")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()

        return { rows, count }
    }

    static get({ app, context }: { app: Application, context: ServiceContext }) {
        return app.services<Service1>(Service1, context)
    }
}


