import { Block, Blockchain } from './blockchain.js';

console.log('=== Starting CargoChain Cryptographic Verification ===');

// 1. Initialize Blockchain
const myChain = new Blockchain();
console.log('Genesis block generated. Initial Hash:', myChain.chain[0].hash);

// 2. Add Block 1
console.log('\nAdding Shipment 1 block...');
myChain.addBlock(
  new Block(1, new Date().toISOString(), {
    type: 'CREATE',
    shipmentId: 'SHIP-999',
    cargoType: 'Medicines',
    weight: 2000,
  })
);
console.log('Block 1 Added. Hash:', myChain.getLatestBlock().hash);
console.log('Previous Hash Link verified:', myChain.getLatestBlock().previousHash === myChain.chain[0].hash);

// 3. Add Block 2
console.log('\nAdding Handover block...');
myChain.addBlock(
  new Block(2, new Date().toISOString(), {
    type: 'HANDOVER',
    shipmentId: 'SHIP-999',
    officer: 'S. Patel',
    weightConfirmed: 2000,
    signatureHash: '0xabc123...',
  })
);
console.log('Block 2 Added. Hash:', myChain.getLatestBlock().hash);

// 4. Validate Chain
let audit = myChain.isChainValid();
console.log('\n--- Initial Chain Integrity Audit ---');
console.log('Is chain valid?', audit.isValid);
if (!audit.isValid) {
  console.error('ERROR: Fresh chain is invalid! Details:', audit);
  process.exit(1);
} else {
  console.log('SUCCESS: Blockchain signatures verified.');
}

// 5. Tamper with Block 1
console.log('\n--- Simulating Tampering Attack on Block 1 ---');
console.log('Hijacking Cargo Weight from 2000kg to 9999kg in Block 1...');
myChain.chain[1].data.weight = 9999; 

// 6. Validate Chain Again
audit = myChain.isChainValid();
console.log('\n--- Post-Tampering Chain Integrity Audit ---');
console.log('Is chain valid?', audit.isValid);
console.log('Tamper Index identified:', audit.tamperedIndex);
console.log('Fail Reason:', audit.reason);

if (!audit.isValid && audit.tamperedIndex === 1) {
  console.log('\nSUCCESS: Immutability proof verified! The ledger successfully flagged corruption at Block #1.');
} else {
  console.error('\nFAILURE: Tampering went undetected or wrong index reported!', audit);
  process.exit(1);
}
