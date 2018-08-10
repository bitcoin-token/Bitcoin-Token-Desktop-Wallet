import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Wallet',
      component: require('@/components/Wallet').default,
      props: true
    },
    {
      path: '/agreement',
      name: 'Agreement',
      component: require('@/components/Agreement').default,
      props: true
    },
    {
      path: '/eth',
      name: 'EthWallet',
      component: require('@/components/EthWallet').default,
      props: true
    },
    {
      path: '/create',
      name: 'Create',
      component: require('@/components/Create').default,
      props: true
    },
    {
      path: '/receive',
      name: 'Receive',
      component: require('@/components/Receive').default,
      props: true
    },
    {
      path: '/send',
      name: 'Send',
      component: require('@/components/Send').default,
      props: true
    },
    {
      path: '/settings',
      name: 'Settings',
      component: require('@/components/Settings').default,
      props: true
    },
    {
      path: '/settings/key',
      name: 'ExportPrivateKey',
      component: require('@/components/settings/ExportPrivateKey').default,
      props: true
    },
    {
      path: '/settings/seed',
      name: 'ExportSeedPhrase',
      component: require('@/components/settings/ExportSeedPhrase').default,
      props: true
    },
    {
      path: '/settings/reset',
      name: 'ChangePassword',
      component: require('@/components/settings/ChangePassword').default,
      props: true
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
