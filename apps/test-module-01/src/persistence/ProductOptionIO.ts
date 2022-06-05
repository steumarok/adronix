import { EntityProps } from "@adronix/persistence"
import { TypeORMEntityIO } from "@adronix/typeorm"
import { DataSource } from "typeorm"
import { TcmProductOption } from "../entities/TcmProductOption"

export class ProductOptionIO extends TypeORMEntityIO<TcmProductOption> {
    constructor(dataSource: DataSource) {
        super(dataSource, TcmProductOption)
    }

    validate(changes: EntityProps, entity?: TcmProductOption) {
        return super.validate(changes, entity)
            .addRule("name", () => changes.name != "", { message: 'empty' })
            //.addRule("name", () => changes.name != entity.name, { message: 'dup' })
    }
}