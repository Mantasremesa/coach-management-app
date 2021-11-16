<template>
  <div>
    <b-container>
      <b-row>
        <b-col cols="12">
          <div class="tree-route pt-md-4">
            <RouterLink :to="{ name: 'CreateMemberForm' }">&#x25E3; Go to Member Creation </RouterLink>
          </div>
          <h2 class="heading-decorated heading-decorated--left pt-md-3">Coach association members</h2>
        </b-col>
      </b-row>
      <div class="members-tree pb-md-3">
        <b-row>
          <BaseTree v-if="members.length" :flatData="members" idKey="id" parentIdKey="parentId" :indent="100" :gap="3">
            <template v-slot="{ node, tree }">
              <div class="members-item vertical-center">
                <span><span class="member-icon"></span>{{ node.fullName }}</span>
                <span>{{ node.email }}</span>
                <span v-if="node.parentId">{{ getParentName(node) }}</span>
              </div>
              <template v-if="hasMoreThanOneChild(node)">
                <button
                  class="button-down vertical-center"
                  v-if="needsMoveDown(node)"
                  @click="moveChild(node, tree, true)"
                ></button>
                <button
                  class="button-up vertical-center"
                  v-if="needsMoveUp(node)"
                  @click="moveChild(node, tree)"
                ></button>
              </template>
              <button class="button-delete vertical-center" @click="deleteMember(node)"></button>
            </template>
          </BaseTree>
        </b-row>
      </div>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@he-tree/vue3/dist/he-tree-vue3.css'
import { BaseTree } from '@he-tree/vue2'
import MembersService from '@/services/members.service'
import { IBaseNode, IMembersResponseData } from '@/interfaces/MembersInterface'
import { BaseNode, Node } from '@he-tree/vue2/types/types'

@Component({
  components: { BaseTree },
})
export default class CoachTree extends Vue {
  private members: IMembersResponseData[] = []

  mounted(): void {
    this.fetchMembers()
  }

  private async fetchMembers(): Promise<void> {
    this.members = await MembersService.fetchAll()
  }

  private getParentName(currentMember: BaseNode): string {
    const member = this.members.find((memberItem: IMembersResponseData) => memberItem.id === currentMember.$pid)
    return member ? member.fullName : 'Unknown Name'
  }

  private levelUpChilds(children: Node[], parentId: number) {
    children.forEach(async (child: Node) => {
      if (child.hasOwnProperty('$children')) {
        await MembersService.updateOne(Number(child.$id), {
          parentId,
        })
      }
    })
  }

  private async deleteMember(currentMember: BaseNode): Promise<void> {
    this.levelUpChilds(currentMember.$children, Number(currentMember.$pid))
    await MembersService.deleteOne(Number(currentMember.$id))
    await this.fetchMembers()
  }

  private needsMoveUp(currentMember: BaseNode): boolean {
    const firstSameLevelChild = this.members.filter((member) => member.parentId === currentMember.$pid)[0]
    return currentMember.$id !== firstSameLevelChild.id
  }

  private needsMoveDown(currentMember: BaseNode): boolean {
    const allSameLevelChildren = this.members.filter((member) => member.parentId === currentMember.$pid)
    return currentMember.$id !== allSameLevelChildren[allSameLevelChildren.length - 1].id
  }

  private hasMoreThanOneChild(currentMember: BaseNode): boolean {
    return this.members.filter((member) => member.parentId === currentMember.$pid).length > 1
  }

  private async moveChild(currentMember: IBaseNode, tree: BaseTree, moveDown: boolean = false): Promise<void> {
    const parent = tree.nodes.find((member: Node) => member.id === currentMember.$pid)
    if (!parent) return

    const indexOfMember = parent.$children.findIndex((child: Node) => child.id === currentMember.$id)
    const childNearby = moveDown ? parent.$children[indexOfMember + 1] : parent.$children[indexOfMember - 1]

    await MembersService.deleteOne(Number(currentMember.$id))
    await MembersService.deleteOne(Number(childNearby.id))

    await MembersService.createOne({
      id: Number(childNearby.id),
      parentId: Number(currentMember.$pid),
      fullName: currentMember.fullName,
      email: currentMember.email,
    })

    await MembersService.createOne({
      id: Number(currentMember.$id),
      parentId: Number(childNearby.parentId),
      fullName: String(childNearby.fullName),
      email: String(childNearby.email),
    })

    if (childNearby.$children.length) {
      for (const child of childNearby.$children) {
        if (child.hasOwnProperty('$children')) {
          await MembersService.updateOne(Number(child.id), {
            parentId: Number(currentMember.$id),
          })
        }
      }
    }

    if (currentMember.$children.length) {
      for (const child of currentMember.$children) {
        if (child.hasOwnProperty('$children')) {
          await MembersService.updateOne(Number(child.id), {
            parentId: Number(childNearby.$id),
          })
        }
      }
    }
    await this.fetchMembers()
  }
}
</script>
