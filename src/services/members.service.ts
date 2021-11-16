import axios from 'axios'
import config from '@/config.js'
import sortedData from '@/helpers/data-sort.helper'
import { ICreateMember, IMembersResponseData, IUpdateMember } from '@/interfaces/MembersInterface'

const API_URL = config.baseUrl

export default class MembersService {
  static async fetchAll(): Promise<IMembersResponseData[]> {
    const data = await axios.get(API_URL + 'members').then((response) => response.data)
    return sortedData(data)
  }

  static async createOne(payload: ICreateMember): Promise<void> {
    await axios.post(API_URL + 'members', payload)
  }

  static async deleteOne(id: number): Promise<void> {
    await axios.delete(API_URL + 'members/' + id)
  }

  static async updateOne(id: number, payload: IUpdateMember): Promise<void> {
    await axios.patch(API_URL + 'members/' + id, payload)
  }
}
