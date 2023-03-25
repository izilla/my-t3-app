import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Image from 'next/image'
import Head from 'next/head'
import { api } from '~/utils/api'

import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { prisma } from '~/server/db'
import { appRouter } from '~/server/api/root'

import superjson from 'superjson'
import { Layout } from '~/components/layout';

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username
  })

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>@{data.username}</title>
      </Head>
      <Layout>
        <div className='relative h-36 border-slate-400 bg-slate-600'>
          <Image className="absolute rounded-full -mb-[64px] border-4 border-black bottom-0 left-0 ml-4 bg-black" src={data.profileImageUrl} alt={`${data.username ?? ''}'s Profile image`} width={128} height={128} />
        </div>
        <div className='h-[64px]' />
        <div className='p-4'>
          <div className='text-2xl font-bold'>{`@${data.username}`}</div>
        </div>
        <div className="border-b w-full" />
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson
  });
  const slug = context.params?.slug

  if (typeof slug !== 'string') throw new Error("no slug")

  const username = slug.replace(/^@/, '')

  const user = await ssg.profile.getUserByUsername.prefetch({ username })

  console.log(user)

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}

export default ProfilePage