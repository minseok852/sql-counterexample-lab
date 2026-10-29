import type {ButtonHTMLAttributes,ReactNode} from 'react';
import type {Result} from './compare';
import{cellLabel}from'./data-view';
import{resultText}from'./data-view';import{useContext}from'react';import{ViewContext}from'./view-mode';

export function Button({className='',type='button',...props}:ButtonHTMLAttributes<HTMLButtonElement>){
 return <button type={type} className={className} {...props}/>;
}
export function ProblemButton({selected,index,title,onClick}:{selected:boolean,index:number,title:string,onClick:()=>void}){
 return <Button className={selected?'selected problem':'problem'} aria-pressed={selected} onClick={onClick}><small>0{index+1}</small>{title}</Button>;
}
export function Status({tone='info',children}:{tone?:'info'|'success'|'warning'|'error',children:ReactNode}){
 return <div className={`status status-${tone}`} role="status">{children}</div>;
}
export function Table({value}:{value:Result}){
 const view=useContext(ViewContext);if(view==='text')return <pre className="data-text" tabIndex={0}>{resultText(value)}</pre>;
 return <div className="table-wrap"><table><thead><tr>{value.columns.map((column,index)=><th scope="col" key={index}>{column}</th>)}</tr></thead><tbody>{value.rows.map((row,index)=><tr key={index}>{row.map((cell,column)=>{const label=cellLabel(cell);return <td key={column} data-kind={label.kind}>{label.text}</td>})}</tr>)}</tbody></table>{!value.rows.length&&<p>빈 결과 (0행)</p>}</div>;
}
export function HintPanel({hints,stage,onNext,answer,explanation}:{hints:string[],stage:number,onNext:()=>void,answer:string,explanation:string}){
 return <section className="card hint-panel"><h2>한 단계씩 이해하기</h2><Button disabled={stage>=hints.length} onClick={onNext}>힌트 보기 ({stage}/{hints.length})</Button>{hints.slice(0,stage).map(hint=><p key={hint}>↳ {hint}</p>)}<details><summary>정답 SQL 보기</summary><pre>{answer}</pre><p>{explanation}</p></details></section>;
}
