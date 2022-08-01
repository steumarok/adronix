import { TcmProductOption } from "@adronix-apps/test-module-01/src"
import { AbstractService, Application } from "@adronix/server"
import { InjectDataSource } from "@adronix/typeorm/src"
import { DataSource } from "typeorm"

export class Service2 extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    async listProductOptions(page: number = 1, limit: number = 10) {
        // console.log(this.service2.getTenantId())
        const [ rows, count ] = await this.dataSource.getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .innerJoinAndSelect("po.shop", "shop")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount()
        return { rows, count }
    }


}