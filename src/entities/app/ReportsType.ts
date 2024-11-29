import { LiteModelType } from './GeneralTypes'

type DataReportsSettingsType = {
  school_id: string
  items: LiteModelType[]
}

export type DataReportsUpdateType = {
  settings: DataReportsSettingsType[]
}
