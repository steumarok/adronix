import { MmsArea } from "./entities/MmsArea";
import { MmsAreaModel } from "./entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "./entities/MmsAreaModelAttribution";
import { MmsAsset } from "./entities/MmsAsset";
import { MmsAssetAttribute } from "./entities/MmsAssetAttribute";
import { MmsAssetComponent } from "./entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "./entities/MmsAssetComponentModel";
import { MmsAssetModel } from "./entities/MmsAssetModel";
import { MmsAssetModelPivot } from "./entities/MmsAssetModelPivot";
import { MmsClient } from "./entities/MmsClient";
import { MmsClientLocation } from "./entities/MmsClientLocation";
import { MmsLastTaskInfo } from "./entities/MmsLastTaskInfo";
import { MmsPart } from "./entities/MmsPart";
import { MmsPartRequirement } from "./entities/MmsPartRequirement";
import { MmsResourceModel } from "./entities/MmsResourceModel";
import { MmsResourceType } from "./entities/MmsResourceType";
import { MmsScheduling } from "./entities/MmsScheduling";
import { MmsTask } from "./entities/MmsTask";
import { MmsTaskModel } from "./entities/MmsTaskModel";
import { MmsWorkOrder } from "./entities/MmsWorkOrder";

export const MmsEntities = [
    MmsAsset,
    MmsAssetAttribute,
    MmsAssetModel,
    MmsClient,
    MmsClientLocation,
    MmsTask,
    MmsTaskModel,
    MmsWorkOrder,
    MmsArea,
    MmsAreaModel,
    MmsAreaModelAttribution,
    MmsResourceModel,
    MmsResourceType,
    MmsPart,
    MmsPartRequirement,
    MmsLastTaskInfo,
    MmsScheduling,
    MmsAssetComponent,
    MmsAssetComponentModel,
    MmsAssetModelPivot
]
