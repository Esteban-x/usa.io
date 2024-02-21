'use client'
import React, { useState } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'
import '../globals.css'
import { states } from '../data/states'
import Link from 'next/link'
import Image from 'next/image'

const Map = () => {
  const [hoverState, setHoverState] = useState('')
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="big:w-[2003px] big:h-[1180px] h-full w-full sm:mr-20 lg:mr-28 se:mr-10 fold:mr-6"
      style={{
        strokeLinejoin: 'round',
        stroke: '#000',
        strokeOpacity: 0.03,
        fill: 'none',
      }}
      version="1.1"
      viewBox="0 0 1000 589"
      id="map"
    >
      <defs>
        {states.map((state, index) => (
          <pattern
            key={index}
            id={`pattern_${state.id}`}
            patternUnits="objectBoundingBox"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image
              href={state.hover}
              preserveAspectRatio="none"
              width="1"
              height="1"
              x="0"
              y="0"
            />
          </pattern>
        ))}
      </defs>
      {states.map((state, index) => (
        <HoverCard.Root key={index} openDelay={300} closeDelay={1}>
          <HoverCard.Trigger asChild>
            <Link
              href={`/state/${state.slug}`}
              onMouseEnter={() => setHoverState(state.id)}
              onMouseLeave={() => setHoverState('')}
            >
              <path
                d={state.d}
                style={{
                  fill: state.color,
                  cursor: 'pointer',
                }}
              />
              <path
                d={state.d}
                style={{
                  fill: `url(#pattern_${state.id})`,
                  cursor: 'pointer',
                  opacity: hoverState === state.id ? 1 : 0,
                  transition: 'opacity 0.1s ease-in-out',
                }}
              />
            </Link>
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content
              className="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade w-[300px] rounded-2xl bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
              sideOffset={5}
            >
              <div className="flex flex-col gap-[7px]">
                <div className="flex flex-row items-center space-x-6">
                  <Image
                    className="block h-[60px] w-[60px] rounded-full"
                    src={`/flags/${state.id}.png`}
                    alt={state.name}
                    width={50}
                    height={50}
                  />
                  <div className="text-mauve12 m-0 text-[25px] font-medium leading-[1.5]">
                    {state.name}
                  </div>
                </div>
                <div className="flex flex-col gap-[15px]">
                  <div>
                    <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">
                      Meteo : ☀️ 49°C
                    </div>
                    <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">
                      Habitants : 4 000 000
                    </div>
                  </div>
                  <div className="text-mauve12 m-0 text-[15px] leading-[1.5]">
                    Components, icons, colors, and templates for building
                    high-quality, accessible UI. Free and open-source.
                  </div>
                </div>
              </div>

              <HoverCard.Arrow className="fill-white" />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      ))}
    </svg>
  )
}

export default Map
