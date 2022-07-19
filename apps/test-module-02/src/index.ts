import { Module1, TcmProductOption } from "@adronix/test-module-01";
import { Objects } from "@adronix/base";
import { Application, ItemCollector, Module } from "@adronix/server";
import { ITypeORMManager, TypeORMPersistence } from "@adronix/typeorm";
import { TcaProductOptionExt } from "./entities/TcaProductOptionExt";
import { EntityClass, EntityEventKind, EntityIO, Transaction, ValidationHandler } from "@adronix/persistence/src";
import { ISequelizeManager, SequelizePersistence } from "@adronix/sequelize";
import { TcaTest } from "./entities/TcaTest";

export { TcaProductOptionExt }
export const TcaEntities = [ TcaProductOptionExt ]


export type TestApplication = Application & ITypeORMManager & ISequelizeManager

class Module2Persistence extends TypeORMPersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcaProductOptionExt,
            (validator, changes) => validator
                .addRule("nameExt", () => !!changes.nameExt, { message: 'empty' }))
    }
}

class Module2Persistence1 extends SequelizePersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcaTest,
            (validator, changes) => validator
                .addRule("firstName", () => !!changes.firstName, { message: 'empty' }))
    }
}


export class Module2 extends Module<TestApplication> {
    constructor(app: TestApplication) {
        super(app)

        this.usePersistence(Objects.create(Module2Persistence, app))
        this.usePersistence(Objects.create(Module2Persistence1, app))
    }


    describe(collector: ItemCollector) {
        return collector
            .describe(TcaProductOptionExt, ['nameExt', 'productOption']);
    }
}


Objects.override(Module1, base => {
    return class extends base {

        describe(collector: ItemCollector) {
            return super.describe(collector)
                .describe(TcaProductOptionExt, ['nameExt', 'productOption'])
                .describe(TcaTest, ['firstName'])
        }

        buildPersistence() {
            const persistence = super.buildPersistence()

            persistence.getEntityIO(TcmProductOption)
                .addEventHandler(this.tcmProductOptionHandler())

            return persistence
        }

        tcmProductOptionHandler() {
            return async (eventKind: EntityEventKind, entity: TcmProductOption, t: Transaction) => {
                if (eventKind == EntityEventKind.Deleting) {
                    const productOption = entity as unknown as TcmProductOption
                    const io = this.app.getEntityIO(TcaProductOptionExt)
                    const poe = await this.app.getDataSource().getRepository(TcaProductOptionExt)
                        .createQueryBuilder("poe")
                        .where("poe.productOption.id = :id", { id: productOption.id })
                        .getOne()

                    if (poe) {
                        await io.delete(poe)(t)
                    }
                }
            }
        }

        async editProductOption({ id }) {
            const result = await super.editProductOption({ id }) as any[]

            const poe = await this.app.getDataSource().getRepository(TcaProductOptionExt)
                .createQueryBuilder("poe")
                .leftJoinAndSelect("poe.productOption", 'productOption')
                .where("poe.productOption.id = :id", { id })
                .getOne()

            result.push(poe ? poe : await this.newExt(result[0]))

            result.push(TcaTest.build({firstName: 'prova'}))

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

