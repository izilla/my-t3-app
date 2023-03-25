import { type NextPage } from "next";
import { SignInButton, useUser } from "@clerk/nextjs";
import { api, type RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Layout } from "~/components/layout";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser()

  const [input, setInput] = useState('')

  const ctx = api.useContext()

  const { mutate, isLoading: mutating } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("")
      void ctx.posts.getAll.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content ?? ''
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0], {
          position: "bottom-center"
        })
      }
    }
  })

  if (!user) return null

  return <div className="flex gap-4 w-full">
    <Image
      src={user.profileImageUrl}
      alt="Profile image"
      className="w-14 h-14 rounded-full"
      width={56}
      height={56}
    />
    <input
      className=" bg-transparent grow outline-none text-2xl"
      disabled={mutating}
      placeholder="Type some emojis"
      type="text"
      value={input}
      onChange={value => setInput(value.target.value || '')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (input !== "") {
            mutate({ content: input })
          }
        }
      }}
    />
    {input !== '' && !mutating && (
      <button onClick={() => mutate({ content: input })}>
        Post
      </button>
    )}

    {mutating && (
      <div className="flex items-center justify-center">
        <LoadingSpinner size={24} />
      </div>
    )}
  </div>
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = (props: PostWithUser) => {
  const { post, author } = props
  return (
    <div className="flex flex-row p-4 border-b border-slate-400 gap-3">
      <Image
        src={author.profileImageUrl}
        alt={`${author.username} Profile image`}
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}>
            <span className="font-semibold">
              {`@${author.username}`}
            </span>
          </Link>
          ·
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-2xl">
          {post.content}
        </span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery()

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => <PostView key={fullPost.post.id} {...fullPost} />)}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser()

  api.posts.getAll.useQuery()

  // Return empty if BOTH user and posts don't load
  if (!userLoaded) return <div />

  return (
    <Layout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>)
        }
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </Layout>
  )
}

export default Home;
