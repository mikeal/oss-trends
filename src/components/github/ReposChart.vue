<template>
  <div class="repos-chart">
    <div class="chart">
      <fancy-bar v-if="graphType === 'bar'" :chartData="chartData">
      </fancy-bar>
      <fancy-line v-if="graphType === 'line'" :chartData="chartData">
      </fancy-line>
    </div>
    <div class="settings">
      <div class="graph-data setting-group">
        <div class="settings-header">
          Graph Data:
        </div>
        <div class="settings-options">
          <input type="radio" id="created" value="created" v-model="type">
          <label for="created">Created</label>
          <input type="radio" id="people" value="people" v-model="type">
          <label for="people">People</label>
        </div>
      </div>
      <div class="graph-filters setting-group">
        <div class="settings-header">
          Include:
        </div>
        <div class="settings-options">
          <input type="checkbox" id="issues" v-model="includeData.issues" />
          <label for="issues">Issues</label>
          <input type="checkbox" id="pullRequests" v-model="includeData.pullRequests" />
          <label for="pullRequests">Pull Requests</label>
          <input type="checkbox" id="forks" v-model="includeData.forks" />
          <label for="forks">Forks</label>
        </div>
      </div>
      <div class="graph-type setting-group">
        <div class="settings-header">
          Graph Type:
        </div>
        <div class="settings-options">
          <input v-if="type === 'created'" type="radio" id="bar" value="bar" v-model="graphType">
          <label v-if="type === 'created'" for="bar">Bar</label>

          <input v-if="type === 'people'" type="radio" id="pie" value="pie" v-model="graphType">
          <label v-if="type === 'people'"  for="line">Pie</label>

          <input type="radio" id="line" value="line" v-model="graphType">
          <label for="line">Line</label>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import Vue from 'vue'

const oneday = 1000 * 60 * 60 * 24

const getLimit = (nodes, ...keys) => {
  let limit = 0

  keys.forEach(key => {
    /* Only Use the back-end of the set.
       This sets a bound at either
       1. The end of any pagination for this type.
       OR
       2. The first node in which ever set had the most nodes.
       This isn't perfect, ideally we would know the maximum pagination
       but since we don't we sort of have to guess.
    */
    let maxLength = nodes.reduce((len, item) => {
      if (item[key].nodes.length > len) return item[key].nodes.length
      return len
    }, 0)
    /* Restrict item bounds to the earliest items that have reached
       the end of pagination.
    */
    limit = nodes.reduce((_limit, item) => {
      if (item[key].nodes.length !== maxLength) return _limit
      let last = item[key].nodes[maxLength - 1]
      let time = (new Date(last.createdAt)).getTime()
      if (time > _limit) {
        return time
      }
      return _limit
    }, limit)
  })
  if (limit === 0) throw new Error('Could not determine max duration.')
  return limit
}

const findItems = (nodes, key, limit) => {
  let items = []
  nodes.forEach(node => {
    node[key].nodes.forEach(_node => {
      let time = (new Date(_node.createdAt)).getTime()
      if (time > limit) items.push(_node)
    })
  })
  return items
}

const zerofill = len => {
  return Array.apply(null, Array(len)).map(Number.prototype.valueOf, 0)
}

const getChartData = (data, repos) => {
  if (data.type === 'created' || data.type === 'repos') {
    let _inc = data.includeData
    let types = Object.keys(_inc).filter(k => _inc[k])
    let limit = getLimit(repos, ...types)

    if (data.type === 'created') {
      let distance = Date.now() - limit
      let bracket
      let dates = () => {
        let empty = zerofill(Math.ceil(distance / bracket))
        return empty.map((val, i) => {
          return new Date(Date.now() - (i * bracket))
        }).reverse()
      }
      let labels
      if (distance < oneday) {
        throw new Error('Only one day of data')
      } else if (distance < (oneday * 7)) {
        bracket = oneday
        labels = dates().map(dt => {
          let s = dt.toString().split(' ')
          return s.slice(1, 3)
        })
      } else if (distance < (oneday * 90)) {
        bracket = oneday * 7
        labels = dates().map(dt => {
          let s = dt.toString().split(' ')
          return 'Week of ' + s.slice(1, 3)
        })
      } else {
        bracket = oneday * 30
        labels = dates().map(dt => {
          let s = dt.toString().split(' ')
          return s.slice(1, 2)
        })
      }

      let _reduce = items => {
        let _data = zerofill(Math.ceil(distance / bracket))

        items.forEach(item => {
          let t = (new Date(item.createdAt)).getTime()
          let i = Math.floor((Date.now() - t) / bracket)
          _data[i] += 1
        })
        return _data.reverse().slice(1)
      }

      let capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
      let colors = [
        'rgb(114, 147, 203)',
        'rgb(225, 151, 76)',
        'rgb(132, 186, 91)'
      ]

      let datasets = types.map(type => {
        let items = findItems(repos, type, limit)
        let label = capitalize(type)
        return {
          label,
          data: _reduce(items),
          backgroundColor: colors.shift(),
          type: data.graphType,
          fill: false
        }
      })

      return {
        labels: labels.slice(1),
        datasets
      }
    }
  }
}

const onChange = function () {
  Vue.set(this.$data, 'chartData', getChartData(this.$data, this.repos))
}

export default {
  props: ['repos'],
  data: function () {
    let data =
      { type: 'created',
        types: ['created', 'people', 'repos'],
        graph: ['bar', 'line'],
        includeData: {issues: true, pullRequests: true, forks: true},
        graphType: 'bar',
        show: {issues: true, prs: true, forks: true}
      }
    data.chartData = this.repos ? getChartData(data, this.repos) : null
    return data
  },
  watch: {
    repos: onChange,
    graphType: onChange,
    type: onChange,
    includeData: {
      handler: onChange,
      deep: true
    }
  }
}
</script>

<style scoped>
div.chart {
  max-width: 400px;
}
div.repos-chart {
  display: grid;
  grid-template-columns: 400px auto;
  justify-content: start;
}
div.repos-chart * {
  place-self: start;
  text-align: left;
}
div.setting-group {
  display: grid;
  grid-template-columns: 120px auto;
}
</style>
