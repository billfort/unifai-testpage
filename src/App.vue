<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

</script>

<template>
  <header>
    <a href="/polymarket"> Polymarket</a>
    <a href="/polymarketSdk"> Polymarket by sdk</a>
    <a href="/polymarketViem"> Polymarket by viem</a>
    <a href="/polymarketWagmi"> Polymarket by wagmi</a>
    <a href="/send-txn"> EVM</a>
    <a href="/solana"> Solana</a>
    <a href="/ethertest"> EtherTest</a>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>

</style>
