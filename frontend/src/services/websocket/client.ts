/**
 * WebSocket Client
 * Real-time communication for inference progress and updates
 */

import { io, Socket } from 'socket.io-client';
import { API_CONFIG, SECURITY_CONFIG } from '../../constants/config';
import { InferenceStatus } from '../../types';

export interface InferenceProgressUpdate {
  jobId: string;
  progress: number;
  tilesProcessed: number;
  totalTiles: number;
  detectionCount: number;
  estimatedTimeRemaining?: number;
}

export interface InferenceStatusUpdate {
  jobId: string;
  status: InferenceStatus;
  error?: string;
}

export interface SlideStatusUpdate {
  slideId: string;
  status: string;
  error?: string;
}

type EventCallback<T> = (data: T) => void;

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    const token = localStorage.getItem(SECURITY_CONFIG.TOKEN_STORAGE_KEY);

    this.socket = io(API_CONFIG.WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  public onInferenceProgress(callback: EventCallback<InferenceProgressUpdate>) {
    this.socket?.on('inference:progress', callback);
  }

  public onInferenceStatusChange(callback: EventCallback<InferenceStatusUpdate>) {
    this.socket?.on('inference:status', callback);
  }

  public onSlideStatusChange(callback: EventCallback<SlideStatusUpdate>) {
    this.socket?.on('slide:status', callback);
  }

  public subscribeToJob(jobId: string) {
    this.socket?.emit('subscribe:job', jobId);
  }

  public unsubscribeFromJob(jobId: string) {
    this.socket?.emit('unsubscribe:job', jobId);
  }

  public subscribeToSlide(slideId: string) {
    this.socket?.emit('subscribe:slide', slideId);
  }

  public unsubscribeFromSlide(slideId: string) {
    this.socket?.emit('unsubscribe:slide', slideId);
  }

  public disconnect() {
    this.socket?.disconnect();
  }

  public reconnect() {
    this.socket?.connect();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();
