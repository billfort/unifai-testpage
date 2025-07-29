

// chainId: '0x89' for Polygon
export async function connectWallet(ethereum: any, chainId: string) {
    if (!ethereum) {
        alert('MetaMask is not installed. Please install it to use this app.');
    }

    let walletAddress = '';
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('accounts: ', accounts)
        walletAddress = accounts[0];

        const chId = await ethereum.request({ method: 'eth_chainId' });
        console.log('walletchainId: ', chId)
        if (chId !== chainId) { // Chain ID for Polygon is 137
            try {
                await switchChain(ethereum, chainId)
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                // if (switchError.code === 4902) {
                //     await addPolygonChain(ethereum)
                // } else {
                console.error(switchError);
                // }
            }
        }
    } catch (error) {
        alert('Failed to connect to MetaMask.');
        console.error(error);
    }

    return walletAddress
}

export async function switchChain(ethereum: any, chainId: string) {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainId }],
        });
    } catch (error) {
        console.error(error);
    }
}

export async function addPolygonChain(ethereum: any) {
    try {
        await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: '0x89',
                    chainName: 'Polygon Mainnet',
                    rpcUrls: ['https://polygon-rpc.com/'],
                    nativeCurrency: {
                        name: 'POL',
                        symbol: 'POL',
                        decimals: 18
                    },
                    blockExplorerUrls: ['https://polygonscan.com/']
                },
            ],
        });
    } catch (addError) {
        alert('Failed to add the Polygon network to MetaMask.');
        console.error(addError);
    }
}