import { TcmIngredient } from "./entities/TcmIngredient";
import { TcmProductOption } from "./entities/TcmProductOption";
import { TcmProductOptionValue } from "./entities/TcmProductOptionValue";

export { EditProductOptionProcessor } from './server/EditProductOptionProcessor'

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]