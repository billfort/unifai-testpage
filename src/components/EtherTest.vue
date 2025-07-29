<template>
  <div>
    <h1>EtherTest</h1>
    <p>This is the EtherTest component.</p>
    <button @click="connect">Connect</button>
    <p>address: {{ address }}</p>
    <input type="text" v-model="toAddress" />
    <input type="text" v-model="amount" />
    <button @click="sendTxn">sendTxn</button>
    <p>tx hash: {{ txHash }}</p>
    <pre>receipt: {{ receipt }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ethers } from 'ethers';
import { ref } from 'vue';

const address = ref('');
const toAddress = ref('0xA31AE2f02B257b234D8C773ECEC21B73F17c2036');
const amount = ref('0.1');
const signer = ref(null);
const txHash = ref('');
const receipt = ref('');

async function connect1() {
  const srcRpc = "https://polygon-rpc.com";
  const provider = new ethers.JsonRpcProvider(srcRpc);
  const privateKey = '0xf8e4a07a4c9be50e073df43e74130d6774152743f809e516af1e5bd2319968d8';
  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = wallet.connect(provider);
  address.value = await signer.getAddress();
  console.log('signer: ', signer);
  const tx = await signer.sendTransaction({
    to: '0xA31AE2f02B257b234D8C773ECEC21B73F17c2036',
    value: 1,
  });
  console.log('tx: ', tx);
  const txReceipt = await tx.wait();
  console.log('receipt: ', txReceipt);
  receipt.value = JSON.stringify(txReceipt, null, 2);
}

async function connect() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  signer.value = await provider.getSigner();
  address.value = await signer.value.getAddress();
  console.log('signer: ', signer.value);
}

async function sendTxn() {
  if (!signer.value) {
    alert('Please connect your wallet first.');
    return;
  }
  try {
    const tx = await signer.value.sendTransaction({
      to: toAddress.value,
      value: ethers.parseEther(amount.value),
    });
    console.log('tx: ', tx);
    txHash.value = tx.hash;
    const txReceipt = await tx.wait();
    console.log('receipt: ', txReceipt);
    receipt.value = JSON.stringify(txReceipt, null, 2);
  } catch (error) {
    console.error('sendTxn error:', error);
    alert('Transaction failed: ' + error.message);
  }
}
// Add your script logic here
</script>

<style scoped>
/* Add your styles here */
</style>