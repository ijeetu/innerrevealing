import { ApiError } from '../errors';

export type MediaFormat = { mime: string; extension: string; kind: 'image'|'video'|'audio'|'document' };

export function detectMedia(data: Buffer, declaredType = ''): MediaFormat {
  if (!data.length) throw new ApiError(422,'The file is empty or not a supported media file.');
  if (data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return {mime:'image/png',extension:'png',kind:'image'};
  if (data[0]===255&&data[1]===216&&data[2]===255) return {mime:'image/jpeg',extension:'jpg',kind:'image'};
  const first=data.subarray(0,16).toString('latin1');
  if(first.startsWith('GIF87a')||first.startsWith('GIF89a'))return {mime:'image/gif',extension:'gif',kind:'image'};
  if(first.startsWith('RIFF')&&first.slice(8,12)==='WEBP')return {mime:'image/webp',extension:'webp',kind:'image'};
  if(first.startsWith('%PDF-'))return {mime:'application/pdf',extension:'pdf',kind:'document'};
  if(first.startsWith('RIFF')&&first.slice(8,12)==='WAVE')return {mime:'audio/wav',extension:'wav',kind:'audio'};
  if(first.slice(4,8)==='ftyp')return declaredType.startsWith('audio/')||first.slice(8,12)==='M4A ' ? {mime:'audio/mp4',extension:'m4a',kind:'audio'} : {mime:'video/mp4',extension:'mp4',kind:'video'};
  if(data.subarray(0,4).equals(Buffer.from([26,69,223,163])))return declaredType.startsWith('audio/')?{mime:'audio/webm',extension:'webm',kind:'audio'}:{mime:'video/webm',extension:'webm',kind:'video'};
  if(first.startsWith('OggS'))return {mime:'audio/ogg',extension:'ogg',kind:'audio'};
  if(first.startsWith('ID3')||(data[0]===255&&(data[1]&224)===224))return {mime:'audio/mpeg',extension:'mp3',kind:'audio'};
  if(data.subarray(0,8).equals(Buffer.from([208,207,17,224,161,177,26,225]))&&declaredType==='application/msword')return {mime:'application/msword',extension:'doc',kind:'document'};
  if(data.subarray(0,4).equals(Buffer.from([80,75,3,4]))&&data.subarray(Math.max(0,data.length-65557)).includes(Buffer.from([80,75,5,6]))) {
    if(declaredType==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'&&data.includes(Buffer.from('word/document.xml'))&&data.includes(Buffer.from('[Content_Types].xml'))&&!data.includes(Buffer.from('vbaProject.bin')))return {mime:declaredType,extension:'docx',kind:'document'};
    if(declaredType==='application/zip'||declaredType==='application/x-zip-compressed')return {mime:'application/zip',extension:'zip',kind:'document'};
  }
  if(first.startsWith('Rar!\x1a\x07'))return {mime:'application/vnd.rar',extension:'rar',kind:'document'};
  if(declaredType==='text/plain') {
    try {const text=new TextDecoder('utf-8',{fatal:true}).decode(data);if(!text.includes('\0')&&!/^\s*(?:<!doctype\s+html|<html\b|<svg\b)/i.test(text))return {mime:'text/plain',extension:'txt',kind:'document'};}catch{}
  }
  throw new ApiError(422,'Upload a PNG, JPEG, WebP, GIF, PDF, MP4, WebM, MP3, M4A, Ogg or WAV file. HTML, SVG and executable files are not accepted.');
}

export function parseByteRange(header: string|null,size: number): {start:number;end:number}|null {
  if(!header)return null;
  const match=/^bytes=(\d*)-(\d*)$/.exec(header);
  if(!match||(!match[1]&&!match[2]))throw new ApiError(416,'Invalid media range.');
  let start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  let end=match[2]&&match[1]?Number(match[2]):size-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)throw new ApiError(416,'Invalid media range.');
  end=Math.min(end,size-1);
  return {start,end};
}
