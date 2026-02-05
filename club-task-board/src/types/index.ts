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

// Event lifecycle phases for officer transition & history
export type EventStatus = 'draft' | 'planning' | 'live' | 'completed' | 'archived';

export interface EventIdeation {
  notes?: string;
  goals?: string;
  updatedAt?: string;
}

export interface BudgetLine {
  item: string;
  amount: number;
  notes?: string;
}

export interface EventBudget {
  projectedTotal?: number;
  actualTotal?: number;
  breakdown?: BudgetLine[];
  notes?: string;
  updatedAt?: string;
}

export interface EventContact {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface EventAttendance {
  projected?: number;
  actual?: number;
  notes?: string;
  updatedAt?: string;
}

export interface EventReflection {
  whatWorked?: string;
  whatDidnt?: string;
  improvements?: string;
  metrics?: string;
  completedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  createdAt?: string;
  // Officer transition & history
  semester?: string;           // e.g. "Fall 2024"
  academicYear?: string;       // e.g. "2024-2025"
  status?: EventStatus;
  ideation?: EventIdeation;
  budget?: EventBudget;
  contacts?: EventContact[];
  attendance?: EventAttendance;
  reflection?: EventReflection;
  copiedFromEventId?: string;  // If created from a past event template
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
