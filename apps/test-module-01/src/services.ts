import { AbstractService, Application, Context, InjectService } from "@adronix/server";
import { InjectDataSource } from "@adronix/typeorm";
import { DataSource } from "typeorm";
import { TcmProductOption } from "./persistence/entities";



export class Service1Aux extends AbstractService {

    @InjectDataSource
    dataSource: DataSource



    getTenantId() {
        return this.context.tenantId
    }

}


export class Service1 extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    @InjectService
    service2: Service1Aux


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

}


