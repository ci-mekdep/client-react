// ** React Imports
import { useState } from 'react'

// ** Custom Components Imports
import OtpInput from './inputs/OtpInput'
import PhoneInput from './inputs/PhoneInput'
import SchoolSelect from './inputs/SchoolSelect'
import { SchoolListType } from 'src/entities/school/SchoolType'
import { ApiInstanceType } from 'src/entities/app/AppSettingsType'

const OtpForm = () => {
  const [step, setStep] = useState<string>('school')
  const [phone, setPhone] = useState<string>('')
  const [school, setSchool] = useState<SchoolListType | null>(null)
  const [welayat, setWelayat] = useState<ApiInstanceType | null>(null)
  const [region, setRegion] = useState<SchoolListType | null>(null)

  if (step === 'school') {
    return (
      <SchoolSelect
        school={school}
        setSchool={setSchool}
        welayat={welayat}
        setWelayat={setWelayat}
        region={region}
        setRegion={setRegion}
        setStep={setStep}
      />
    )
  } else if (step === 'phone') {
    return <PhoneInput school={school} phone={phone} setPhone={setPhone} setStep={setStep} />
  } else if (step === 'otp') {
    return <OtpInput school={school} phone={phone} setStep={setStep} />
  }

  return <></>
}

export default OtpForm
