import React, { useState } from "react";
import type { Comment } from "../../types/comment";
import { TableSkeleton } from "./TableSkeleton";

// Utility to wrap matching search terms in a <mark> tag
const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) => {
  if (!highlight?.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-100 text-yellow-900 rounded-sm font-bold"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

interface TableProps {
  data: Comment[];
  isLoading: boolean;
  searchTerm?: string;
}

export const Table: React.FC<TableProps> = ({
  data,
  isLoading,
  searchTerm,
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4">
          {searchTerm ? "🔍" : "📁"}
        </div>
        <h3 className="text-slate-900 font-black text-lg">
          {searchTerm ? "No matches found" : "No data available"}
        </h3>
        <p className="text-slate-400 mt-1 text-sm">
          {searchTerm
            ? `No results for "${searchTerm}"`
            : "Please upload a CSV file."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border-b border-slate-100">
                #
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                id
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                Name
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                Email
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                Body
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 text-right">
                Post ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              data.map((row) => {
                const rowKey = `${row.comment_id}-${row.rowNumber}`;
                const isExpanded = expandedRows[rowKey];
                return (
                  <tr
                    key={rowKey}
                    className="group hover:bg-indigo-50/30 transition-all duration-200 align-top"
                  >
                    <td className="px-8 py-6 text-xs font-bold text-slate-300 group-hover:text-indigo-400">
                      {row.rowNumber.toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-6 text-[11px] font-mono font-bold text-slate-400">
                      {row.comment_id}
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-slate-800">
                      <HighlightedText text={row.name} highlight={searchTerm} />
                    </td>
                    <td className="px-6 py-6 text-sm text-slate-500 italic">
                      <HighlightedText
                        text={row.email}
                        highlight={searchTerm}
                      />
                    </td>
                    <td className="px-6 py-6 max-w-md">
                      <div
                        onClick={() => toggleRow(rowKey)}
                        className="cursor-pointer group/content"
                      >
                        <p
                          className={`text-sm text-slate-600 leading-relaxed font-medium ${isExpanded ? "" : "line-clamp-2"}`}
                        >
                          <HighlightedText
                            text={row.body}
                            highlight={searchTerm}
                          />
                        </p>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter opacity-0 group-hover/content:opacity-100 transition-opacity mt-1 block">
                          {isExpanded ? "↑ Collapse" : "↓ Expand"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 shadow-sm">
                        {row.postId}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
