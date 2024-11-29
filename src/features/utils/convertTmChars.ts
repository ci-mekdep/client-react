export const convertTmChars = (text: string | number) => {
  if (typeof text == 'string') {
    let convertedText = ''

    const charMap: { [key: string]: string } = {
      Ç: 'C',
      ç: 'c',
      Ä: 'A',
      ä: 'a',
      Ž: 'Z',
      ž: 'z',
      Ň: 'N',
      ň: 'n',
      Ö: 'O',
      ö: 'o',
      Ş: 'S',
      ş: 's',
      Ü: 'U',
      ü: 'u',
      Ý: 'Y',
      ý: 'y'
    }

    convertedText = text.replace(/[ÇçÄäŽžŇňÖöŞşÜüÝý]/g, function (match) {
      return charMap[match]
    })

    return convertedText
  } else {
    return text
  }
}
