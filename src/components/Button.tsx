import React from 'react'

interface Props {
  children: React.ReactChild
  onClick: () => void
}

export default function Button({children, onClick}: Props) {
  return (
    <button
      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
