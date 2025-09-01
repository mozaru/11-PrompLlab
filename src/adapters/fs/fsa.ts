import { caps } from '../../lib/capabilities';
import { decodeBufferToText } from '../../lib/encoding';

export type FsaDirHandle = any; // evitar tipos experimentais

export const fsa = {
  supported(): boolean {
    return !!(caps.hasFsa && 'showDirectoryPicker' in window);
  },

  async pickInputDir(): Promise<FsaDirHandle> {
    const handle = await (window as any).showDirectoryPicker({ mode: 'read' });
    return handle;
  },

  async pickOutputDir(): Promise<FsaDirHandle> {
    const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
    return handle;
  },

  /** Lista apenas arquivos (sem recursão) */
  async listFiles(dir: FsaDirHandle): Promise<{ name: string; file: File }[]> {
    const files: { name: string; file: File }[] = [];
    // @ts-ignore
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind === 'file') {
        const f = await handle.getFile();
        files.push({ name, file: f });
      }
    }
    return files;
  },

  async readFileAsText(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    return decodeBufferToText(buf);
  },

  async writeText(outDir: FsaDirHandle, name: string, content: string, overwrite: boolean): Promise<void> {
    // se não pode sobrescrever, cheque existência
    if (!overwrite) {
      try {
        // @ts-ignore
        const existing = await outDir.getFileHandle(name);
        if (existing) throw new Error(`Arquivo já existe: ${name}`);
      } catch {
        // ok: não existe
      }
    }
    // @ts-ignore
    const handle = await outDir.getFileHandle(name, { create: true });
    const stream = await handle.createWritable();
    await stream.write(content);
    await stream.close();
  },
};
