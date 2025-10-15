
// Basic Web3 swap implementation using ethers.js and PancakeSwap v2 router.
// WARNING: This is example code. Use at your own risk. Always test with small amounts first.

const tokenAddress = "0x8A128ae8823202e3ad53431319034A2eDe9Be9CC".toLowerCase();
// PancakeSwap v2 router (common default) - change if you want v3 router
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB = "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

let provider, signer, userAddress;

const routerAbi = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable'
];

async function connectWallet(){
  if(window.ethereum === undefined){
    alert('MetaMask or compatible wallet not found.');
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  document.getElementById('connectBtn').innerText = 'Connected: ' + shorten(userAddress);
  console.log('Connected', userAddress);
}

function shorten(addr){
  return addr.slice(0,6) + '...' + addr.slice(-4);
}

async function estimate(){
  try{
    if(!provider) { alert('Connect wallet first'); return; }
    const amountIn = ethers.utils.parseEther(document.getElementById('bnbAmount').value || '0');
    const router = new ethers.Contract(routerAddress, routerAbi, provider);
    const path = [WBNB, tokenAddress];
    const amounts = await router.getAmountsOut(amountIn, path);
    const out = amounts[1];
    document.getElementById('estimate').innerText = ethers.utils.formatUnits(out, 18) + ' BitLoTop';
  }catch(err){
    console.error(err);
    alert('Estimate failed: ' + err.message);
  }
}

async function swap(){
  try{
    if(!provider) { alert('Connect wallet first'); return; }
    const amountIn = ethers.utils.parseEther(document.getElementById('bnbAmount').value || '0');
    const slippagePercent = parseFloat(document.getElementById('slippage').value || '1');
    if(amountIn.lte(0)){ alert('Enter BNB amount'); return; }
    const router = new ethers.Contract(routerAddress, routerAbi, signer);
    const path = [WBNB, tokenAddress];
    // estimate out
    const amounts = await router.getAmountsOut(amountIn, path);
    const expectedOut = amounts[1];
    const amountOutMin = expectedOut.mul(100 - Math.floor(slippagePercent)).div(100);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
    const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
      amountOutMin,
      path,
      userAddress,
      deadline,
      { value: amountIn, gasLimit: 300000 }
    );
    document.getElementById('status').innerText = 'Transaction sent: ' + tx.hash;
    await tx.wait();
    document.getElementById('status').innerText = 'Swap completed: ' + tx.hash;
  }catch(err){
    console.error(err);
    alert('Swap failed: ' + (err && err.message ? err.message : err));
  }
}

document.getElementById('connectBtn').addEventListener('click', connectWallet);
document.getElementById('estimateBtn').addEventListener('click', estimate);
document.getElementById('swapBtn').addEventListener('click', swap);
