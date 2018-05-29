<template>
  <div class="user-repo-contributions">
    <div id="charts" v-if="chart">
      <h3>Repository Primary Languages</h3>
      <div id="prim-lang-row">
      <pie-chart
        :labels="chart.labels"
        :datasets="chart.datasets"
      ></pie-chart>

    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import github from '../../github'
import pattern from 'patternomaly'
import randomcolor from 'randomcolor'

export default {
  props: ['user'],
  data () {
    let data = { chart: null }

    let repos = (q, pageInfo) => {
      if (!pageInfo) {
        return `${q} (first: 100) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            primaryLanguage {
              name
            }
          }
        }
        `
      }
      if (!pageInfo.hasNextPage) return ''
      return `${q} (first: 100, after: "${pageInfo.endCursor}") {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          primaryLanguage {
            name
          }
        }
      }
      `
    }

    let chart
    let contribPageInfo = null
    let repoPageInfo = null
    let page = () => {
      const query = `query {
        user (login: "${this.user}") {
          ${repos('repositoriesContributedTo', contribPageInfo)}
          ${repos('repositories', repoPageInfo)}
        }
      }
      `
      github.query(query).then(result => {
        if (!chart) chart = result
        else {
          let concat = (str) => {
            if (!result.user[str]) return
            chart.user[str].nodes = chart.user[str].nodes.concat(
              result.user[str].nodes
            )
          }
          concat('repositoriesContributedTo')
          concat('repositories')
        }
        if (result.user.repositoriesContributedTo) {
          contribPageInfo = result.user.repositoriesContributedTo.pageInfo
        }
        if (result.user.repositories) {
          repoPageInfo = result.user.repositories.pageInfo
        }

        if (contribPageInfo.hasNextPage || repoPageInfo.hasNextPage) {
          page()
        } else {
          chart.languages = {}
          let count = repo => {
            let lang
            if (!repo.primaryLanguage) return
            else lang = repo.primaryLanguage.name
            if (!chart.languages[lang]) chart.languages[lang] = 0
            chart.languages[lang] += 1
          }
          chart.user.repositoriesContributedTo.nodes.forEach(count)
          chart.user.repositoriesContributedTo.nodes.forEach(count)
          let coloropts = {
            count: Object.keys(chart.languages).length,
            hue: 'blue'
          }
          chart.labels = Object.keys(chart.languages).map(lang => {
            return `${lang} (${chart.languages[lang]})`
          })
          chart.datasets = [
            { data: Object.values(chart.languages),
              backgroundColor: pattern.generate(randomcolor(coloropts))
            }
          ]

          Vue.set(data, 'chart', chart)
        }
      })
    }
    page()

    return data
  }
}
</script>
