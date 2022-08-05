import { AbstractService } from "@adronix/server";
import { InjectDataSource } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { CmnLocality } from "../persistence/entities/CmnLocality";
import { CmnMeasurementUnit } from "../persistence/entities/CmnMeasurementUnit";

export class CmnService extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    get localityRepository() {
        return this.dataSource.getRepository(CmnLocality)
    }

    get measurementUnitRepository() {
        return this.dataSource.getRepository(CmnMeasurementUnit)
    }


}

