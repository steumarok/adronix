import { Module1, TcmProductOption } from "@adronix/test-module-01";
import { Application, Context, DataProviderDefinitions, defineModule, FormDefinitions, IOService } from "@adronix/server";
import { TypeORMPersistence, TypeORMContext } from "@adronix/typeorm";
import { TcaProductOptionExt } from "./entities/TcaProductOptionExt";
import { ISequelizeAware, SequelizePersistence } from "@adronix/sequelize";
import { EntityClass, EntityEventKind, EntityIODefinitions, EntityProps, IPersistenceExtender, Transaction } from "@adronix/persistence";
import { TcaTest } from "./entities/TcaTest";
import { In } from "typeorm";
import { Errors, Objects } from "@adronix/base";

export { TcaProductOptionExt, TcaTest }
export const TcaEntities = [ TcaProductOptionExt ]


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
        //rules: [
            //[ 'nameExt', changes => !!changes.nameExt, { message: 'empty' } ]
        //]
    }
]

const forms: FormDefinitions = {
    '/login': {
        handler: async function ({ username }) {
            // SysAuthService.authenticate(username)
        }
        /*,
        rules: [
            //[ 'username', payload => !!payload.username, { message: 'Username not valid' } ]
        ]*/
    }
}

export const Module2 = defineModule()
    .addFormHandlers(forms)
    .buildPersistence(TypeORMPersistence.build().addDefinitions(ioDefinitions));

const providers: DataProviderDefinitions<TypeORMContext> = {

    '/listProductOption': {
        handler: async function({ }, items: any[]) {

            const productOptions = items.filter(item => item instanceof TcmProductOption)

            const poes = await this.dataSource.getRepository(TcaProductOptionExt)
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
        handler: async function({ _id }, items: any[]) {

            const productOption = items.find(item => item instanceof TcmProductOption)

            async function newExt(po: TcmProductOption) {
                const poe = new TcaProductOptionExt()
                poe.productOption = po
                if (po.name) {
                    poe.nameExt = po.name + " ext"
                }
                return poe
            }

            const poe = productOption.id
                ? await this.dataSource.getRepository(TcaProductOptionExt)
                    .findOne({ relations: [ 'productOption' ], where: { productOption: { id: productOption.id } }})
                : null

            return [poe ? poe : await newExt(productOption)]
        },
        output: [
            [TcaProductOptionExt, 'nameExt', 'productOption']
        ]
    }
}


/*
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
*/

Module1.extend()
    .extendDataProviders(providers)


Objects.override(IOService, base => {
    return class extends base {
        constructor(app: Application, context: Context) {
            super(app, context)
        }

        update<T>(type: string | EntityClass<T>, entity: T, changes: EntityProps) {
            const op = super.update(type, entity, changes)

            return op
        }

        insert<T>(type: string | EntityClass<T>, changes: EntityProps) {
            if (this.getEntityClass(type) == TcaProductOptionExt) {
                if (!changes.name) {
                    changes.nameExt = "prova"
                }
            }

            return super.insert(type, changes)
        }

        delete<T>(type: string | EntityClass<T>, entity: T): (t: Transaction) => Promise<void> {
            const op = super.delete(type, entity)

            if (this.getEntityClass(type) == TcmProductOption) {
                return async (t: Transaction) => {
                    const io = this.getEntityIO(TcaProductOptionExt)
                    const productOption = entity as any as TcmProductOption

                    const poe = await (this.context as TypeORMContext).dataSource.getRepository(TcaProductOptionExt)
                        .findOne({ where: { productOption: { id: productOption.id } }})

                    if (poe) {
                        await io.delete(poe)(t)
                    }

                    await op(t)
                }
            }

            return op
        }
    }
})