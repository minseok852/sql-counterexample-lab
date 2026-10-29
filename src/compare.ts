export type Cell=string|number|null;
export type Result={columns:string[],rows:Cell[][]};
export function diff(actual:Result,expected:Result){
 const counts=(rows:Cell[][])=>{const m=new Map<string,number>();for(const row of rows){const k=JSON.stringify(row);m.set(k,(m.get(k)||0)+1)}return m};
 const a=counts(actual.rows),e=counts(expected.rows);
 const missing:Cell[][]=[],extra:Cell[][]=[];
 for(const [k,n] of e)for(let i=0;i<n-(a.get(k)||0);i++)missing.push(JSON.parse(k));
 for(const [k,n] of a)for(let i=0;i<n-(e.get(k)||0);i++)extra.push(JSON.parse(k));
 return {equal:actual.columns.length===expected.columns.length&&!missing.length&&!extra.length,missing,extra,columnMismatch:actual.columns.length!==expected.columns.length};
}
