import { Errors } from "@adronix/base";
import { Transaction } from "@adronix/persistence";
import { AbstractService, InjectService, IOService, Utils } from "@adronix/server";
import { InjectDataSource, InjectTypeORM, TypeORM, TypeORMTransaction } from "@adronix/typeorm";
import { DateTime } from "luxon";
import { DataSource, EntityManager, EntityTarget, FindOneOptions, In } from "typeorm";
import { MmsArea } from "../persistence/entities/MmsArea";
import { MmsAreaModel } from "../persistence/entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "../persistence/entities/MmsAreaModelAttribution";
import { MmsAsset } from "../persistence/entities/MmsAsset";
import { MmsAssetAttribute } from "../persistence/entities/MmsAssetAttribute";
import { MmsAssetComponent } from "../persistence/entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "../persistence/entities/MmsAssetComponentModel";
import { MmsAssetModel } from "../persistence/entities/MmsAssetModel";
import { MmsAssetModelPivot } from "../persistence/entities/MmsAssetModelPivot";
import { MmsClient } from "../persistence/entities/MmsClient";
import { MmsClientLocation } from "../persistence/entities/MmsClientLocation";
import { MmsCounter } from "../persistence/entities/MmsCounter";
import { MmsLastTaskInfo } from "../persistence/entities/MmsLastTaskInfo";
import { MmsPart } from "../persistence/entities/MmsPart";
import { MmsPartRequirement } from "../persistence/entities/MmsPartRequirement";
import { MmsResourceModel } from "../persistence/entities/MmsResourceModel";
import { MmsResourceType } from "../persistence/entities/MmsResourceType";
import { MmsScheduling } from "../persistence/entities/MmsScheduling";
import { MmsService } from "../persistence/entities/MmsService";
import { MmsServiceProvision } from "../persistence/entities/MmsServiceProvision";
import { MmsTask } from "../persistence/entities/MmsTask";
import { MmsTaskModel } from "../persistence/entities/MmsTaskModel";
import { MmsWorkPlan } from "../persistence/entities/MmsWorkPlan";


export class MmsRepoService extends AbstractService {

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

    get serviceRepository() {
        return this.dataSource.getRepository(MmsService)
    }

    get assetComponentModelRepository() {
        return this.dataSource.getRepository(MmsAssetComponentModel)
    }

    get assetModelPivotRepository() {
        return this.dataSource.getRepository(MmsAssetModelPivot)
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

    get workPlanRepository() {
        return this.dataSource.getRepository(MmsWorkPlan)
    }

    get assetAttributeRepository() {
        return this.dataSource.getRepository(MmsAssetAttribute)
    }

    get lastTaskInfoRepository() {
        return this.dataSource.getRepository(MmsLastTaskInfo)
    }

    get schedulingRepository() {
        return this.dataSource.getRepository(MmsScheduling)
    }

    get assetComponentRepository() {
        return this.dataSource.getRepository(MmsAssetComponent)
    }

    get serviceProvisionRepository() {
        return this.dataSource.getRepository(MmsServiceProvision)
    }

    get taskRepository() {
        return this.dataSource.getRepository(MmsTask)
    }
}

