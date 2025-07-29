import { createPublicClient, extractChain, http } from 'viem';
import * as chains from 'viem/chains';

export async function wait(chainId: number, txHash: string) {
  const chain = extractChain({
    chains: Object.values(chains) as chains.Chain[],
    id: chainId,
  });

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
  console.log('Transaction receipt:', receipt);
  if (receipt.status === 'success') {
    return { status: 1 };
  }

  throw new Error('waitForTransactionReceipt failed');
}

wait( 137, '0x4089812b522a907c4da9ce6f597208caf0c6cf1eabd2f95497f2cc5860508118').then(result => {
  console.log('Transaction receipt:', result);
}).catch(error => {
  console.error('Error:', error);
});