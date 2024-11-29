import { SessionType } from 'src/entities/app/SessionType'

export const convertSessionData = (data: SessionType[]) => {
  const sessionData = <any>{}
  for (const item of data) {
    const os = item.os
    if (!sessionData[os]) {
      sessionData[os] = []
    }
    sessionData[os].push(item)
  }

  return Object.keys(sessionData).map(os => ({
    os,
    data: sessionData[os]
  }))
}
