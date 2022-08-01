import { Context } from "@adronix/server";
import { DataSource } from "typeorm"

export interface TypeORMContext extends Context {

    get dataSource(): DataSource
    get dataSources(): { [name: string]: DataSource }

}

export function extendTypeORMContext(cb: (context: Context) => { [name: string]: DataSource } | DataSource) {
    return (context: Context) => {
        return {
            get dataSource(): DataSource {
                return this.dataSources['default']
            },
            get dataSources(): { [name: string]: DataSource } {
                const ds = cb(context)
                if (ds instanceof DataSource) {
                    return {
                        'default': ds
                    }
                } else {
                    return ds
                }
            }
        } as TypeORMContext
    }
}