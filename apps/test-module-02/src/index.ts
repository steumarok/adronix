import { Module1, TcmProductOption } from "@adronix/test-module-01";
import { Application, DataProviderDefintions, defineModule, FormDefinitions } from "@adronix/server";
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
            [ 'nameExt', (ctx, changes) => !!changes.nameExt, { message: 'empty' } ]
        ]
    }
]

const forms: FormDefinitions<TestApplication> = {
    '/login': {
        handler: async function ({ username }) {
            // SysAuthService.authenticate(username)
        },
        rules: [
            [ 'username', payload => !!payload.username, { message: 'Username not valid' } ]
        ]
    }
}

export const Module2 = defineModule<TestApplication>()
    .addForms(forms)
    .buildPersistence(TypeORMPersistence.build().addDefinitions(ioDefinitions));

const providers: DataProviderDefintions<TestApplication> = {

    '/listProductOption': {
        handler: async function (ctx, { }, items: any[]) {

            const productOptions = items.filter(item => item instanceof TcmProductOption)

            const poes = await this.app.getDataSource(ctx).getRepository(TcaProductOptionExt)
                .find({
                    where: { productOption: { id: In(productOptions.map(item => item.id)) } },
                    relations: ['productOption'] })

            return poes
        },
        output: [
            [TcaProductOptionExt, 'nameExt', 'productOption']
        ]
    },

    '/editProductOption': {
        handler: async function (ctx, { id }, items: any[]) {

            const productOption = items.find(item => item instanceof TcmProductOption)

            async function newExt(po: TcmProductOption) {
                const poe = new TcaProductOptionExt()
                poe.productOption = po
                if (po.name) {
                    poe.nameExt = po.name + " ext"
                }
                return poe
            }

            const poe = await this.app.getDataSource(ctx).getRepository(TcaProductOptionExt)
                .findOne({ relations: [ 'productOption' ], where: { productOption: { id } }})

            return [poe ? poe : await newExt(productOption)]
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
                const io = this.getEntityIO(TcaProductOptionExt, transaction.context)

                const poe = await (this as ITypeORMAware).getDataSource(transaction.context).getRepository(TcaProductOptionExt)
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
