import React, { useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { getUserHistory } from "../../redux/slices/auth.slice";
import { userAllHistory} from "../../redux/slices/auth.slice";

function History() {
  const meetings = useSelector(userAllHistory).meetings;
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(getUserHistory());
  }, [dispatch]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar mode="home" />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black-700 text-center">Meeting History</h1>
          <p className="text-gray-500 mt-1 text-sm">
            All your past meetings in one place
          </p>
        </div>

        {/* Empty State */}
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-blue-700 font-semibold text-lg">
              No meetings yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Your meeting history will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Count badge */}
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {meetings.length}{" "}
                {meetings.length === 1 ? "Meeting" : "Meetings"}
              </span>
            </div>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 mb-1">
              <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase">
                #
              </div>
              <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase">
                Meeting Code
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase">
                Date
              </div>
              <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase">
                Time
              </div>
            </div>

            {/* Meeting Rows */}
            <div className="flex flex-col gap-3">
              {meetings.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 items-center bg-white border border-blue-100 rounded-xl px-4 py-4 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
                >
                  {/* Index */}
                  <div className="col-span-1">
                    <span className="text-blue-300 font-bold text-sm">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Meeting Code */}
                  <div className="col-span-11 md:col-span-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 md:hidden">
                          Meeting Code
                        </p>
                        <p className="font-mono text-sm font-semibold text-blue-700 break-all">
                          {item.meeting_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-6 md:col-span-3 md:block">
                    <p className="text-xs text-gray-400 md:hidden">Date</p>
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="col-span-6 md:col-span-3">
                    <p className="text-xs text-gray-400 md:hidden">Time</p>
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {formatTime(item.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default History;
