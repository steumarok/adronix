import { AbstractService } from "@adronix/server";
import { InjectDataSource } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { MmsArea } from "../persistence/entities/MmsArea";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";

export class MmsService extends AbstractService {

    @InjectDataSource
    dataSource: DataSource

    get clientRepository() {
        return this.dataSource.getRepository(MmsClient)
    }

    get clientLocationRepository() {
        return this.dataSource.getRepository(MmsClientLocation)
    }

    get areaRepository() {
        return this.dataSource.getRepository(MmsArea)
    }

    get areaModelRepository() {
        return this.dataSource.getRepository(MmsAreaModel)
    }

    get areaModelAttributionRepository() {
        return this.dataSource.getRepository(MmsAreaModelAttribution)
    }

    get assetRepository() {
        return this.dataSource.getRepository(MmsAsset)
    }

    get assetModelRepository() {
        return this.dataSource.getRepository(MmsAssetModel)
    }
}

