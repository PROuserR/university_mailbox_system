// lib/signalR.ts
import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;
let connectionPromise: Promise<signalR.HubConnection | null> | null = null;
const getHubUrl = (): string => {
    return process.env.NEXT_PUBLIC_SIGNALR_URL || "https://universitymailbox.runasp.net/hubs/notification";
};
export const startSignalRConnection = async (onNotificationReceived: (notification: any) => void) => {
  // إذا كان هناك اتصال قيد الإنشاء بالفعل
  if (connectionPromise) {
    return connectionPromise;
  }

  // إذا كان الاتصال موجوداً ومتصل
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  // تنظيف الاتصال القديم
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    try {
      await connection.stop();
    } catch (err) {
      console.warn("Error stopping existing connection:", err);
    }
    connection = null;
  }

  const hubUrl = getHubUrl();
  console.log("🔌 Connecting to SignalR hub:", hubUrl);

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      withCredentials: true,
      transport: signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ReceiveNotification", (notification) => {
    // console.log("🔔✅ ReceiveNotification received:", notification);
    onNotificationReceived(notification);
  });

  connection.onreconnecting((error) => {
    // console.warn("🔄 SignalR reconnecting...", error);
  });

  connection.onreconnected((connectionId) => {
    // console.log("✅ SignalR reconnected successfully! ConnectionId:", connectionId);
  });

  connection.onclose((error) => {
    // console.warn("❌ SignalR connection closed:", error);
    connection = null;
    connectionPromise = null;
  });

  connectionPromise = (async () => {
    try {
      await connection!.start();
      // console.log("✅ SignalR Connected successfully! State:", connection!.state);
      return connection;
    } catch (err) {
      // console.error("❌ SignalR Connection failed:", err);
      connection = null;
      setTimeout(() => {
        connectionPromise = null;
        startSignalRConnection(onNotificationReceived);
      }, 5000);
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

export const stopSignalRConnection = async () => {
  if (connectionPromise) {
    await connectionPromise;
    connectionPromise = null;
  }
  if (connection) {
    try {
      await connection.stop();
    } catch (err) {
      // console.warn("Error stopping connection:", err);
    }
    connection = null;
    // console.log("SignalR Disconnected");
  }
};

export const getConnection = () => connection;

export const isConnected = () => {
  return connection && connection.state === signalR.HubConnectionState.Connected;
};