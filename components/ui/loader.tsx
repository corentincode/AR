import { Loader2 } from "lucide-react"

interface LoaderProps {
  text?: string
}

export function Loader({ text }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-white">
      <Loader2 className="h-8 w-8 animate-spin" />
      {text && <p className="text-sm">{text}</p>}
    </div>
  )
}

