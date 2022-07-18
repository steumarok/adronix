import { Objects } from "@adronix/base";
import { Application, ItemCollector, Module, PaginatedList } from "@adronix/server";
import { ITypeORMManager, TypeORMPersistence } from "@adronix/typeorm";
import { TcmIngredient } from "./entities/TcmIngredient";
import { TcmProductOption } from "./entities/TcmProductOption";
import { TcmProductOptionValue } from "./entities/TcmProductOptionValue";

export { TcmIngredient, TcmProductOption, TcmProductOptionValue }
export const TcmEntities = [ TcmIngredient, TcmProductOption, TcmProductOptionValue ]


export type TestApplication = Application & ITypeORMManager

export class Module1Persistence extends TypeORMPersistence {
    constructor(app: TestApplication) {
        super(app);

        this.defineEntityIO(
            TcmProductOption,
            (validator, changes) => validator
                .addRule("name", () => changes.name != "", { message: 'empty' }))

        this.defineEntityIO(
            TcmProductOptionValue,
            (validator, changes) => validator
                .addRule("price", () => changes.price != 0, { message: 'price not valid' }))
    }
}


export class Module1 extends Module<TestApplication> {
    constructor(app: TestApplication) {
        super(app)

        this.usePersistence(Objects.create(Module1Persistence, app))

        this.registerProvider("/listProductOption", this.listProductOption, this.describe)
        this.registerProvider("/editProductOption", this.editProductOption, this.describe)
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

