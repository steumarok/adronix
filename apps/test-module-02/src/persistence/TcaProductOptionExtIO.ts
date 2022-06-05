import { EntityProps } from "@adronix/persistence"
import { TypeORMEntityIO } from "@adronix/typeorm"
import { DataSource } from "typeorm"
import { TcaProductOptionExt } from "../entities/TcaProductOptionExt"

export class TcaProductOptionExtIO extends TypeORMEntityIO<TcaProductOptionExt> {
    constructor(dataSource: DataSource) {
        super(dataSource, TcaProductOptionExt)
    }

    validate(changes: EntityProps, entity?: TcaProductOptionExt) {
        return super.validate(changes, entity)
            .addRule("name", () => changes.name != "", { message: 'empty' })
            //.addRule("name", () => changes.name != entity.name, { message: 'dup' })
    }
}