import { RouterLinkStub, shallowMount, Wrapper } from '@vue/test-utils'
import CreateMember from '@/views/createMember.vue'
import { createLocalVue } from '@vue/test-utils'
import { BContainer, BRow } from 'bootstrap-vue'
const flushPromises = require('flush-promises')
import VeeValidate from 'vee-validate'
import config from '@/config'

const localVue = createLocalVue()
localVue.use(VeeValidate)

let wrapper: Wrapper<any>

jest.mock('@/services/members.service', () => ({}))
jest.mock('@/config.js', () => ({ membersLimit: 2 }))

beforeEach(() => {
  wrapper = shallowMount(CreateMember, {
    stubs: {
      'b-row': BRow,
      'b-container': BContainer,
      RouterLink: RouterLinkStub,
    },
    localVue,
  })
  const membersData = [
    {
      id: 1,
      parentId: 0,
      fullName: 'Vardas Pavardenis',
      email: 'vardas.pavardenis@example.com',
    },
    {
      id: 2,
      parentId: 1,
      fullName: 'Jonas Pavardenis',
      email: 'jonas.pavardenis@example.com',
    },
  ]
  const fieldsData = {
    name: '',
    email: '',
    coachSelect: '',
  }
  wrapper.setData({
    members: membersData,
    member: fieldsData,
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('CreateMember', () => {
  test('is a Vue instance', () => {
    expect(wrapper.isVueInstance).toBeTruthy()
  })

  test('should return correct errors when form name already exists', async () => {
    const fieldsData = {
      name: 'Vardas Pavardenis',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    expect(wrapper.vm.message).toBe(`Name "${fieldsData.name}" already exists!`)
  })

  test('should return correct errors when form has empty name, email and coachSelect', async () => {
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)
    expect(wrapper.vm.errors.has('name')).toBe(true)
    expect(wrapper.vm.errors.has('email')).toBe(true)
    expect(wrapper.vm.errors.has('coachSelect')).toBe(true)
    expect(allErrors).toEqual([
      'The name field is required',
      'The email field must be a valid email',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(3)
  })

  test('should return correct errors when form has empty email and coachSelect', async () => {
    const fieldsData = {
      name: 'Mantas',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('email')).toBe(true)
    expect(wrapper.vm.errors.has('coachSelect')).toBe(true)
    expect(allErrors).toEqual(['The email field must be a valid email', 'The coachSelect field is required'])
    expect(wrapper.vm.errors.count()).toEqual(2)
  })

  test('should return correct errors when form name starts lowercase', async () => {
    const fieldsData = {
      name: 'mantas',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(true)
    expect(wrapper.vm.errors.has('email')).toBe(true)
    expect(wrapper.vm.errors.has('coachSelect')).toBe(true)
    expect(allErrors).toEqual([
      'The name value must contain all words starting uppercase',
      'The email field must be a valid email',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(3)
  })

  test('should return correct errors when form name is too long', async () => {
    const fieldsData = {
      name: 'Petras Pavardenis Pavardenispavardenispavardenispavardenis Pavardenis',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(true)
    expect(allErrors).toEqual([
      'The name field may not be greater than 64 characters',
      'The email field must be a valid email',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(3)
  })

  test('should return correct errors when form name is too short', async () => {
    const fieldsData = {
      name: 'Pe',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(true)
    expect(allErrors).toEqual([
      'The name field must be at least 3 characters',
      'The email field must be a valid email',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(3)
  })

  test('should return correct errors when form name is more than 4 words', async () => {
    const fieldsData = {
      name: 'Vardas Pavardenis Vardas Vardas Vardas',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(true)
    expect(allErrors).toEqual([
      'The name value must contain no more than 4 words',
      'The email field must be a valid email',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(3)
  })

  test('should return correct errors when form name has special characters', async () => {
    const fieldsData = {
      name: 'Vardas$',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(true)
    expect(allErrors).toEqual([
      'The name field may only contain alphabetic characters as well as spaces',
      'The email field must be a valid email',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(3)
  })

  test('should return correct errors when email does not matches naming rules', async () => {
    const fieldsData = {
      name: 'Mantas',
      email: 'Mantasa.sgasg@ggagagga.lt',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(false)
    expect(wrapper.vm.errors.has('email')).toBe(true)
    expect(wrapper.vm.errors.has('coachSelect')).toBe(true)
    expect(allErrors).toEqual([
      'The email must contain format: name.surname@example.com',
      'The coachSelect field is required',
    ])
    expect(wrapper.vm.errors.count()).toEqual(2)
  })

  test('should return no errors when email matches naming rules', async () => {
    const fieldsData = {
      name: 'Vardas Pavardenis Vardas',
      email: 'vardas.pavardenis.vardas@example.com',
    }
    await wrapper.setData({
      member: fieldsData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    const allErrors = wrapper.vm.errors.items.map((item: any) => item.msg)

    expect(wrapper.vm.errors.has('name')).toBe(false)
    expect(wrapper.vm.errors.has('email')).toBe(false)
    expect(allErrors).toEqual(['The coachSelect field is required'])
    expect(wrapper.vm.errors.count()).toEqual(1)
  })

  test('should return correct errors when members limit is reached', async () => {
    const membersData = [
      {
        id: 1,
        parentId: 0,
        fullName: 'Vardas Pavardenis',
        email: 'vardas.pavardenis@example.com',
      },
      {
        id: 2,
        parentId: 1,
        fullName: 'Jonas Pavardenis',
        email: 'jonas.pavardenis@example.com',
      },
      {
        id: 3,
        parentId: 1,
        fullName: 'Jonas Pavardenis Vardas',
        email: 'jonas.pavardenis@example.com',
      },
    ]
    await wrapper.setData({
      members: membersData,
    })
    wrapper.find('button.button--large').trigger('click')
    await flushPromises()
    expect(wrapper.vm.message).toBe(`Maximum number of members (${config.membersLimit}) has been reached.`)
  })
})
