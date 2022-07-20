import { Module1, TcmProductOption } from "@adronix/test-module-01";
import { Objects } from "@adronix/base";
import { Application, defineModule, ItemCollector, Module } from "@adronix/server";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { TcaProductOptionExt } from "./entities/TcaProductOptionExt";
import { ISequelizeAware, SequelizePersistence } from "@adronix/sequelize";
import { EntityEventKind, Persistence, Transaction } from "@adronix/persistence";
import { TcaTest } from "./entities/TcaTest";

export { TcaProductOptionExt, TcaTest }
export const TcaEntities = [ TcaProductOptionExt ]

export type TestApplication = Application & ITypeORMAware & ISequelizeAware


class Module2Persistence1 extends SequelizePersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcaTest,
            (validator, changes) => validator
                .addRule("firstName", () => !!changes.firstName, { message: 'empty' }))
    }
}

export const Module2 = defineModule<TestApplication>()
    .buildPersistence(module => TypeORMPersistence.build(module.app)
        .defineEntityIO(TcaProductOptionExt)
            .rule("nameExt", changes => !!changes.nameExt, { message: 'empty' }))

Objects.override(Module1, base => {
    return class Module1Ovr extends base {

        constructor(app: TestApplication) {
            super(app)
            this.overrideProvider('/editProductOption', this.editProductOptionOvr, this.describeEditProductOptionOvr)
        }

        describeEditProductOptionOvr(collector: ItemCollector) {
            return collector
                .describe(TcaProductOptionExt, ['nameExt', 'productOption'])
        }

        usePersistence(persistence: Persistence) {
            super.usePersistence(persistence)

            persistence.getEntityIO(TcmProductOption)
                .addEventHandler(this.tcmProductOptionHandler())
        }

        tcmProductOptionHandler() {
            return async (eventKind: EntityEventKind, productOption: TcmProductOption, t: Transaction) => {
                if (eventKind == EntityEventKind.Deleting) {
                    const io = this.app.getEntityIO(TcaProductOptionExt)

                    const poe = await this.app.getDataSource().getRepository(TcaProductOptionExt)
                        .findOne({ where: { productOption: { id: productOption.id } }})

                    if (poe) {
                        await io.delete(poe)(t)
                    }
                }
            }
        }

        async editProductOptionOvr({ id }, module: Module<TestApplication>, items: any[]) {

            const poe = await module.app.getDataSource().getRepository(TcaProductOptionExt)
                .findOne({ relations: { productOption: true }, where: { productOption: { id} }})

            items.push(poe ? poe : await this.newExt(items[0]))

            //items.push(TcaTest.build({firstName: 'prova'}))

            return items
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

