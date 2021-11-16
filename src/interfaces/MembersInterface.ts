import { BaseNode } from '@he-tree/vue2/types/types'

export interface ICreateMember {
  id?: number
  parentId: number
  fullName: string
  email: string
}

export interface IUpdateMember {
  parentId?: number
  fullName?: string
  email?: string
}

export interface IMembersResponseData {
  id: number
  parentId: number
  fullName: string
  email: string
}

export type IBaseNode = BaseNode & IMembersResponseData

export interface IFormMember {
  name: string
  email: string
  coachSelect: string
}
