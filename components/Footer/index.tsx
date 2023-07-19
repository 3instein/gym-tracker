import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <div className="flex justify-center mt-8 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        &copy; 2023 Gym Tracker. All rights reserved.
      </p>

      <Link
        href="https://github.com/3instein"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-1 text-sm text-gray-600 dark:text-gray-400 hover:underline"
      >
        Reynaldi Kindarto
      </Link>
    </div>
  )
}
