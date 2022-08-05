import { AbstractService } from "@adronix/server";
import { InjectDataSource } from "@adronix/typeorm/src";
import { DataSource } from "typeorm";
import { MmsArea } from "../persistence/entities/MmsArea";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsPartRequirement } from "../persistence/entities/MmsPartRequirement";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsResourceType } from "../persistence/entities/MmsResourceType";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";

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

    get resourceTypeRepository() {
        return this.dataSource.getRepository(MmsResourceType)
    }

    get resourceModelRepository() {
        return this.dataSource.getRepository(MmsResourceModel)
    }

    get partRepository() {
        return this.dataSource.getRepository(MmsPart)
    }

    get taskModelRepository() {
        return this.dataSource.getRepository(MmsTaskModel)
    }

    get partRequirementRepository() {
        return this.dataSource.getRepository(MmsPartRequirement)
    }

    get assetAttributeRepository() {
        return this.dataSource.getRepository(MmsAssetAttribute)
    }

    get lastTaskInfoRepository() {
        return this.dataSource.getRepository(MmsLastTaskInfo)
    }
}

