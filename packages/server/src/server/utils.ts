import { EntityClass } from "@adronix/persistence"
import { PaginatedList, ReturnType } from "@adronix/server"
import { Like, Repository } from "typeorm"

type TableParams = {
    page: string,
    limit: string,
    sortBy: string,
    descending: string,
    filter: string
}

export class Utils {
    static toBool(str: string | boolean): boolean {
        return !!str && str.toString() == 'true'
    }

    static toInt(str: string): number {
        return Number.parseInt(str)
    }

    static sortDir(descending: boolean | string) {
        return Utils.toBool(descending) ? "desc" : "asc"
    }

    static orderClause(path: string, descending: boolean | string) {
        return path.split(".").reduceRight((obj, field, idx, arr) => {
            return { [field]: (idx == arr.length - 1) ? Utils.sortDir(descending) : obj }
        }, {})
    }


    static async tableHandler<T>(
        entityClass: EntityClass<T>,
        repository: Repository<unknown>,
        { page, limit, sortBy, descending, filter }: Partial<TableParams>,
        searchFields: string[] = []): Promise<ReturnType> {
        const where = searchFields.length > 0 && filter
            ? { [searchFields[0]]: Like(`${filter}%`) }
            : undefined
        const [ rows, count ] = await repository.findAndCount({
                where,
                skip: (page != undefined) ? (Utils.toInt(page) - 1) * Utils.toInt(limit) : undefined,
                take: (page != undefined) ? Utils.toInt(limit) : undefined,
                order: { [sortBy]: Utils.toBool(descending) ? "desc": "asc" }
            })

        return (page != undefined) ? [PaginatedList(entityClass, rows, count)] : rows
    }
}

