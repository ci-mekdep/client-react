const days = ['Ýe', 'Du', 'Si', 'Ça', 'Pe', 'An', 'Şe']
const months = [
  'Ýanwar',
  'Fewral',
  'Mart',
  'Aprel',
  'Maý',
  'Iýun',
  'Iýul',
  'Awgust',
  'Sentýabr',
  'Oktýabr',
  'Noýabr',
  'Dekabr'
]
const dayPeriods = ['ertir', 'gün', 'agşam', 'gije']

export const tmLocale = {
  localize: {
    day: (n: number) => days[n],
    month: (n: number) => months[n],
    ordinalNumber: (dirtyNumber: any) => {
      const number = Number(dirtyNumber)
      const suffix = '-i'

      return number + suffix
    },
    era: () => ['b.e. öň', 'b.e. soň'],
    quarter: () => ['1 çärýek', '2 çärýek', '3 çärýek', '4 çärýek'],
    dayPeriod: (hours: number) => {
      if (hours >= 0 && hours < 6) return dayPeriods[3]
      if (hours >= 6 && hours < 12) return dayPeriods[0]
      if (hours >= 12 && hours < 18) return dayPeriods[1]
      if (hours >= 18 && hours < 24) return dayPeriods[2]

      return ''
    }
  },
  formatDistance: (token: any, count: any, options: any) => {
    const isFuture = options && options.addSuffix === 'future'

    switch (token) {
      case 'lessThanXSeconds':
        return '1 sekunt öň'
      case 'xSeconds':
        return isFuture ? count + ' sekuntdan' : count + ' sekunt öň'
      case 'lessThanXMinutes':
        return '1 minut öň'
      case 'xMinutes':
        return isFuture ? count + ' minutdan' : count + ' minut öň'
      case 'aboutXHours':
        return isFuture ? 'takmynan ' + count + ' sagatdan' : count + ' sagada golaý öň'
      case 'xHours':
        return count + ' sagat'
      case 'xDays':
        return count + ' gün'
      case 'aboutXWeeks':
        return isFuture ? 'takmynan ' + count + ' hepdeden' : count + ' hepde öň'
      case 'xWeeks':
        return count + ' hepde'
      case 'aboutXMonths':
        return isFuture ? 'takmynan ' + count + ' aýa aýdan' : count + ' aýa golaý öň'
      case 'xMonths':
        return isFuture ? count + ' aýdan' : count + ' aý öň'
      case 'aboutXYears':
        return isFuture ? 'takmynan ' + count + ' ýyldan' : count + ' ýyl öň'
      case 'xYears':
        return isFuture ? count + ' ýyl' : count + ' ýyl'
      case 'overXYears':
        return isFuture ? count + ' ýyldan köp' : count + ' ýyldan köp'
      case 'almostXYears':
        return isFuture ? count + ' ýyla golaý' : count + ' ýyla golaý'
      default:
        return ''
    }
  },
  formatLong: {
    date: () => 'dd.MM.yyyy',
    time: () => 'HH:mm',
    dateTime: () => '{{date}}, {{time}}'
  },
  match: {
    ordinalNumber: (pattern: any) => pattern.match(/\d+/),
    era: (pattern: any) => {
      if (/^(b\.e\. öň|b\.e\. soň)$/i.test(pattern)) return [pattern, pattern]

      return null
    },
    quarter: (pattern: any) => {
      if (/^1 çärýek|2 çärýek|3 çärýek|4 çärýek$/i.test(pattern)) return [pattern, pattern]

      return null
    },
    month: (pattern: any) => {
      const index = months.findIndex(month => month.toLowerCase() === pattern.toLowerCase())
      if (index !== -1) return [pattern, pattern]

      return null
    },
    day: (pattern: any) => {
      const index = days.findIndex(day => day.toLowerCase() === pattern.toLowerCase())
      if (index !== -1) return [pattern, pattern]

      return null
    },
    dayPeriod: (pattern: any) => {
      const index = dayPeriods.findIndex(period => period.toLowerCase() === pattern.toLowerCase())
      if (index !== -1) return [pattern, pattern]

      return null
    }
  }
}
