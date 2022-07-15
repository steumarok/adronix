import { DataSource } from 'typeorm'
import { EditProductOptionProcessor, TcmProductOption } from '@adronix/test-module-01'
import { TypeORMTransactionManager } from '@adronix/typeorm'
import { Objects } from '@adronix/base'
import { TcaProductOptionExt } from '../entities/TcaProductOptionExt'
import { TcaProductOptionExtIO } from '../persistence/TcaProductOptionExtIO'

export default () => {
    Objects.override(EditProductOptionProcessor, base => {
        return class extends base {
            constructor(transactionManager: TypeORMTransactionManager) {
                super(transactionManager)
                this.addEntityIO(TcaProductOptionExt, Objects.create(TcaProductOptionExtIO, transactionManager.dataSource), transactionManager)
            }

            protected async getItems(params: Map<String, any>) {
                const poe =  await this.transactionManager.dataSource.getRepository(TcaProductOptionExt)
                    .createQueryBuilder("poe")
                    .leftJoinAndSelect("poe.productOption", 'productOption')
                    .where("poe.productOption.id = :id", { id: params.get('id') })
                    .getOne()
                return (await super.getItems(params))
                  .addOne(poe ? poe : await this.newExt(params.get('id')))
                  .describe(TcaProductOptionExt, ['nameExt', 'productOption']);
            }

            protected async newExt(idProductOption: string) {
                const po =  await this.transactionManager.dataSource.getRepository(TcmProductOption)
                    .createQueryBuilder("po")
                    .where("po.id = :id", { id: idProductOption })
                    .getOne()

                const poe = new TcaProductOptionExt()
                poe.productOption = po
                poe.nameExt = po.name + " ext"
                return poe
            }
        }
    })
}
