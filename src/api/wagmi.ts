// wagmi.ts
import { http, createConfig } from '@wagmi/vue'
import { mainnet, polygon } from '@wagmi/vue/chains'
import { coinbaseWallet, walletConnect, metaMask } from '@wagmi/vue/connectors'

const projectId = 'test_page' // Replace with your WalletConnect project ID

export const config = createConfig({
    chains: [mainnet, polygon],
    connectors: [
        walletConnect({ projectId }),
        coinbaseWallet({ appName: 'Test Page' }),
        metaMask(),
    ],
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
    },
})

declare module '@wagmi/vue' {
    interface Register {
        config: typeof config
    }
}