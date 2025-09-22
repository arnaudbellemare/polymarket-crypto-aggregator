import WebSocket from 'ws';
import { MessageTypes, Channels, EventTypes, MarketData, TradeData } from '../types/index.js';

/**
 * WebSocket Client for Polymarket CLOB
 * Handles real-time market data streaming
 */
export class WebSocketClient {
  constructor(wsUrl = 'wss://ws-subscriptions-clob.polymarket.com/ws/', options = {}) {
    this.wsUrl = wsUrl;
    this.options = {
      reconnectInterval: options.reconnectInterval || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      heartbeatInterval: options.heartbeatInterval || 30000,
      ...options
    };
    
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.subscriptions = new Set();
    this.messageHandlers = new Map();
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    
    // Event emitters
    this.eventHandlers = {
      connect: [],
      disconnect: [],
      error: [],
      message: [],
      marketUpdate: [],
      tradeUpdate: [],
      orderBookUpdate: []
    };
  }

  /**
   * Connect to the WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.on('open', () => {
          console.log('WebSocket connected to Polymarket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connect');
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', (code, reason) => {
          console.log(`WebSocket closed: ${code} ${reason}`);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnect', { code, reason });
          this.handleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    this.clearReconnectTimer();
  }

  /**
   * Subscribe to market data for specific assets
   */
  subscribeToMarket(assetIds) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: MessageTypes.SUBSCRIBE,
      channel: Channels.MARKET,
      asset_ids: Array.isArray(assetIds) ? assetIds : [assetIds]
    };

    this.sendMessage(message);
    
    // Track subscriptions
    assetIds.forEach(id => this.subscriptions.add(id));
  }

  /**
   * Unsubscribe from market data
   */
  unsubscribeFromMarket(assetIds) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: MessageTypes.UNSUBSCRIBE,
      channel: Channels.MARKET,
      asset_ids: Array.isArray(assetIds) ? assetIds : [assetIds]
    };

    this.sendMessage(message);
    
    // Remove from subscriptions
    assetIds.forEach(id => this.subscriptions.delete(id));
  }

  /**
   * Subscribe to user data
   */
  subscribeToUser(userId) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: MessageTypes.SUBSCRIBE,
      channel: Channels.USER,
      user_id: userId
    };

    this.sendMessage(message);
  }

  /**
   * Send a message through the WebSocket
   */
  sendMessage(message) {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      throw error;
    }
  }

  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      this.emit('message', message);

      switch (message.type) {
        case EventTypes.TRADE:
          this.handleTradeUpdate(message);
          break;
        case EventTypes.ORDER_BOOK:
          this.handleOrderBookUpdate(message);
          break;
        case EventTypes.MARKET_DATA:
          this.handleMarketUpdate(message);
          break;
        case 'error':
          this.handleError(message);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle trade updates
   */
  handleTradeUpdate(message) {
    try {
      const tradeData = new TradeData(message.data);
      this.emit('tradeUpdate', tradeData);
    } catch (error) {
      console.error('Error processing trade update:', error);
    }
  }

  /**
   * Handle order book updates
   */
  handleOrderBookUpdate(message) {
    try {
      this.emit('orderBookUpdate', message.data);
    } catch (error) {
      console.error('Error processing order book update:', error);
    }
  }

  /**
   * Handle market data updates
   */
  handleMarketUpdate(message) {
    try {
      const marketData = new MarketData(message.data);
      this.emit('marketUpdate', marketData);
    } catch (error) {
      console.error('Error processing market update:', error);
    }
  }

  /**
   * Handle error messages
   */
  handleError(message) {
    console.error('WebSocket error message:', message);
    this.emit('error', message);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({ type: 'ping' });
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().then(() => {
        // Resubscribe to all previous subscriptions
        this.resubscribe();
      }).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.options.reconnectInterval);
  }

  /**
   * Clear reconnect timer
   */
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Resubscribe to all previous subscriptions
   */
  resubscribe() {
    if (this.subscriptions.size > 0) {
      this.subscribeToMarket(Array.from(this.subscriptions));
    }
  }

  /**
   * Add event listener
   */
  on(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(handler);
    }
  }

  /**
   * Remove event listener
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      const index = this.eventHandlers[event].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions),
      url: this.wsUrl
    };
  }
}
