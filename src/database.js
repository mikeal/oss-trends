import PouchDB from 'pouchdb'
import github from './github'
import Vue from 'vue'

const order = str => `orderBy: {field: ${str}, direction: DESC}`
const oneday = 1000 * 60 * 60 * 24

const cache = new PouchDB(`github`, {auto_compaction: true})

const clearCache = () => {
  return cache.destroy()
}

const processRepoNode = node => {
  node.name = node.nameWithOwner.slice(node.nameWithOwner.indexOf('/') + 1)
  node.issueCount = node.issues.totalCount
  node.prCount = node.pullRequests.totalCount
  node.forkCount = node.forks.totalCount

  let _participants = nodes => {
    if (!nodes.length) return 0
    let total = nodes.reduce((count, node) => {
      return count + node.participants.totalCount
    }, 0)
    return Number((total / nodes.length).toFixed(1))
  }
  let _count = (nodes, distance) => {
    let time = Date.now() - distance
    let index = nodes.findIndex(node => {
      let t = (new Date(node.createdAt)).getTime()
      if (t < time) return true
    })
    if (index === -1) return nodes.length
    if (index === 0) return 0
    return index - 1
  }

  node.issueParticipants = _participants(node.issues.nodes)
  node.prParticipants = _participants(node.pullRequests.nodes)
  let thirtyDays = oneday * 30
  node.issuesThirtyDays = _count(node.issues.nodes, thirtyDays)
  node.prThirtyDays = _count(node.issues.nodes, thirtyDays)
  node.forksThirtyDays = _count(node.forks.nodes, thirtyDays)

  let ninetyDays = oneday * 90
  node.issuesNinetyDays = _count(node.issues.nodes, ninetyDays)
  node.prNinetyDays = _count(node.issues.nodes, ninetyDays)
  node.forksNinetyDays = _count(node.forks.nodes, ninetyDays)
}

const loadOrgData = async (org, info) => {
  let state = { _id: `org:${org}:state`, num: 5 }
  try {
    state = await cache.get(state._id)
  } catch (e) {
    // console.error(e)
  }

  let _nodes = []

  if (state.ts && state.ts > (Date.now() - oneday)) {
    Vue.set(info, 'members', state.members)
    Vue.set(info, 'repoCount', state.repoCount)
    await Promise.all(state.repos.map(name => (async () => {
      _nodes.push(await cache.get(`graph:${name}`))
    })()))
    Vue.set(info, 'repos', _nodes)
  } else {
    Vue.set(info, 'repos', _nodes)
    state.page = null
    let resp = await _loadOrgData(org, info)
    let _org = resp.organization
    state.members = _org.members.totalCount
    state.repoCount = _org.repositories.totalCount
    Vue.set(info, 'members', state.members)
    Vue.set(info, 'repoCount', state.repoCount)
    _org.repositories.nodes.forEach(node => {
      processRepoNode(node)
      _nodes.push(node)
    })
    Vue.set(info, 'loading', {percent: 0})

    Vue.set(info, 'repos', _nodes)
    while (_nodes.length !== _org.repositories.totalCount) {
      let cursor = resp.organization.repositories.pageInfo.endCursor
      resp = await _loadOrgData(org, info, cursor)
      resp.organization.repositories.nodes.forEach(node => {
        processRepoNode(node)
        _nodes.push(node)
      })
      let percent = (_nodes.length / _org.repositories.totalCount) * 100
      Vue.set(info.loading, 'percent', Math.round(percent))
    }
    state.repos = _nodes.map(node => node.nameWithOwner)
    state.ts = Date.now()
    for (let item of _nodes) {
      item._id = `graph:${item.nameWithOwner}`
      let rev
      try {
        rev = (await cache.get(item._id))._rev
      } catch (e) {
        // Ignore.
      }
      item._rev = rev
      await cache.put(item)
    }
    await cache.put(state)
    Vue.delete(info, 'loading')
  }
}

const _loadOrgData = async (org, info, page = null) => {
  let _page = page ? `, after:"${page}"` : ''
  let query = `
    query {
      organization (login: "${org}") {
        members {
          totalCount
        }
        repositories (first: 1, orderBy: {field: CREATED_AT, direction: ASC}, privacy: PUBLIC${_page}) {
          totalCount
          pageInfo {
            endCursor
          }
          nodes {
            id
            nameWithOwner
            createdAt
            updatedAt
            pullRequests (first: 100, ${order('CREATED_AT')}) {
              totalCount
              nodes {
                createdAt
                updatedAt
                id
                participants {
                  totalCount
                }
              }
            }
            issues (first: 100, ${order('CREATED_AT')}) {
              totalCount

              nodes {
                createdAt
                updatedAt
                id
                participants {
                  totalCount
                }
              }
            }
            forks (first: 100, ${order('CREATED_AT')}  ) {
              totalCount
              owner
              nodes {
                createdAt
                updatedAt
                id
              }
            }
          }
        }
        teams {
          totalCount
        }
      }
      rateLimit {
        limit
        cost
        remaining
        resetAt
      }
    }
  `
  let resp = await github.query(query)
  return resp
}

const loadOrg = (org) => {
  let info = {}
  loadOrgData(org, info)
  return info
}

export { loadOrg, clearCache }

window.clearAllCache = clearCache
