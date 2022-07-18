import { Module1, Module1Persistence, TcmProductOption } from "@adronix/test-module-01";
import { Objects } from "@adronix/base";
import { Application, ItemCollector, Module } from "@adronix/server";
import { ITypeORMManager, TypeORMPersistence } from "@adronix/typeorm";
import { TcaProductOptionExt } from "./entities/TcaProductOptionExt";
import { EntityClass, EntityEventKind, EntityIO, ValidationHandler } from "@adronix/persistence/src";

export { TcaProductOptionExt }
export const TcaEntities = [ TcaProductOptionExt ]


export type TestApplication = Application & ITypeORMManager

class Module2Persistence extends TypeORMPersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcaProductOptionExt,
            (validator, changes) => validator
                .addRule("name", () => changes.name != "", { message: 'empty' }))
    }
}


export class Module2 extends Module<TestApplication> {
    constructor(app: TestApplication) {
        super(app)

        this.usePersistence(Objects.create(Module2Persistence, app))
    }


    describe(collector: ItemCollector) {
        return collector
            .describe(TcaProductOptionExt, ['nameExt', 'productOption']);
    }
}

Objects.override(Module1Persistence, base => {
    return class extends base {
        defineEntityIO<T>(
            entityClass: EntityClass<T>,
            validationHandler: ValidationHandler<T>) {
            const entityIO = super.defineEntityIO(entityClass, validationHandler)
            if (entityClass.prototype.constructor.name == 'TcmProductOption') {
                entityIO.addEventHandler(async (eventKind, entity, t) => {
                    if (eventKind == EntityEventKind.Deleting) {
                        const productOption = entity as unknown as TcmProductOption
                        const io = this.manager.getEntityIO(TcaProductOptionExt)
                        const poe = await this.manager.getDataSource().getRepository(TcaProductOptionExt)
                            .createQueryBuilder("poe")
                            .where("poe.productOption.id = :id", { id: productOption.id })
                            .getOne()

                        if (poe) {
                            await io.delete(poe)(t)
                        }
                    }
                })
            }
            return entityIO
        }
    }
})

Objects.override(Module1, base => {
    return class extends base {
        describe(collector: ItemCollector) {
            return super.describe(collector)
                .describe(TcaProductOptionExt, ['nameExt', 'productOption'])
        }

        async editProductOption({ id }) {
            const result = await super.editProductOption({ id }) as any[]

            const poe = await this.app.getDataSource().getRepository(TcaProductOptionExt)
                .createQueryBuilder("poe")
                .leftJoinAndSelect("poe.productOption", 'productOption')
                .where("poe.productOption.id = :id", { id })
                .getOne()

            result.push(poe ? poe : await this.newExt(result[0]))

            return result
        }

        protected async newExt(po: TcmProductOption) {
            const poe = new TcaProductOptionExt()
            poe.productOption = po
            if (po.name) {
                poe.nameExt = po.name + " ext"
            }
            return poe
        }
    }
})

