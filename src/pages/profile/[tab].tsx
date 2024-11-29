// ** Next Import
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Demo Components Imports
import ProfileViewPage from 'src/widgets/profile/ProfileViewPage'

const ProfileView = ({ tab }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <ProfileViewPage tab={tab} />
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'about' } },
      { params: { tab: 'security' } },
      { params: { tab: 'devices' } },
      { params: { tab: 'excuses' } },
      { params: { tab: 'school' } }
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

ProfileView.acl = {
  action: 'write',
  subject: 'profile'
}

export default ProfileView
