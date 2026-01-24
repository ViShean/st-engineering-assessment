export const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-gray-100">
        <td className="px-6 py-4">
          <div className="h-4 w-8 rounded bg-gray-200" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-12 rounded bg-gray-200" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-32 rounded bg-gray-300" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-40 rounded bg-gray-200" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-full rounded bg-gray-200" />
        </td>
      </tr>
    ))}
  </>
);
