/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/signalR.ts
import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";

// ============================================================
// ===== State Management =====
// ============================================================

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

interface SignalRState {
    connection: signalR.HubConnection | null;
    state: ConnectionState;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    reconnectDelay: number;
    backoffMultiplier: number;
    isManualDisconnect: boolean;
    callbacks: Set<(notification: any) => void>;
    listeners: Set<(state: ConnectionState) => void>;
    isInitialized: boolean;
}

const state: SignalRState = {
    connection: null,
    state: 'disconnected',
    reconnectAttempts: 0,
    maxReconnectAttempts: 3,
    reconnectDelay: 5000,
    backoffMultiplier: 1.5,
    isManualDisconnect: false,
    callbacks: new Set(),
    listeners: new Set(),
    isInitialized: false,
};

let reconnectTimer: NodeJS.Timeout | null = null;
let connectionPromise: Promise<signalR.HubConnection | null> | null = null;

// ============================================================
// ===== Configuration =====
// ============================================================

const getHubUrl = (): string => {
    const signalRUrl = process.env.NEXT_PUBLIC_SIGNALR_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (signalRUrl) {
        return signalRUrl;
    }
    
    if (apiUrl) {
        return apiUrl.replace(/\/api$/, '') + '/hubs/notification';
    }
    
    return 'https://localhost:7236/hubs/notification';
};

const getReconnectDelay = (attempt: number): number => {
    const delay = state.reconnectDelay * Math.pow(state.backoffMultiplier, attempt);
    return Math.min(delay, 30000);
};

// ============================================================
// ===== Core Functions =====
// ============================================================

const updateState = (newState: ConnectionState) => {
    state.state = newState;
    state.listeners.forEach((listener) => {
        try {
            listener(newState);
        } catch (error) {
            // تجاهل
        }
    });
};

const handleIncomingNotification = (notification: any) => {
    state.callbacks.forEach((callback) => {
        try {
            callback(notification);
        } catch (error) {
            // تجاهل
        }
    });
};

const createConnection = (): signalR.HubConnection | null => {
    try {
        const hubUrl = getHubUrl();

        return new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                withCredentials: true,
                transport: signalR.HttpTransportType.LongPolling,
                timeout: 30000,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    const attempt = retryContext.previousRetryCount || 0;
                    
                    if (retryContext.elapsedMilliseconds > 60000) {
                        return null;
                    }
                    
                    return Math.min(
                        getReconnectDelay(attempt),
                        30000
                    );
                }
            })
            // ✅ إخفاء جميع الـ Logs
            .configureLogging(signalR.LogLevel.None)
            .build();
    } catch (error) {
        return null;
    }
};

const setupConnectionEvents = (connection: signalR.HubConnection) => {
    connection.on('ReceiveNotification', handleIncomingNotification);

    connection.onreconnecting(() => {
        updateState('reconnecting');
    });

    connection.onreconnected(() => {
        updateState('connected');
        state.reconnectAttempts = 0;
    });

    connection.onclose((error) => {
        state.connection = null;
        connectionPromise = null;
        
        if (!state.isManualDisconnect) {
            updateState('disconnected');
            scheduleReconnect();
        } else {
            updateState('disconnected');
            state.isManualDisconnect = false;
        }
    });
};

// ============================================================
// ===== Reconnection Logic =====
// ============================================================

const scheduleReconnect = () => {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (state.reconnectAttempts >= state.maxReconnectAttempts) {
        updateState('failed');
        return;
    }

    const delay = getReconnectDelay(state.reconnectAttempts);
    state.reconnectAttempts++;
    
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        attemptReconnect();
    }, delay);
};

const attemptReconnect = async () => {
    if (connectionPromise) {
        return;
    }

    if (state.connection?.state === signalR.HubConnectionState.Connected) {
        state.reconnectAttempts = 0;
        return;
    }

    updateState('connecting');

    try {
        const conn = await startSignalRConnection();
        if (conn?.state === signalR.HubConnectionState.Connected) {
            state.reconnectAttempts = 0;
            updateState('connected');
        } else {
            scheduleReconnect();
        }
    } catch (error) {
        scheduleReconnect();
    }
};

// ============================================================
// ===== Silent Connection (بدون أخطاء في Console) =====
// ============================================================

const silentStart = async (): Promise<signalR.HubConnection | null> => {
    try {
        return await startSignalRConnection();
    } catch {
        return null;
    }
};

// ============================================================
// ===== Public API =====
// ============================================================

export const startSignalRConnection = async (): Promise<signalR.HubConnection | null> => {
    // ✅ منع المحاولة إذا كان الـ Connection في حالة Connected
    if (state.connection?.state === signalR.HubConnectionState.Connected) {
        return state.connection;
    }

    // ✅ منع المحاولة إذا كان هناك اتصال قائم في حالة Reconnecting
    if (state.connection?.state === signalR.HubConnectionState.Reconnecting) {
        return state.connection;
    }

    // ✅ منع المحاولات المتزامنة
    if (connectionPromise) {
        return connectionPromise;
    }

    // ✅ إيقاف الاتصال القديم
    if (state.connection) {
        try {
            await state.connection.stop();
        } catch {
            // تجاهل
        }
        state.connection = null;
    }

    updateState('connecting');
    state.isManualDisconnect = false;

    // ✅ إنشاء الاتصال
    const connection = createConnection();
    if (!connection) {
        updateState('disconnected');
        scheduleReconnect();
        return null;
    }

    setupConnectionEvents(connection);
    state.connection = connection;

    connectionPromise = (async () => {
        try {
            await connection.start();
            updateState('connected');
            state.reconnectAttempts = 0;
            state.isInitialized = true;
            return connection;
        } catch {
            // ✅ تجاهل الخطأ تماماً
            state.connection = null;
            updateState('disconnected');
            scheduleReconnect();
            return null;
        } finally {
            connectionPromise = null;
        }
    })();

    return connectionPromise;
};

export const stopSignalRConnection = async () => {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    state.isManualDisconnect = true;
    state.reconnectAttempts = 0;
    updateState('disconnected');

    if (connectionPromise) {
        await connectionPromise;
        connectionPromise = null;
    }

    if (state.connection) {
        try {
            await state.connection.stop();
        } catch {
            // تجاهل
        }
        state.connection = null;
    }
};

// ============================================================
// ===== Callback Management =====
// ============================================================

export const registerNotificationCallback = (callback: (notification: any) => void) => {
    state.callbacks.add(callback);
    
    // ✅ بدء الاتصال بصمت
    if (!state.isInitialized) {
        silentStart();
    }
    
    return () => {
        state.callbacks.delete(callback);
    };
};

export const clearCallbacks = () => {
    state.callbacks.clear();
};

// ============================================================
// ===== State Listener Management =====
// ============================================================

export const subscribeToState = (listener: (state: ConnectionState) => void) => {
    state.listeners.add(listener);
    return () => {
        state.listeners.delete(listener);
    };
};

// ============================================================
// ===== Utility Functions =====
// ============================================================

export const getConnection = () => state.connection;

export const isConnected = () => {
    return state.connection?.state === signalR.HubConnectionState.Connected;
};

export const getConnectionState = () => state.state;

export const getConnectionId = () => {
    return state.connection?.connectionId || null;
};

export const reconnect = async (): Promise<signalR.HubConnection | null> => {
    state.reconnectAttempts = 0;
    
    if (state.connection) {
        try {
            await state.connection.stop();
        } catch {
            // تجاهل
        }
        state.connection = null;
    }
    connectionPromise = null;
    
    return startSignalRConnection();
};

// ============================================================
// ===== React Hook for SignalR State =====
// ============================================================

export const useSignalRState = () => {
    const [currentState, setCurrentState] = useState<ConnectionState>('disconnected');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToState((newState) => {
            setCurrentState(newState);
            setIsConnected(newState === 'connected');
        });

        queueMicrotask(() => {
            setCurrentState(state.state);
            setIsConnected(state.state === 'connected');
        });

        return unsubscribe;
    }, []);

    return { state: currentState, isConnected };
};