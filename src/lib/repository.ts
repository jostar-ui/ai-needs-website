import { supabase } from './supabase';
import type {
  Handover,
  HandoverInput,
  HandoverReport,
  HandoverHistory,
} from './types';

// snake_case(DB) → camelCase(TS)
function toHandover(row: Record<string, unknown>): Handover {
  return {
    id: row.id as string,
    department: row.department as string,
    taskName: row.task_name as string,
    description: row.description as string,
    priority: row.priority as '높음' | '보통' | '낮음',
    schedules: (row.schedules as Handover['schedules']) ?? [],
    checklist: (row.checklist as string[]) ?? [],
    systems: (row.systems as string[]) ?? [],
    laws: (row.laws as string) ?? '',
    cautions: (row.cautions as string) ?? '',
    knowhow: (row.knowhow as string) ?? '',
    attachments: (row.attachments as string[]) ?? [],
    relatedIds: (row.related_ids as string[]) ?? [],
    isAccepted: (row.is_accepted as boolean) ?? false,
    acceptedAt: (row.accepted_at as string | null) ?? null,
    acceptedBy: (row.accepted_by as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    updatedBy: (row.updated_by as string | null) ?? null,
    status: row.status as 'active' | 'deleted',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// camelCase(TS) → snake_case(DB)
function toRow(input: HandoverInput) {
  return {
    department: input.department,
    task_name: input.taskName,
    description: input.description,
    priority: input.priority,
    schedules: input.schedules,
    checklist: input.checklist,
    systems: input.systems,
    laws: input.laws,
    cautions: input.cautions,
    knowhow: input.knowhow,
    attachments: input.attachments,
    related_ids: input.relatedIds ?? [],
    status: input.status,
  };
}

async function saveHistory(
  handoverId: string,
  editorName: string,
  changeType: HandoverHistory['changeType'],
  beforeData: Partial<Handover> | null,
  afterData: Partial<Handover> | null,
  changedFields: string[],
) {
  await supabase.from('handover_histories').insert({
    handover_id: handoverId,
    editor_name: editorName,
    change_type: changeType,
    before_data: beforeData,
    after_data: afterData,
    changed_fields: changedFields,
  });
}

export const repository = {
  async list(): Promise<Handover[]> {
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toHandover);
  },

  async listAll(): Promise<Handover[]> {
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toHandover);
  },

  async search(query: string, department?: string): Promise<Handover[]> {
    let req = supabase
      .from('handovers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (department) req = req.eq('department', department);
    if (query.trim()) {
      req = req.or(
        `department.ilike.%${query}%,task_name.ilike.%${query}%,description.ilike.%${query}%,knowhow.ilike.%${query}%,cautions.ilike.%${query}%,laws.ilike.%${query}%`,
      );
    }
    const { data, error } = await req;
    if (error) throw error;
    return (data ?? []).map(toHandover);
  },

  async get(id: string): Promise<Handover | undefined> {
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return toHandover(data);
  },

  async create(input: HandoverInput, editorName = '익명'): Promise<Handover> {
    const { data, error } = await supabase
      .from('handovers')
      .insert({ ...toRow(input), created_by: editorName })
      .select()
      .single();
    if (error) throw error;
    const created = toHandover(data);
    await saveHistory(created.id, editorName, 'create', null, created, []);
    return created;
  },

  async update(
    id: string,
    input: HandoverInput,
    editorName = '익명',
  ): Promise<Handover> {
    const before = await this.get(id);
    const { data, error } = await supabase
      .from('handovers')
      .update({ ...toRow(input), updated_by: editorName })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const updated = toHandover(data);
    const changedFields = before
      ? (Object.keys(input) as (keyof HandoverInput)[]).filter(
          (k) => JSON.stringify(before[k]) !== JSON.stringify(input[k]),
        )
      : [];
    await saveHistory(id, editorName, 'update', before ?? null, updated, changedFields);
    return updated;
  },

  async remove(id: string, editorName = '익명'): Promise<void> {
    const before = await this.get(id);
    const { error } = await supabase
      .from('handovers')
      .update({ status: 'deleted' })
      .eq('id', id);
    if (error) throw error;
    await saveHistory(id, editorName, 'delete', before ?? null, null, ['status']);
  },

  async restore(id: string, editorName = '익명'): Promise<void> {
    const before = await this.get(id);
    const { error } = await supabase
      .from('handovers')
      .update({ status: 'active' })
      .eq('id', id);
    if (error) throw error;
    const after = await this.get(id);
    await saveHistory(id, editorName, 'restore', before ?? null, after ?? null, ['status']);
  },

  async accept(id: string, acceptedBy: string): Promise<void> {
    const { error } = await supabase
      .from('handovers')
      .update({ is_accepted: true, accepted_at: new Date().toISOString(), accepted_by: acceptedBy })
      .eq('id', id);
    if (error) throw error;
  },

  async unaccept(id: string): Promise<void> {
    const { error } = await supabase
      .from('handovers')
      .update({ is_accepted: false, accepted_at: null, accepted_by: null })
      .eq('id', id);
    if (error) throw error;
  },

  async updateAuthor(id: string, authorName: string): Promise<void> {
    const { error } = await supabase
      .from('handovers')
      .update({ created_by: authorName })
      .eq('id', id);
    if (error) throw error;
  },

  async getByIds(ids: string[]): Promise<Handover[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('handovers')
      .select('*')
      .in('id', ids);
    if (error) return [];
    return (data ?? []).map(toHandover);
  },
};

export const reportRepository = {
  async create(
    report: Omit<HandoverReport, 'id' | 'createdAt' | 'status'>,
  ): Promise<void> {
    const { error } = await supabase.from('handover_reports').insert({
      handover_id: report.handoverId,
      reporter_name: report.reporterName,
      reason: report.reason,
      detail: report.detail,
    });
    if (error) throw error;
  },

  async listAll(): Promise<HandoverReport[]> {
    const { data, error } = await supabase
      .from('handover_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      handoverId: row.handover_id,
      reporterName: row.reporter_name,
      reason: row.reason,
      detail: row.detail,
      status: row.status,
      createdAt: row.created_at,
    }));
  },

  async updateStatus(
    id: string,
    status: HandoverReport['status'],
  ): Promise<void> {
    const { error } = await supabase
      .from('handover_reports')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },
};

export const historyRepository = {
  async listByHandover(handoverId: string): Promise<HandoverHistory[]> {
    const { data, error } = await supabase
      .from('handover_histories')
      .select('*')
      .eq('handover_id', handoverId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      handoverId: row.handover_id,
      editorName: row.editor_name,
      changeType: row.change_type,
      beforeData: row.before_data,
      afterData: row.after_data,
      changedFields: row.changed_fields ?? [],
      createdAt: row.created_at,
    }));
  },
};
