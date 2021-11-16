import { IMembersResponseData } from '@/interfaces/MembersInterface'

export default function sortedData(data: IMembersResponseData[]): IMembersResponseData[] {
  return data.sort((elem1, elem2) => elem1.id - elem2.id)
}
