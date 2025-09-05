import axios, { AxiosResponse } from 'axios';
import { IPFSClusterConfig } from '../config/data-layer.config';
import { logger } from '../utils/logger';

export interface IPFSUploadResult {
  cid: string;
  size: number;
  name?: string;
}

export interface IPFSFileInfo {
  cid: string;
  size: number;
  name?: string;
  type?: string;
}

export interface IPFSPinResult {
  cid: string;
  name?: string;
  replication_factor_min?: number;
  replication_factor_max?: number;
  shard_size?: number;
  user_allocations?: string[];
}

export interface IPFSClusterStatus {
  id: string;
  addresses: string[];
  cluster_peers: string[];
  cluster_peers_addresses: string[];
  version: string;
  commit: string;
  peername: string;
  rpc_protocol_version: string;
}

export class IPFSClusterService {
  private config: IPFSClusterConfig;
  private isConnected: boolean = false;

  constructor(config: IPFSClusterConfig) {
    this.config = config;
  }

  /**
   * Initialize IPFS Cluster connection
   */
  async initialize(): Promise<void> {
    try {
      // Test connection by getting cluster status
      await this.getClusterStatus();
      this.isConnected = true;
      logger.info('✅ IPFS Cluster initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize IPFS Cluster:', error);
      throw error;
    }
  }

  /**
   * Upload a file to IPFS Cluster
   */
  async uploadFile(fileBuffer: Buffer, filename?: string): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, filename);

      const response: AxiosResponse = await axios.post(
        `${this.config.apiUrl}/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: this.config.timeout,
          maxContentLength: this.config.maxFileSize,
          maxBodyLength: this.config.maxFileSize,
        }
      );

      if (response.status === 200 && response.data) {
        const result: IPFSUploadResult = {
          cid: response.data.Hash || response.data.cid,
          size: response.data.Size || response.data.size,
          name: response.data.Name || filename,
        };

        logger.debug('File uploaded to IPFS:', { cid: result.cid, size: result.size });
        return result;
      }

      throw new Error('Invalid response from IPFS Cluster');
    } catch (error) {
      logger.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS Cluster
   */
  async uploadJSON(data: any, filename?: string): Promise<IPFSUploadResult> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString, 'utf-8');
      return await this.uploadFile(buffer, filename || 'data.json');
    } catch (error) {
      logger.error('Failed to upload JSON to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload proof data to IPFS Cluster
   */
  async uploadProof(proofData: any, farmer: string, blockNumber?: number): Promise<IPFSUploadResult> {
    try {
      const proof = {
        farmer,
        block_number: blockNumber,
        timestamp: new Date().toISOString(),
        proof_data: proofData,
        version: '1.0',
      };

      const filename = `proof_${farmer}_${blockNumber || Date.now()}.json`;
      return await this.uploadJSON(proof, filename);
    } catch (error) {
      logger.error('Failed to upload proof to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload log data to IPFS Cluster
   */
  async uploadLog(logData: any[], logType: string): Promise<IPFSUploadResult> {
    try {
      const log = {
        type: logType,
        timestamp: new Date().toISOString(),
        entries: logData,
        count: logData.length,
        version: '1.0',
      };

      const filename = `${logType}_${Date.now()}.json`;
      return await this.uploadJSON(log, filename);
    } catch (error) {
      logger.error('Failed to upload log to IPFS:', error);
      throw error;
    }
  }

  /**
   * Pin a file by CID
   */
  async pinFile(cid: string, name?: string): Promise<IPFSPinResult> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.config.apiUrl}/pins/${cid}`,
        {
          name,
          replication_factor_min: 1,
          replication_factor_max: 3,
        },
        {
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200 && response.data) {
        logger.debug('File pinned to IPFS:', { cid });
        return response.data;
      }

      throw new Error('Failed to pin file');
    } catch (error) {
      logger.error('Failed to pin file:', error);
      throw error;
    }
  }

  /**
   * Unpin a file by CID
   */
  async unpinFile(cid: string): Promise<boolean> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.config.apiUrl}/pins/${cid}`,
        {
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200) {
        logger.debug('File unpinned from IPFS:', { cid });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to unpin file:', error);
      throw error;
    }
  }

  /**
   * Get file information by CID
   */
  async getFileInfo(cid: string): Promise<IPFSFileInfo> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.apiUrl}/object/stat/${cid}`,
        {
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200 && response.data) {
        return {
          cid,
          size: response.data.CumulativeSize || response.data.size,
          name: response.data.Name,
          type: response.data.Type,
        };
      }

      throw new Error('Failed to get file info');
    } catch (error) {
      logger.error('Failed to get file info:', error);
      throw error;
    }
  }

  /**
   * Download file by CID
   */
  async downloadFile(cid: string): Promise<Buffer> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.apiUrl}/cat/${cid}`,
        {
          responseType: 'arraybuffer',
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200) {
        return Buffer.from(response.data);
      }

      throw new Error('Failed to download file');
    } catch (error) {
      logger.error('Failed to download file:', error);
      throw error;
    }
  }

  /**
   * Download JSON data by CID
   */
  async downloadJSON(cid: string): Promise<any> {
    try {
      const buffer = await this.downloadFile(cid);
      const jsonString = buffer.toString('utf-8');
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error('Failed to download JSON:', error);
      throw error;
    }
  }

  /**
   * Get cluster status
   */
  async getClusterStatus(): Promise<IPFSClusterStatus> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.apiUrl}/id`,
        {
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new Error('Failed to get cluster status');
    } catch (error) {
      logger.error('Failed to get cluster status:', error);
      throw error;
    }
  }

  /**
   * Get cluster peers
   */
  async getClusterPeers(): Promise<string[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.apiUrl}/peers`,
        {
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new Error('Failed to get cluster peers');
    } catch (error) {
      logger.error('Failed to get cluster peers:', error);
      throw error;
    }
  }

  /**
   * Get pinned files
   */
  async getPinnedFiles(): Promise<IPFSPinResult[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.config.apiUrl}/pins`,
        {
          timeout: this.config.timeout,
        }
      );

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new Error('Failed to get pinned files');
    } catch (error) {
      logger.error('Failed to get pinned files:', error);
      throw error;
    }
  }

  /**
   * Check if a file is pinned
   */
  async isPinned(cid: string): Promise<boolean> {
    try {
      const pinnedFiles = await this.getPinnedFiles();
      return pinnedFiles.some(file => file.cid === cid);
    } catch (error) {
      logger.error('Failed to check if file is pinned:', error);
      return false;
    }
  }

  /**
   * Get file URL for gateway access
   */
  getFileURL(cid: string): string {
    return `${this.config.gatewayUrl}/${cid}`;
  }

  /**
   * Batch upload multiple files
   */
  async batchUpload(files: Array<{ buffer: Buffer; filename?: string }>): Promise<IPFSUploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file.buffer, file.filename));
      const results = await Promise.all(uploadPromises);
      
      logger.debug('Batch upload completed:', { count: results.length });
      return results;
    } catch (error) {
      logger.error('Failed to batch upload files:', error);
      throw error;
    }
  }

  /**
   * Upload and pin a file in one operation
   */
  async uploadAndPin(fileBuffer: Buffer, filename?: string): Promise<IPFSUploadResult> {
    try {
      const uploadResult = await this.uploadFile(fileBuffer, filename);
      await this.pinFile(uploadResult.cid, filename);
      
      logger.debug('File uploaded and pinned:', { cid: uploadResult.cid });
      return uploadResult;
    } catch (error) {
      logger.error('Failed to upload and pin file:', error);
      throw error;
    }
  }

  /**
   * Check if service is connected
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Test connection to IPFS Cluster
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getClusterStatus();
      return true;
    } catch (error) {
      logger.error('IPFS Cluster connection test failed:', error);
      return false;
    }
  }
}
