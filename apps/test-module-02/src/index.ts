import { TcaProductOptionExt } from "./entities/TcaProductOptionExt";
import { Objects } from "@adronix/base";
import EditProductOptionProcessorOvr from "./server/EditProductOptionProcessorOvr";
import { EditProductOptionProcessor } from '@adronix/test-module-01'

export { TcaProductOptionExt }
export const TcaEntities = [ TcaProductOptionExt ]

EditProductOptionProcessorOvr()