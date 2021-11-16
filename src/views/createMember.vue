<template>
  <div class="member-creation">
    <div class="member-creation-image" style="background-image: url('https://placeimg.com/1800/850/nature')">
      <b-container>
        <div class="member-creation-image__inner">
          <div class="member-creation-form">
            <h2 class="text-center">Member creation</h2>
            <div class="member-creation-form__inner member-creation-form__inner--wide">
              <form name="form" @submit.prevent="submit">
                <b-row>
                  <label
                    :class="{ 'has-error': submitted && errors.has('name') }"
                    for="name"
                    class="input-label input-label--member-creation"
                  >
                    <span>Full Name</span>
                    <input
                      v-validate="'required|min:3|max:64|alpha_spaces|maxFourWords|uppercaseWords'"
                      v-model="member.name"
                      type="text"
                      name="name"
                      id="name"
                      class="input input--spaced"
                    />
                    <span
                      v-if="submitted && errors.has('name')"
                      :class="{ 'error-message': submitted && errors.has('name') }"
                    >
                      {{ errors.first('name') }}
                    </span>
                  </label>

                  <label
                    for="email"
                    class="input-label input-label--member-creation"
                    :class="{ 'has-error': submitted && errors.has('email') }"
                  >
                    <span>Email</span>
                    <input
                      v-validate="{
                        required: true,
                        email: true,
                        emailFormat: [member.name],
                      }"
                      v-model="member.email"
                      type="email"
                      name="email"
                      id="email"
                      class="input input--spaced"
                    />
                    <span
                      v-if="submitted && errors.has('email')"
                      :class="{ 'error-message': submitted && errors.has('email') }"
                    >
                      {{ errors.first('email') }}
                    </span>
                  </label>
                  <label
                    v-if="members"
                    class="input-label input-label--member-creation"
                    :class="{ 'has-error': submitted && errors.has('coachSelect') }"
                  >
                    <span>Select Coach</span>
                    <select
                      :disabled="!members.length"
                      v-model="member.coachSelect"
                      v-validate="'required'"
                      name="coachSelect"
                      id="coachSelect"
                      class="input input-select input--spaced"
                    >
                      <option v-for="member in members" :value="member.id" :key="member.id">
                        {{ member.fullName }}
                      </option>
                    </select>
                    <span
                      v-if="submitted && errors.has('coachSelect')"
                      :class="{ 'error-message': submitted && errors.has('coachSelect') }"
                    >
                      {{ errors.first('coachSelect') }}
                    </span>
                  </label>
                </b-row>
              </form>
              <div v-if="message" class="alert alert-danger">
                {{ message }}
              </div>
            </div>
            <div class="member-creation-form__bottom">
              <button class="button button--large" @click="submit">Create</button>
            </div>
            <div class="tree-route text-center">
              <RouterLink :to="{ name: 'CoachTree' }"> Go to Tree </RouterLink>
            </div>
          </div>
        </div>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MembersService from '@/services/members.service'
import { IFormMember, IMembersResponseData } from '@/interfaces/MembersInterface'
import config from '@/config.js'
import { Validator } from 'vee-validate'

const MEMBERS_LIMIT = config.membersLimit

Validator.extend('maxFourWords', {
  getMessage: (field) => 'The ' + field + ' value must contain no more than 4 words',
  validate: (value) => {
    const maxFourWords = new RegExp('^(?:\\b\\w+\\b[\\s\\r\\n]*){1,4}$')
    return maxFourWords.test(value)
  },
})
Validator.extend('uppercaseWords', {
  getMessage: (field) => 'The ' + field + ' value must contain all words starting uppercase',
  validate: (value) => {
    const firstLettersUppercase = new RegExp('^(\\b[A-Z]\\w*\\s*)+$')
    return firstLettersUppercase.test(value)
  },
})

Validator.extend('emailFormat', {
  getMessage: (field) => 'The ' + field + ' must contain format: name.surname@example.com',
  validate: (value, name) => {
    const username = String(name).toLowerCase().replace(/\s/g, '.').replace(/\.$/, '')
    return value === `${username}@example.com`
  },
})

@Component
export default class CreateMember extends Vue {
  private submitted: boolean = false
  private message: string = ''
  private members: IMembersResponseData[] = []
  private member: IFormMember = {
    name: '',
    email: '',
    coachSelect: '',
  }
  mounted(): void {
    this.fetchMembers()
  }

  private async fetchMembers(): Promise<void> {
    try {
      this.members = await MembersService.fetchAll()
    } catch (error) {
      this.message = `${error}: Cannot fetch members`
    }
  }

  private async submit() {
    this.message = ''

    if (this.canProceed()) {
      this.submitted = true
      this.$validator.validate().then(async (isValid) => {
        if (isValid) {
          try {
            await MembersService.createOne({
              parentId: Number(this.member.coachSelect),
              fullName: this.member.name,
              email: this.member.email,
            })
            await this.$router.push({ name: 'CoachTree' })
          } catch (error) {
            this.message = error
          }
        }
      })
    }
  }

  private nameExists(inputName: string) {
    return !!this.members.find((member: IMembersResponseData) => member.fullName === inputName.replace(/\s+$/, ''))
  }

  private canProceed(): boolean {
    if (this.members.length > MEMBERS_LIMIT) {
      this.message = `Maximum number of members (${MEMBERS_LIMIT}) has been reached.`
      return false
    }

    if (this.nameExists(this.member.name)) {
      this.message = `Name "${this.member.name}" already exists!`
      return false
    }
    return true
  }
}
</script>
