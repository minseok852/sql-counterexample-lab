import{createContext,useEffect,useState}from'react';import type{ViewMode}from'./data-view';
export const ViewContext=createContext<ViewMode>('table');
export function useViewPreference(){const[view,setView]=useState<ViewMode>(()=>{try{return localStorage.getItem('sql-lab-data-view')==='text'?'text':'table'}catch{return'table'}});useEffect(()=>{try{localStorage.setItem('sql-lab-data-view',view)}catch{}},[view]);return[view,setView]as const;}
