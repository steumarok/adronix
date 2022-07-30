import { Context } from "@adronix/server";
import { DataSource } from "typeorm"

export interface TypeORMContext extends Context {

    get dataSource(): DataSource
    get dataSources(): { [name: string]: DataSource }

}