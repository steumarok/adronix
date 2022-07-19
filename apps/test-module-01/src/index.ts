import { Objects } from "@adronix/base";
import { EntityProps } from "@adronix/persistence/src";
import { Application, ItemCollector, Module, PaginatedList } from "@adronix/server";
import { ITypeORMManager, TypeORMPersistence } from "@adronix/typeorm";
import { TcmProductOptionValue, TcmProductOption, TcmIngredient } from "./entities";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]


export type TestApplication = Application & ITypeORMManager



export class Module1Persistence extends TypeORMPersistence {
    constructor(app: TestApplication) {
        super(app);

        this
            .defineEntityIO(TcmProductOption)
                .rule("name", (changes) => !!changes.name, { message: 'empty' })

            .defineEntityIO(TcmProductOptionValue)
                .rule("price", (changes) => changes.price != 0, { message: 'price not valid' })
    }
}


export class Module1 extends Module<TestApplication> {
    constructor(app: TestApplication) {
        super(app)

        this.usePersistence(this.buildPersistence())

        this.registerProvider("/listProductOption", this.listProductOption, this.describe)
        this.registerProvider("/editProductOption", this.editProductOption, this.describe)
    }

    buildPersistence() {
        return TypeORMPersistence.build(this.app)
            .defineEntityIO(TcmProductOption)
                .rule('name', changes => !!changes.name,{ message: 'empty' })
                .asyncRule("name", this.checkName.bind(this), { message: 'name not valid' })
            .defineEntityIO(TcmProductOptionValue)
                //.asyncRule("price", this.checkPrice, { message: 'price not valid' })
            .create()
    }

    async checkName({name}, entity?: TcmProductOption) {
        let query = this.app.getDataSource().getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .where('po.name = :name', { name })
        if (entity) {
            query = query.andWhere('po.id <> :id', { id: entity.id })
        }
        const count = await query.getCount()
        console.log(count)
        return count == 0
    }

    describe(collector: ItemCollector) {
        return collector
            .describe(TcmProductOption, ['name', 'ingredients'])
            .describe(TcmIngredient, ['name'])
            .describe(TcmProductOptionValue, ['price', 'productOption']);
    }

    async listProductOption({ page, limit }) {

        const [ pos, count ] = await this.app.getDataSource().getRepository(TcmProductOption)
            .createQueryBuilder("po")
            .skip((parseInt(page)-1) * parseInt(limit))
            .take(parseInt(limit))
            .getManyAndCount()


        return [PaginatedList(TcmProductOption, pos, count)]
    }

    async editProductOption({ id }) {

        const po =
            id
                ? await this.app.getDataSource().getRepository(TcmProductOption)
                    .createQueryBuilder("po")
                    .leftJoinAndSelect("po.ingredients", "ingredient")
                    .where("po.id = :id", { id })
                    .getOne()
                : new TcmProductOption()

        return [po]
    }
}

