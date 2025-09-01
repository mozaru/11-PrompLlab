import { zipSync, strToU8 } from 'fflate';

export function buildZipFromTextMap(files: Record<string, string>): Uint8Array {
  const input: Record<string, Uint8Array> = {};
  for (const [name, content] of Object.entries(files)) {
    input[name] = strToU8(content);
  }
  return zipSync(input, { level: 6 }); // nível médio
}

export function downloadZip(bytes: Uint8Array, fileName = 'batch_results.zip') {
  const blob = new Blob([bytes], { type: 'application/zip' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}
