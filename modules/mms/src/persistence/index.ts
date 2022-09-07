import { MmsArea } from "./entities/MmsArea";
import { MmsAreaModel } from "./entities/MmsAreaModel";
import { MmsAreaModelAttribution } from "./entities/MmsAreaModelAttribution";
import { MmsAsset } from "./entities/MmsAsset";
import { MmsAssetAttribute } from "./entities/MmsAssetAttribute";
import { MmsAssetComponent } from "./entities/MmsAssetComponent";
import { MmsAssetComponentModel } from "./entities/MmsAssetComponentModel";
import { MmsAssetModel } from "./entities/MmsAssetModel";
import { MmsAssetModelPivot } from "./entities/MmsAssetModelPivot";
import { MmsCalendar } from "./entities/MmsCalendar";
import { MmsChecklist } from "./entities/MmsChecklist";
import { MmsChecklistItem } from "./entities/MmsChecklistItem";
import { MmsChecklistItemModel } from "./entities/MmsChecklistItemModel";
import { MmsChecklistItemOption } from "./entities/MmsChecklistItemOption";
import { MmsChecklistModel } from "./entities/MmsChecklistModel";
import { MmsClient } from "./entities/MmsClient";
import { MmsClientLocation } from "./entities/MmsClientLocation";
import { MmsCounter } from "./entities/MmsCounter";
import { MmsDayType } from "./entities/MmsDayType";
import { MmsLastTaskInfo } from "./entities/MmsLastTaskInfo";
import { MmsPart } from "./entities/MmsPart";
import { MmsPartRequirement } from "./entities/MmsPartRequirement";
import { MmsResource } from "./entities/MmsResource";
import { MmsResourceModel } from "./entities/MmsResourceModel";
import { MmsResourceType } from "./entities/MmsResourceType";
import { MmsScheduling } from "./entities/MmsScheduling";
import { MmsService } from "./entities/MmsService";
import { MmsServiceProvision } from "./entities/MmsServiceProvision";
import { MmsStateAttribute } from "./entities/MmsStateAttribute";
import { MmsTask } from "./entities/MmsTask";
import { MmsTaskClosingReason } from "./entities/MmsTaskClosingReason";
import { MmsTaskModel } from "./entities/MmsTaskModel";
import { MmsTaskStateChange } from "./entities/MmsTaskStateChange";
import { MmsWorkingTime } from "./entities/MmsWorkingTime";
import { MmsWorkOrder } from "./entities/MmsWorkOrder";
import { MmsWorkOrderStateChange } from "./entities/MmsWorkOrderStateChange";
import { MmsWorkPlan } from "./entities/MmsWorkPlan";

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
    MmsAssetModelPivot,
    MmsChecklistModel,
    MmsCounter,
    MmsWorkPlan,
    MmsService,
    MmsServiceProvision,
    MmsResource,
    MmsChecklistItemModel,
    MmsChecklistItemOption,
    MmsChecklist,
    MmsChecklistItem,
    MmsStateAttribute,
    MmsTaskClosingReason,
    MmsWorkOrderStateChange,
    MmsTaskStateChange,
    MmsDayType,
    MmsCalendar,
    MmsWorkingTime
]
