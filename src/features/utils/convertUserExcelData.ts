export const convertUserExcelData = (json: any, school_id: string | undefined) => {
  if (!school_id) return

  const data = json.map((row: any, index: number) => {
    const newObj: any = {}
    newObj.id = index + 1
    newObj.last_name = row.last_name
    newObj.first_name = row.first_name
    newObj.middle_name = row.middle_name
    newObj.birthday = row.birthday
    newObj.phone = row.phone
    newObj.classroom_name = row.classroom_name
    newObj.schools = [
      {
        role_code: 'student',
        school_id: school_id
      }
    ]
    newObj.parents = []

    if (row['mother.last_name'] !== '') {
      newObj.parents.push({
        id: `${index + 1}m`,
        last_name: row['mother.last_name'],
        first_name: row['mother.first_name'],
        middle_name: row['mother.middle_name'],
        birthday: row['mother.birthday'],
        phone: row['mother.phone'],
        schools: [{ role_code: 'parent', school_id: school_id }]
      })
    }
    if (row['father.last_name'] !== '') {
      newObj.parents.push({
        id: `${index + 1}f`,
        last_name: row['father.last_name'],
        first_name: row['father.first_name'],
        middle_name: row['father.middle_name'],
        birthday: row['father.birthday'],
        phone: row['father.phone'],
        schools: [{ role_code: 'parent', school_id: school_id }]
      })
    }

    return newObj
  })

  return data
}
