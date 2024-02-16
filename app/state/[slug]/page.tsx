import React from 'react'

const state = ({ params }: { params: { slug: string } }) => {
  return <div>Parlons de l&apos;état {params.slug}</div>
}

export default state
