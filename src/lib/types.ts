export const CYCLES = ['상시', '연간', '반기', '분기', '월간', '수시'] as const;
export type Cycle = (typeof CYCLES)[number];

export interface ScheduleItem {
  cycle: Cycle;
  description: string;
}

export interface Handover {
  id: string;
  department: string;
  taskName: string;
  description: string;
  priority: '높음' | '보통' | '낮음';
  schedules: ScheduleItem[];
  checklist: string[];
  systems: string[];
  laws: string;
  cautions: string;
  knowhow: string;
  attachments: string[];
  relatedIds: string[];
  isAccepted: boolean;
  acceptedAt: string | null;
  acceptedBy: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  status: 'active' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export type HandoverInput = Omit<Handover, 'id' | 'createdAt' | 'updatedAt' | 'isAccepted' | 'acceptedAt' | 'acceptedBy' | 'createdBy' | 'updatedBy'>;

export interface HandoverTemplate {
  id: string;
  name: string;
  data: Partial<HandoverInput>;
  createdAt: string;
}

export interface HandoverReport {
  id: string;
  handoverId: string;
  reporterName: string;
  reason: '오류정보' | '중복업무' | '오래된정보' | '부적절한내용' | '기타';
  detail: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface HandoverHistory {
  id: string;
  handoverId: string;
  editorName: string;
  changeType: 'create' | 'update' | 'delete' | 'restore';
  beforeData: Partial<Handover> | null;
  afterData: Partial<Handover> | null;
  changedFields: string[];
  createdAt: string;
}

export const PRIORITY_LABELS = ['높음', '보통', '낮음'] as const;
export type Priority = Handover['priority'];

export const REPORT_REASONS = [
  '오류정보',
  '중복업무',
  '오래된정보',
  '부적절한내용',
  '기타',
] as const;
export type ReportReason = HandoverReport['reason'];

export const SYSTEM_PRESETS = [
  '행복e음', '복지로', '정부24', 'e호조', '새올', '온나라', 'NDMS', '위택스',
] as const;
