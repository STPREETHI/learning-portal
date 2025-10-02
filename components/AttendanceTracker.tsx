import React, { useState, useEffect } from 'react';
import { Ward, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceTrackerProps {
  wards: Ward[];
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ wards, attendanceRecords, onUpdateAttendance }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [currentStatuses, setCurrentStatuses] = useState<{ [wardId: string]: AttendanceStatus }>({});

  useEffect(() => {
    const recordForDate = attendanceRecords.find(r => r.date === selectedDate);
    const initialStatuses: { [wardId: string]: AttendanceStatus } = {};
    wards.forEach(ward => {
      const existingStatus = recordForDate?.statuses.find(s => s.wardId === ward.id)?.status;
      initialStatuses[ward.id] = existingStatus || 'present'; // Default to present
    });
    setCurrentStatuses(initialStatuses);
  }, [selectedDate, wards, attendanceRecords]);

  const handleStatusChange = (wardId: string, status: AttendanceStatus) => {
    const updatedStatuses = { ...currentStatuses, [wardId]: status };
    setCurrentStatuses(updatedStatuses);
    
    const newRecord: AttendanceRecord = {
      date: selectedDate,
      statuses: Object.entries(updatedStatuses).map(([wId, s]) => ({ wardId: wId, status: s })),
    };
    onUpdateAttendance(newRecord);
  };
  
  const statusCounts = Object.values(currentStatuses).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<AttendanceStatus, number>);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <div className="md:flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 md:mb-0">Track Attendance</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getTodayString()}
          className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
        />
      </div>
      
      <div className="flex justify-center space-x-6 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="text-center"><div className="text-2xl font-bold text-green-500">{statusCounts.present || 0}</div><div className="text-xs text-slate-500">Present</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-red-500">{statusCounts.absent || 0}</div><div className="text-xs text-slate-500">Absent</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-yellow-500">{statusCounts.late || 0}</div><div className="text-xs text-slate-500">Late</div></div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {wards.map(ward => (
          <div key={ward.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <span className="font-medium text-slate-700 dark:text-slate-200">{ward.name}</span>
            <div className="flex space-x-1 bg-slate-200 dark:bg-slate-600 p-1 rounded-lg">
              {(['present', 'absent', 'late'] as AttendanceStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(ward.id, status)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                    currentStatuses[ward.id] === status
                      ? status === 'present' ? 'bg-green-500 text-white' : status === 'absent' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceTracker;
