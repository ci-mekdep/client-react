const subjectColors = [
  {
    name: 'Algebra',
    color: '#FBECC6',
    dark_color: '#5C4F29'
  },
  {
    name: 'Astronomiýa',
    color: '#F0ECEC',
    dark_color: '#4D3F3F'
  },
  {
    name: 'Aýdym-saz',
    color: '#FFC9CC',
    dark_color: '#5E292B'
  },
  {
    name: 'Bedenterbiýe',
    color: '#F7F9F8',
    dark_color: '#444545'
  },
  {
    name: 'Biologiýa',
    color: '#FEE1E8',
    dark_color: '#5C3C42'
  },
  {
    name: 'Çeper. zähmeti',
    color: '#BEC6EB',
    dark_color: '#272A47'
  },
  {
    name: 'Döwr. Tehno. E.',
    color: '#FCF2F3',
    dark_color: '#564D4E'
  },
  {
    name: 'Dünýä med.',
    color: '#B5CBCC',
    dark_color: '#2A3939'
  },
  {
    name: 'Dünýä taryhy',
    color: '#FFFFDB',
    dark_color: '#4B4B30'
  },
  {
    name: 'Edebiýat',
    color: '#F3DBBE',
    dark_color: '#533E2C'
  },
  {
    name: 'Ekologiýa',
    color: '#F3B0C3',
    dark_color: '#533038'
  },
  {
    name: 'Ählumumy taryh',
    color: '#D5DEFD',
    dark_color: '#2A2D4F'
  },
  {
    name: 'Fizika',
    color: '#DBE6DB',
    dark_color: '#334133'
  },
  {
    name: 'Geografiýa',
    color: '#CDDEEF',
    dark_color: '#2D3E49'
  },
  {
    name: 'Geometriýa',
    color: '#ECD5E3',
    dark_color: '#53414B'
  },
  {
    name: 'Himiýa',
    color: '#DED5EC',
    dark_color: '#383247'
  },
  {
    name: 'Informatika',
    color: '#E0B4B4',
    dark_color: '#472828'
  },
  {
    name: 'Informatika',
    color: '#ECD5E3',
    dark_color: '#53414B'
  },
  {
    name: 'IKIT',
    color: '#B4E0CD',
    dark_color: '#294036'
  },
  {
    name: 'Iňlis dili',
    color: '#CDBDE7',
    dark_color: '#31214C'
  },
  {
    name: 'Jemgyýet',
    color: '#A2DB8E',
    dark_color: '#2A4721'
  },
  {
    name: 'Matematika',
    color: '#8EBFDB',
    dark_color: '#1F3F52'
  },
  {
    name: 'Model we G.',
    color: '#DB8E8E',
    dark_color: '#522121'
  },
  {
    name: 'Ene dili',
    color: '#8EDBD6',
    dark_color: '#21423F'
  },
  {
    name: 'Okuw',
    color: '#FBECC6',
    dark_color: '#5C4F29'
  },
  {
    name: 'Özüňi alyp B.M.',
    color: '#F0ECEC',
    dark_color: '#4D3F3F'
  },
  {
    name: 'Proýek. Esas.',
    color: '#FFC9CC',
    dark_color: '#5E292B'
  },
  {
    name: 'Rus dili',
    color: '#F7F9F8',
    dark_color: '#444545'
  },
  {
    name: 'Rus edebiýaty',
    color: '#FEE1E8',
    dark_color: '#5C3C42'
  },
  {
    name: 'Türkmen edebiýaty',
    color: '#BEC6EB',
    dark_color: '#272A47'
  },
  {
    name: 'Şekil. Sun.',
    color: '#FCF2F3',
    dark_color: '#564D4E'
  },
  {
    name: 'Surat',
    color: '#B5CBCC',
    dark_color: '#2A3939'
  },
  {
    name: 'Tebigat',
    color: '#FFFFDB',
    dark_color: '#4B4B30'
  },
  {
    name: 'Türkmen dili',
    color: '#F3DBBE',
    dark_color: '#533E2C'
  },
  {
    name: 'Hukuk esaslary',
    color: '#F3B0C3',
    dark_color: '#533038'
  },
  {
    name: 'Medeni miras',
    color: '#D5DEFD',
    dark_color: '#2A2D4F'
  },
  {
    name: 'T-nyň taryhy',
    color: '#DBE6DB',
    dark_color: '#334133'
  },
  {
    name: 'Ykdysadyýet',
    color: '#CDDEEF',
    dark_color: '#2D3E49'
  },
  {
    name: 'Ýaşaýyş D.E.',
    color: '#ECD5E3',
    dark_color: '#53414B'
  },
  {
    name: 'Ýazuw',
    color: '#DED5EC',
    dark_color: '#383247'
  },
  {
    name: 'Zähmet',
    color: '#E0B4B4',
    dark_color: '#472828'
  },
  {
    name: 'Durmuş zähmeti',
    color: '#ECD5E3',
    dark_color: '#53414B'
  },
  {
    name: 'Çyzuw',
    color: '#B4E0CD',
    dark_color: '#294036'
  },
  {
    name: 'Synp sagady',
    color: '#CDBDE7',
    dark_color: '#31214C'
  },
  {
    name: 'Nemes dili',
    color: '#A2DB8E',
    dark_color: '#2A4721'
  },
  {
    name: 'Fransuz dili',
    color: '#8EBFDB',
    dark_color: '#1F3F52'
  },
  {
    name: 'Ýapon dili',
    color: '#DB8E8E',
    dark_color: '#522121'
  },
  {
    name: 'Hytaý dili',
    color: '#8EDBD6',
    dark_color: '#21423F'
  },
  {
    name: 'Pars dili',
    color: '#FBECC6',
    dark_color: '#5C4F29'
  },
  {
    name: 'Arap dili',
    color: '#F0ECEC',
    dark_color: '#4D3F3F'
  },
  {
    name: 'Daşary ýurt dili',
    color: '#DBE6DB',
    dark_color: '#334133'
  },
  {
    name: 'Daşary ýurt dili (garyşyk)',
    color: '#FCF2F3',
    dark_color: '#564D4E'
  }
]

export default subjectColors
