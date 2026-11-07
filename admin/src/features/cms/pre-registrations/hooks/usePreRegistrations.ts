import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import { fetchPreRegistrationList, fetchPreRegistrationById, updatePreRegistrationStatus } from "../api";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "../types";
export const preRegistrationKeys = { all: ["pre-registrations"] as const, list: (status?: CmsPreRegistrationStatus) => [...preRegistrationKeys.all,"list",status??"all"] as const, detail: (id:string)=>[...preRegistrationKeys.all,"detail",id] as const };
export function usePreRegistrationList(status?: CmsPreRegistrationStatus) { return useQuery<CmsPreRegistration[],ApiError>({ queryKey: preRegistrationKeys.list(status), queryFn:()=>fetchPreRegistrationList(status) }); }
export function usePreRegistration(id:string|null) { return useQuery<CmsPreRegistration,ApiError>({ queryKey:id?preRegistrationKeys.detail(id):["pre-registrations","detail","null"], queryFn:()=>id?fetchPreRegistrationById(id):Promise.reject(new Error("no id")), enabled:!!id }); }
export function usePreRegistrationMutations() { const qc=useQueryClient(); const statusMut=useMutation({mutationFn:({id,status}:{id:string;status:CmsPreRegistrationStatus})=>updatePreRegistrationStatus(id,status), onSuccess:()=>qc.invalidateQueries({queryKey:preRegistrationKeys.all})}); return { statusMut }; }
