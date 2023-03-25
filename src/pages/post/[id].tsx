import { type NextPage } from 'next'
import Image from 'next/image'
import Head from 'next/head'
import { LoadingPage } from '~/components/loading'
import { api } from '~/utils/api'

const SinglePostPage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: 'izilla'
  })

  if (isLoading) return <LoadingPage />

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>Post view</div>
        <Image className="w-10 h-10" src={data.profileImageUrl} alt="Profile image" width={56} height={56} />
      </main>
    </>
  )
}

export default SinglePostPage