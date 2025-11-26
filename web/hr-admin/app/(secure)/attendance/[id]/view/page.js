"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAttendanceById } from "@/actions/attendances/server-actions";
import { AlertCircle, Calendar, Clock, MapPin, Info } from "lucide-react";
import { toast } from "sonner";

const AttendanceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getAttendanceById(params.id);

        if (response.success) {
          setAttendance(response.data);
        } else {
          setError(response.error || "Failed to fetch attendance details");
          toast.error(response.error || "Failed to fetch attendance details");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading attendance details...</p>
        </div>
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Attendance not found"}</p>
          <button
            onClick={() => router.push("/attendance")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Back to Attendance
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No Information Available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "No Information Available";
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-6">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600 shadow-lg">
                  <Calendar className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Attendance Record
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">
                    {formatDate(attendance.date)}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      attendance.onsite_or_remote
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {attendance.onsite_or_remote ? "Onsite" : "Remote"}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/attendance/${attendance.id}/edit`)}
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.push("/attendance")}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all shadow-md"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Basic Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="Attendance ID" value={attendance.id} />
              <InfoRow label="Date" value={formatDate(attendance.date)} />
              <InfoRow label="Employee" value={attendance.employeeName || `Employee ${attendance.employee}`} />
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Time Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="Check In" value={formatTime(attendance.checkIn)} />
              <InfoRow label="Check Out" value={formatTime(attendance.checkOut)} />
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Location Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow 
                label="Work Location" 
                value={attendance.onsite_or_remote ? "Onsite" : "Remote"} 
              />
              <InfoRow label="Check In IP" value={attendance.check_in_ip} />
              <InfoRow label="Check Out IP" value={attendance.check_out_ip} />
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Additional Information
              </h2>
            </div>
            <div className="space-y-4">
              <InfoRow 
                label="Remarks" 
                value={attendance.remarks} 
                multiline 
              />
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 mt-6">
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Record Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="Created At"
              value={formatDate(attendance.createdAt)}
            />
            <InfoRow
              label="Updated At"
              value={formatDate(attendance.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying information rows
const InfoRow = ({ label, value, multiline = false }) => {
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0">
      <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
      <p
        className={`text-gray-800 font-medium ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {value || "No Information Available"}
      </p>
    </div>
  );
};

export default AttendanceDetailsPage;
