import { AbstractService } from "@adronix/server";
import { InjectDataSource } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { CmnLocality } from "../persistence/entities/CmnLocality";

export class CmnService extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    get localityRepository() {
        return this.dataSource.getRepository(CmnLocality)
    }


}

