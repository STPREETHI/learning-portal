import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, AttendanceRecord, AttendanceStatus } from '../../types';

@Component({
  selector: 'app-attendance-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-tracker.component.html',
})
export class AttendanceTrackerComponent implements OnInit, OnChanges {
  @Input() wards: User[] = [];
  @Input() attendanceRecords: AttendanceRecord[] = [];
  @Output() updateAttendance = new EventEmitter<AttendanceRecord>();

  selectedDate: string = '';
  currentStatuses: { [wardId: string]: AttendanceStatus } = {};
  statusOptions: AttendanceStatus[] = ['present', 'absent', 'late'];

  ngOnInit(): void {
    this.selectedDate = this.getTodayString();
    this.updateCurrentStatuses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wards'] || changes['attendanceRecords'] || changes['selectedDate']) {
      this.updateCurrentStatuses();
    }
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  updateCurrentStatuses(): void {
    const recordForDate = this.attendanceRecords.find(r => r.date === this.selectedDate);
    const initialStatuses: { [wardId: string]: AttendanceStatus } = {};
    this.wards.forEach(ward => {
      const existingStatus = recordForDate?.statuses.find(s => s.wardId === ward.id)?.status;
      initialStatuses[ward.id] = existingStatus || 'present';
    });
    this.currentStatuses = initialStatuses;
  }
  
  onDateChange(): void {
    this.updateCurrentStatuses();
  }

  handleStatusChange(wardId: string, status: AttendanceStatus): void {
    const updatedStatuses = { ...this.currentStatuses, [wardId]: status };
    this.currentStatuses = updatedStatuses;
    
    const newRecord: AttendanceRecord = {
      date: this.selectedDate,
      statuses: Object.entries(updatedStatuses).map(([wId, s]) => ({ wardId: wId, status: s })),
    };
    this.updateAttendance.emit(newRecord);
  }

  get statusCounts(): Record<AttendanceStatus, number> {
    return Object.values(this.currentStatuses).reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<AttendanceStatus, number>);
  }
}
