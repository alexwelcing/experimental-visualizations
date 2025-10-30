'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { trpc } from '@/lib/trpc'

interface User {
  user_id: string
  email_address: string
  first_name?: string
  last_name?: string
  accountId: string
}

export function UserTable({ companyId }: { companyId: string }) {
  const { data: users = [], isLoading } = trpc.company.listUsers.useQuery({
    companyId,
  })

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'first_name',
        header: 'First Name',
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
      },
      {
        accessorKey: 'email_address',
        header: 'Email',
      },
      {
        accessorKey: 'accountId',
        header: 'Account',
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="space-x-2">
            <button
              onClick={() => handleManageProducts(row.original)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Manage Products
            </button>
            <button
              onClick={() => handleManageProfiles(row.original)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Manage Profiles
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleManageProducts = (user: User) => {
    // Open modal/drawer for product management
    console.log('Manage products for', user)
  }

  const handleManageProfiles = (user: User) => {
    // Open modal/drawer for profile management
    console.log('Manage profiles for', user)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left font-semibold">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
