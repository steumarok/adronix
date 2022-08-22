import { AbstractService } from "@adronix/server";
import { EntityTarget, FindOneOptions } from "typeorm";
import { TypeORMTransaction } from "../persistence/TypeORMTransaction";

export class TypeORM {

    findOne<Entity>(entityClass: EntityTarget<Entity>, options: FindOneOptions<Entity>): (t: TypeORMTransaction) => Promise<Entity | null> {
        return t => t.entityManager.findOne(entityClass, options)
    }

    find<Entity>(entityClass: EntityTarget<Entity>, options: FindOneOptions<Entity>): (t: TypeORMTransaction) => Promise<Entity[]> {
        return t => t.entityManager.find(entityClass, options)
    }
}


export const InjectTypeORM = (target: any, memberName: string) => {
    Object.defineProperty(target, memberName, {
        get: function () {
            return new TypeORM()
        }
    });
};