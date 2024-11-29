// ** Next Import
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Components Imports
import SettingsPage from 'src/widgets/settings/SettingsPage'

const SettingsViewPage = ({ tab }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SettingsPage tab={tab} />
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'general' } },
      { params: { tab: 'lesson' } },
      { params: { tab: 'subject' } },
      { params: { tab: 'books' } },
      { params: { tab: 'topics' } },
      { params: { tab: 'contact-items' } },
      { params: { tab: 'user-logs' } }
    ],
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  return {
    props: {
      tab: params?.tab
    }
  }
}

SettingsViewPage.acl = {
  action: 'read',
  subject: 'admin_settings'
}

export default SettingsViewPage
