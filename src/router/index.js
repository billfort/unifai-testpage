import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/polymarket', name: 'Polymarket', component: () => import('../components/Polymarket.vue'), },
    { path: '/polymarketSdk', name: 'PolymarketSdk', component: () => import('../components/PolymarketSdk.vue'), },
    { path: '/polymarketViem', name: 'PolymarketViem', component: () => import('../components/PolymarketViem.vue'), },
    { path: '/send-txn', name: 'SendTxn', component: () => import('../components/SendTxn.vue'), },
    { path: '/solana', name: 'Solana', component: () => import('../components/Solana.vue'), },
    { path: '/polymarketWagmi', name: 'PolymarketWagmi', component: () => import('../components/PolymarketWagmi.vue'), },
    { path: '/ethertest', name: 'EtherTest', component: () => import('../components/EtherTest.vue'), },
]

export default routes 