import { EntityProps } from "@adronix/persistence"
import { TypeORMEntityIO } from "@adronix/typeorm"
import { DataSource } from "typeorm"
import { TcmProductOptionValue } from "../entities/TcmProductOptionValue"

export class ProductOptionValueIO extends TypeORMEntityIO<TcmProductOptionValue> {
    constructor(dataSource: DataSource) {
        super(dataSource, TcmProductOptionValue)
    }

    validate(changes: EntityProps, entity?: TcmProductOptionValue) {
        return super.validate(changes, entity)
            .addRule("price", () => changes.price != 0, { message: 'price not valid' })
            //.addRule("name", () => changes.name != entity.name, { message: 'dup' })
    }
}
