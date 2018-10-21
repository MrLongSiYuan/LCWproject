/**
 * Created by wanghuan on 2016/7/21.
 */
import common from './common.js'
import checkoutState from './checkoutState.js'
import rule from './rule'
import record from './record'

const debug = process.env.NODE_ENV !== 'production'

Vue.config.debug = debug;

export default new Vuex.Store({
  modules: {
      common,
      checkoutState,
      rule,
      record
  },
  strict: debug
})
