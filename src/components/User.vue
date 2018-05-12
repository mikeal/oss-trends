<template>
  <div class="user">
    {{user}}
    <RepoContributions v-bind:user="user"></RepoContributions>
  </div>
</template>

<script>
import RepoContributions from './user/RepoContributions'

export default {
  data: config => ({ user: config.$route.params.user }),
  components: { RepoContributions }
}
</script>

<style scoped>
RepoContributions div {
  width: 200px;
}
</style>
