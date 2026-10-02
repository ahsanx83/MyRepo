export function getFileIcon(file) {
  if (file.mimeType === 'application/vnd.google-apps.folder') return { emoji: '📁', className: 'icon-folder' };
  const name = (file.name || '').toLowerCase();
  const ext = name.split('.').pop();
  const map = {
    js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️', py: '🐍', java: '☕',
    c: '📘', cpp: '📘', cs: '📘', html: '🌐', css: '🎨', scss: '🎨',
    json: '📦', md: '📝', txt: '📄', yml: '⚙️', yaml: '⚙️', sh: '⚡',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', svg: '🖼️',
    pdf: '📕', zip: '🗜️',
  };
  return { emoji: map[ext] || '📄' };
}

export function isTextFile(file) {
  const name = (file.name || '').toLowerCase();
  const ext = name.split('.').pop();
  const textExts = ['txt','md','js','jsx','ts','tsx','json','html','css','scss','py','java','c','cpp','h','hpp','cs','go','rs','rb','php','yml','yaml','xml','sh','bash','sql','csv','log','env','gitignore'];
  return textExts.includes(ext) || (file.mimeType && file.mimeType.startsWith('text/'));
}

export function isImageFile(file) {
  return file.mimeType && file.mimeType.startsWith('image/');
}
