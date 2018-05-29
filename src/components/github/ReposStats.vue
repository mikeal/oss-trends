<template>
  <div class='datatable'>
    <div class="data-row data-header">
      <div class="data-section">
        Info
      </div>
      <div class="data-section">
        Stats
      </div>
      <div class="data-section">
        30 Days
      </div>
      <div class="data-section">
        60 Days
      </div>
    </div>
    <div class="data-row data-header">
      <div class="data-section data-info c1">
        <div class="data-item c1"
              v-on:click="resort('name')">Repo</div>
        <div class="data-item c2"
              v-on:click="resort('issueCount')">Issues</div>
        <div class="data-item c3"
              v-on:click="resort('prCount')">PRs</div>
        <div class="data-item c4"
              v-on:click="resort('forkCount')">Forks</div>
      </div>

      <div class="data-section data-stats c2">
        <div class="data-item c1" title="Average Issue Participants"
              v-on:click="resort('issueParticipants')">AIP</div>
        <div class="data-item c2" title="Average Issue Participants"
              v-on:click="resort('prParticipants')">APP</div>
      </div>

      <div class="data-section data-timeline c3">
        <div class="data-item c1"
              v-on:click="resort('issuesThirtyDays')">Issues</div>
        <div class="data-item c2"
              v-on:click="resort('prThirtyDays')">PRs</div>
        <div class="data-item c3"
              v-on:click="resort('forksThirtyDays')">Forks</div>
      </div>
      <div class="data-section data-timeline c4">
        <div class="data-item c1"
              v-on:click="resort('issuesNinetyDays')">Issues</div>
        <div class="data-item c2"
              v-on:click="resort('prNinetyDays')">PRs</div>
        <div class="data-item c3"
              v-on:click="resort('forksNinetyDays')">Forks</div>
      </div>
    </div>
    <div v-for="item in repos" v-bind:key="item.nameWithOwner" class="data-row">
      <div class="data-section data-info c1">
        <div class="data-item c1">{{ item.name }}</div>
        <div class="data-item c2">{{ item.issueCount }}</div>
        <div class="data-item c3">{{ item.prCount }}</div>
        <div class="data-item c4">{{ item.forkCount }}</div>
      </div>

      <div class="data-section data-stats c2">
        <div class="data-item c1">{{ item.issueParticipants }}</div>
        <div class="data-item c2">{{ item.prParticipants }}</div>
      </div>

      <div class="data-section data-timeline c3">
        <div class="data-item c1">
          {{ maxRound(item.issuesThirtyDays) }}
        </div>
        <div class="data-item c2">
          {{ maxRound(item.prThirtyDays) }}
        </div>
        <div class="data-item c3">
          {{ maxRound(item.forksThirtyDays) }}
        </div>
      </div>
      <div class="data-section data-timeline c4">
        <div class="data-item c1">
          {{ maxRound(item.issuesNinetyDays) }}
        </div>
        <div class="data-item c2">
          {{ maxRound(item.prNinetyDays) }}
        </div>
        <div class="data-item c3">
          {{ maxRound(item.forksNinetyDays) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['repos'],
  methods: {
    maxRound: int => {
      if (int === 100) return '100+'
      return int
    },
    resort: function (key) {
      this.repos.sort((x, y) => {
        x = x[key]
        y = y[key]
        if (x > y) return -1
        if (x < y) return 1
        return 0
      })
    }
  }
}
</script>

<style scoped>
div.info {
  width: 100%;
}
div.datatable {
  width: 100%;
  font-size: 12px;
}
div.data-row {
  width: 100%;
  display: grid;
  /* justify-items: center; */
  grid-template-columns: 45% 10% 13% 13%;
  column-gap: 5%;
}
div.data-header {
  background-color: #D3D3D3;
  font-weight: bold;
}
div.data-section {
  display: grid;
  width: 100%;
}
div.data-info {
  grid-template-columns: 60% 12% 12% 12%;
}
div.data-stats {
  grid-template-columns: 50%;
}
div.data-timeline {
  grid-template-columns: 33% 33% 33%;
}
div.data-section * {
  margin: 2px;
}
.c1 {
 grid-column: 1
}
.c2 {
 grid-column: 2
}
.c3 {
 grid-column: 3
}
.c4 {
 grid-column: 4
}
div.data-header div.data-item {
  cursor: pointer;
  color: blue;
}
</style>
