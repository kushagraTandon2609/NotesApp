import { BlockchainNote, EncryptedNote } from '../types';
import EncryptionService from './encryptionService';

class BlockchainService {
  private static chain: BlockchainNote[] = [];
  private static readonly DIFFICULTY = 2; // Number of leading zeros required in hash

  /**
   * Creates the genesis block for the blockchain
   */
  static createGenesisBlock(): BlockchainNote {
    const genesisBlock: BlockchainNote = {
      id: 'genesis',
      hash: '',
      previousHash: '0',
      timestamp: Date.now(),
      data: {
        id: 'genesis',
        encryptedData: 'Genesis Block',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      nonce: 0,
    };

    genesisBlock.hash = this.calculateHash(genesisBlock);
    return genesisBlock;
  }

  /**
   * Calculates hash for a block
   */
  static calculateHash(block: BlockchainNote): string {
    const blockString = `${block.previousHash}${block.timestamp}${JSON.stringify(block.data)}${block.nonce}`;
    return EncryptionService.generateHash(blockString);
  }

  /**
   * Mines a block by finding a hash with required difficulty
   */
  static mineBlock(block: BlockchainNote): BlockchainNote {
    const target = Array(this.DIFFICULTY + 1).join('0');
    
    while (block.hash.substring(0, this.DIFFICULTY) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }

    console.log(`Block mined: ${block.hash}`);
    return block;
  }

  /**
   * Adds a new note to the blockchain
   */
  static addNoteToBlockchain(encryptedNote: EncryptedNote): BlockchainNote {
    if (this.chain.length === 0) {
      this.chain.push(this.createGenesisBlock());
    }

    const previousBlock = this.chain[this.chain.length - 1];
    
    const newBlock: BlockchainNote = {
      id: encryptedNote.id,
      hash: '',
      previousHash: previousBlock.hash,
      timestamp: Date.now(),
      data: encryptedNote,
      nonce: 0,
    };

    const minedBlock = this.mineBlock(newBlock);
    this.chain.push(minedBlock);
    
    return minedBlock;
  }

  /**
   * Validates the entire blockchain
   */
  static validateChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block hash is valid
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        console.error(`Invalid hash at block ${i}`);
        return false;
      }

      // Check if previous hash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Invalid previous hash at block ${i}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the entire blockchain
   */
  static getChain(): BlockchainNote[] {
    return [...this.chain];
  }

  /**
   * Gets a specific block by note ID
   */
  static getBlockByNoteId(noteId: string): BlockchainNote | null {
    return this.chain.find(block => block.data.id === noteId) || null;
  }

  /**
   * Gets blockchain statistics
   */
  static getBlockchainStats() {
    return {
      totalBlocks: this.chain.length,
      isValid: this.validateChain(),
      lastBlock: this.chain[this.chain.length - 1],
    };
  }

  /**
   * Exports blockchain data for backup
   */
  static exportBlockchain(): string {
    return JSON.stringify(this.chain, null, 2);
  }

  /**
   * Imports blockchain data from backup
   */
  static importBlockchain(chainData: string): boolean {
    try {
      const importedChain: BlockchainNote[] = JSON.parse(chainData);
      
      // Validate imported chain
      const tempChain = this.chain;
      this.chain = importedChain;
      
      if (this.validateChain()) {
        console.log('Blockchain imported successfully');
        return true;
      } else {
        this.chain = tempChain;
        console.error('Invalid blockchain data');
        return false;
      }
    } catch (error) {
      console.error('Failed to import blockchain:', error);
      return false;
    }
  }
}

export default BlockchainService;