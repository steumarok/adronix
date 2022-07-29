import { AbstractService, Application, ServiceContext } from "@adronix/server"
import { InjectDataSource } from "@adronix/typeorm/src"
import { DataSource } from "typeorm"

export class Service2 extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    constructor(app: Application, context: ServiceContext) {
        super(app, context)
    }

    async listProductOptions(page: number = 1, limit: number = 10) {
        console.log(this.service2.getTenantId())
        const [ rows, count ] = await this.dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .innerJoinAndSelect("po.shop", "shop")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
        return { rows, count }
    }

    static get({ app, context }: { app: Application, context: ServiceContext }) {
        return app.services<Service2>(Service2, context)
    }
}