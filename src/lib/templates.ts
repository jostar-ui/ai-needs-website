import type { HandoverInput, HandoverTemplate } from './types';

const KEY = 'moduui-templates';

function load(): HandoverTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(templates: HandoverTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(templates));
}

export const templateStore = {
  list(): HandoverTemplate[] {
    return load();
  },

  create(name: string, data: Partial<HandoverInput>): HandoverTemplate {
    const tpl: HandoverTemplate = {
      id: crypto.randomUUID(),
      name,
      data,
      createdAt: new Date().toISOString(),
    };
    save([...load(), tpl]);
    return tpl;
  },

  remove(id: string) {
    save(load().filter((t) => t.id !== id));
  },
};
