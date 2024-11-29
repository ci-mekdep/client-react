import { AbilityBuilder, Ability } from '@casl/ability'

export type Subjects = string[]
export type Actions = 'read' | 'write'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string[]
  write?: string[]
}

const defineRulesFor = (role: string, subject: string[], write: string[]) => {
  const { can, rules } = new AbilityBuilder(AppAbility)
  let subjects

  if (role === 'principal' && subject) {
    subjects = subject.filter(item => item !== 'admin_schools')
  } else if (role === 'teacher' && subject) {
    subjects = subject.filter(item => item !== 'admin_schools' && item !== 'admin_classrooms')
  } else {
    subjects = subject
  }

  can('write', 'profile')
  can('read', 'dashboard')
  can('read', 'rating')

  can('read', subjects)
  can('write', write)

  return rules
}

export const buildAbilityFor = (role: string, subject: string[], write: string[]): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject, write), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'read',
  subject: ['dashboard']
}

export default defineRulesFor
