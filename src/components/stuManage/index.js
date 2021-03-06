import Stulist from './stuList.vue'

var components = [
  Stulist
]

/* istanbul ignore next */
const install = function (Vue, opts) {
  components.map(c => {
    Vue.component(c.name, c)
  })
}

const routes = function () {
  return [
    { path: '/stu/list', name: 'Stulist', component: Stulist },
  ]
}

export default { install, routes }
