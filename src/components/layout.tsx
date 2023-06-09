import type { PropsWithChildren } from "react"

export const Layout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="h-full w-full border-x md:max-w-2xl border-slate-400 overflow-y-scroll">
        {props.children}
      </div>
    </main>
  )
}