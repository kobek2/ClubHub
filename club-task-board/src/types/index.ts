// Type definitions for the ClubHub application

export type UserRole = 'PRESIDENT' | 'BOARD' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assigneeId: string;
  dueDate?: string;
  eventId?: string;
  meetingId?: string;
  createdAt?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  createdAt?: string;
}

export type MeetingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface AgendaSubItem {
  id: number | string;
  title: string;
}

export interface AgendaItem {
  id: number | string;
  title: string;
  subItems: AgendaSubItem[];
}

export interface Meeting {
  id?: string;
  title: string;
  date: string;
  goal?: string;
  agendaItems?: AgendaItem[];
  status?: MeetingStatus;
  notes?: string;
  createdAt?: string;
}

export type ViewType = 'TASK_BOARD' | 'CALENDAR' | 'AGENDA' | 'EVENTS_AND_TASKS';
