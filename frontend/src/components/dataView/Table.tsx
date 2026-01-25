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
            className="bg-amber-200/80 text-amber-900 rounded font-semibold"
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
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-inner">
          {searchTerm ? "🔍" : "📁"}
        </div>
        <h3 className="text-slate-800 font-bold text-xl">
          {searchTerm ? "No matches found" : "No data available"}
        </h3>
        <p className="text-slate-500 mt-2 text-sm max-w-xs text-center">
          {searchTerm
            ? `We couldn't find any results for "${searchTerm}"`
            : "Upload a CSV file to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-200/60">
              <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 w-12 text-center">
                #
              </th>
              <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 w-20 text-center">
                Id
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 min-w-[150px] text-left">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 min-w-[200px] text-left">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 text-left">
                Body
              </th>
              <th className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide border-b border-slate-200 text-center w-20">
                Post
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              data.map((row, index) => {
                const rowKey = `${row.comment_id}-${row.rowNumber}`;
                const isExpanded = expandedRows[rowKey];
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={rowKey}
                    className={`group transition-colors duration-150 align-top ${
                      isEven ? "bg-white" : "bg-slate-50/50"
                    } hover:bg-indigo-50/60`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">
                      {row.rowNumber.toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                        {row.comment_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800">
                        <HighlightedText
                          text={row.name}
                          highlight={searchTerm}
                        />
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                        <HighlightedText
                          text={row.email}
                          highlight={searchTerm}
                        />
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-lg">
                      <div
                        onClick={() => toggleRow(rowKey)}
                        className="cursor-pointer group/content"
                      >
                        <p
                          className={`text-sm text-slate-600 leading-relaxed ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          <HighlightedText
                            text={row.body}
                            highlight={searchTerm}
                          />
                        </p>
                        <button className="mt-2 text-xs font-medium text-indigo-500 hover:text-indigo-700 opacity-0 group-hover/content:opacity-100 transition-all flex items-center gap-1">
                          {isExpanded ? (
                            <>
                              <span>Show less</span>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>Show more</span>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100">
                        #{row.postId}
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
