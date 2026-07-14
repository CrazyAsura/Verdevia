export interface CepResult{zipCode:string;street:string;district:string;city:string;state:string} export interface DddResult{ddd:string;state:string;cities:string[]}
async function read<T>(url:string):Promise<T>{const r=await fetch(url);const d=await r.json();if(!r.ok)throw new Error(d.message||'Consulta indisponível');return d as T;}
export interface CountryCode{code:string;country:string;iso:string}
export default{getCep:(cep:string)=>read<CepResult>(`/api/location/cep/${cep.replace(/\D/g,'')}`),getDdd:(ddd:string)=>read<DddResult>(`/api/location/ddd/${ddd.replace(/\D/g,'')}`),getCountries:()=>read<CountryCode[]>('/api/location/countries')};
