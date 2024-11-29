import { useContext } from 'react'
import { SettingsContext, SettingsContextValue } from 'src/shared/context/settingsContext'

export const useSettings = (): SettingsContextValue => useContext(SettingsContext)
