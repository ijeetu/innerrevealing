import { ApiError } from '../errors';
import { readJson } from '../request';

// Decode the bracketed FormData names used by the original eLMS forms.
export function parseLegacyFields(entries: Iterable<[string,unknown]>): Record<string,unknown> {
  const result:Record<string,unknown>=Object.create(null);
  let count=0;
  for(const [key,value] of entries) {
    if(++count>3000||key.length>300)throw new ApiError(413,'Too many form fields.');
    const parts=key.replace(/\]/g,'').split('[');
    if(parts.length>10||parts.some(part=>['__proto__','constructor','prototype'].includes(part)))throw new ApiError(422,'Invalid form field.');
    // This parser only constructs arrays and null-prototype records.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current:any=result;
    for(let index=0;index<parts.length;index++) {
      const part=parts[index];const last=index===parts.length-1;
      if(part==='') {
        if(!Array.isArray(current))throw new ApiError(422,'Invalid repeated form field.');
        if(last)current.push(value);
        else {const child=parts[index+1]===''||/^\d+$/.test(parts[index+1])?[]:Object.create(null);current.push(child);current=child;}
      } else {
        if(/^\d+$/.test(part)&&Number(part)>1000)throw new ApiError(422,'Form index is too large.');
        if(last)current[part]=value;
        else {if(current[part]===undefined)current[part]=parts[index+1]===''||/^\d+$/.test(parts[index+1])?[]:Object.create(null);if(typeof current[part]!=='object'||current[part]===null)throw new ApiError(422,'Conflicting form fields.');current=current[part];}
      }
    }
  }
  return result;
}

export async function readLegacyInput(request:Request):Promise<Record<string,unknown>> {
  const query=parseLegacyFields(new URL(request.url).searchParams.entries());
  if(request.method==='GET'||!request.body||request.headers.get('content-length')==='0')return query;
  const type=request.headers.get('content-type')||'';
  if(request.method==='DELETE'&&!type&&!request.headers.get('content-length')) {
    const reader=request.body.getReader();
    try {while(true){const chunk=await reader.read();if(chunk.done)return query;if(chunk.value.byteLength){await reader.cancel();throw new ApiError(415,'Use a supported content type for a DELETE body.');}}}
    finally {reader.releaseLock();}
  }
  if(type.includes('application/json'))return {...query,...await readJson(request,1024*1024)};
  if(type.includes('multipart/form-data')) {
    const length=Number(request.headers.get('content-length'));
    const maximum=Math.min(512,Math.max(1,Number(process.env.UPLOAD_MAX_MB)||50))*1024*1024;
    if(!length)throw new ApiError(411,'A known upload size is required.');
    if(length>maximum+1024*1024)throw new ApiError(413,'This upload is too large.');
    const form=await request.formData();
    return {...query,...parseLegacyFields(form.entries())};
  }
  if(type.includes('application/x-www-form-urlencoded')) {
    if(Number(request.headers.get('content-length')||0)>1024*1024)throw new ApiError(413,'This form is too large.');
    const text=await request.text();
    if(Buffer.byteLength(text)>1024*1024)throw new ApiError(413,'This form is too large.');
    return {...query,...parseLegacyFields(new URLSearchParams(text).entries())};
  }
  throw new ApiError(415,'Use JSON or a supported form request.');
}
