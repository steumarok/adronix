import { Module1, TcmProductOption } from "@adronix/test-module-01";
import { Application, DataProviderDefintions, defineModule } from "@adronix/server";
import { ITypeORMAware, TypeORMPersistence } from "@adronix/typeorm";
import { TcaProductOptionExt } from "./entities/TcaProductOptionExt";
import { ISequelizeAware, SequelizePersistence } from "@adronix/sequelize";
import { EntityEventKind, EntityIODefinitions, PersistenceExtension, Transaction } from "@adronix/persistence";
import { TcaTest } from "./entities/TcaTest";
import { In } from "typeorm";

export { TcaProductOptionExt, TcaTest }
export const TcaEntities = [ TcaProductOptionExt ]

export type TestApplication = Application & ITypeORMAware & ISequelizeAware

/*
class Module2Persistence1 extends SequelizePersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcaTest,
            (validator, changes) => validator
                .addRule("firstName", () => !!changes.firstName, { message: 'empty' }))
    }
}
*/

const ioDefinitions: EntityIODefinitions = [
    {
        entityClass: TcaProductOptionExt,
        rules: [
            [ 'nameExt', changes => !!changes.nameExt, { message: 'empty' } ]
        ]
    }
]

export const Module2 = defineModule<TestApplication>()
    .buildPersistence(TypeORMPersistence.build().addDefinitions(ioDefinitions));

const providers: DataProviderDefintions<TestApplication> = {

    '/listProductOption': {
        handler: async function ({ }, items: any[]) {

            const poes = await this.app.getDataSource().getRepository(TcaProductOptionExt)
                .find({
                    where: { productOption: In(items as TcmProductOption[])},
                    relations: ['productOption'] })

            return items.concat(poes)
        },
        output: [
            [TcaProductOptionExt, 'nameExt', 'productOption']
        ]
    },

    '/editProductOption': {
        handler: async function ({ id }, items: any[]) {

            async function newExt(po: TcmProductOption) {
                const poe = new TcaProductOptionExt()
                poe.productOption = po
                if (po.name) {
                    poe.nameExt = po.name + " ext"
                }
                return poe
            }

            const poe = await this.app.getDataSource().getRepository(TcaProductOptionExt)
                .findOne({ relations: { productOption: true }, where: { productOption: { id } }})

            return items.concat(poe ? poe : await newExt(items[0]))
        },
        output: [
            [TcaProductOptionExt, 'nameExt', 'productOption']
        ]
    }
}


const persistenceExtension: PersistenceExtension = {
    eventHandlers: [
        [TcmProductOption, async function(
            eventKind,
            productOption: TcmProductOption,
            transaction) {
            if (eventKind == EntityEventKind.Deleting) {
                const io = this.getEntityIO(TcaProductOptionExt)

                const poe = await (this as ITypeORMAware).getDataSource().getRepository(TcaProductOptionExt)
                    .findOne({ where: { productOption: { id: productOption.id } }})

                if (poe) {
                    await io.delete(poe)(transaction)
                }
            }
        }]
    ]
}

Module1.extend()
    .extendDataProviders(providers)
    .extendPersistence(persistenceExtension)
