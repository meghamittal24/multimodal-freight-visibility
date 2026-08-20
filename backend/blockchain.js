import crypto from 'crypto';

export class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data) +
          this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Simple difficulty so it hashes instantly but shows nonce incrementing
  }

  createGenesisBlock() {
    return new Block(0, "2026-08-14T12:00:00.000Z", { info: "CargoChain Genesis Block" }, "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check current hash matches calculated hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return { isValid: false, tamperedIndex: i, reason: "Hash mismatch" };
      }

      // Check current block's previous hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return { isValid: false, tamperedIndex: i, reason: "Link mismatch" };
      }
    }
    return { isValid: true };
  }
}

export function restoreBlockchain(chainData) {
  const blockchain = new Blockchain();
  if (Array.isArray(chainData) && chainData.length > 0) {
    blockchain.chain = chainData.map(b => {
      const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
      block.nonce = b.nonce;
      block.hash = b.hash;
      return block;
    });
  }
  return blockchain;
}
