"use client"
import * as React from "react"
import { ChevronDown, ExternalLink } from "lucide-react"

type VideoLink = {
  url: string;
  label?: string;
}

type Video = {
  title: string;
  links: VideoLink[];
}

export default function CollapsibleVideos({ videos }: { videos: Video[] }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="mb-4">
      <button
        className="flex items-center gap-2 bg-[#ECB22D] text-[#010124] text-xs font-semibold px-2 py-1 rounded hover:bg-yellow-300 transition mb-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        Tutorial Videos
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-4">
          {videos.map((video, idx) => (
            <div key={idx} className="w-full">
              <div className="font-medium text-gray-800 mb-1">{video.title}</div>
              <div className="flex flex-col gap-2">
                {video.links.map((link, lidx) => (
                  <a
                    key={lidx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#010124] text-white px-4 py-2 rounded font-semibold hover:bg-[#020135] transition"
                  >
                    {link.label || "Watch Video"} <ExternalLink className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CollapsibleLinks({ links, buttonLabel }: { links: { label: string; url: string }[], buttonLabel: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="mb-4">
      <button
        className="flex items-center gap-2 bg-[#ECB22D] text-[#010124] text-xs font-semibold px-2 py-1 rounded hover:bg-yellow-300 transition mb-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {buttonLabel}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="ml-4 space-y-2">
          {links.map((link, idx) => (
            <li key={idx}>
              <a
                className="inline-flex items-center gap-1 text-blue-700 font-medium hover:underline hover:text-blue-900 transition"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 