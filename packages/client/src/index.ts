export { DataSet, DataSetUtils } from './client/DataSet'
export { IQuery } from './client/IQuery'
export { IReactiveQuery } from './client/IReactiveQuery'
export { Query } from './client/Query'
export { Item } from './client/Item'
export { ReactiveValue } from './client/ReactiveValue'
export { ItemData, ItemProps, ItemId, ItemFilter, ItemProp, QuerySortFn, ServerError, ServerErrors } from './client/types'
export { INotificationBroker, NotificationListener, useEventSource } from './client/NotificationBroker'
export { useFetch, IDataBroker, setResponseHandler  } from './client/DataBroker'
export { buildUrl, filterObject, groupBy, groupByAndMap } from './client/utils'

import { setDataAuthToken  } from './client/DataBroker'
import { setEventAuthToken  } from './client/NotificationBroker'

export function setAuthToken(accessToken: string) {
    setDataAuthToken(accessToken)
    setEventAuthToken(accessToken)
}
