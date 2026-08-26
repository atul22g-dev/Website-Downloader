"use client";

import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

function generateToken(n) {
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var randomValues = new Uint32Array(n);
  crypto.getRandomValues(randomValues);
  var token = "";
  for (var i = 0; i < n; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  return token;
}

export function useSocket() {
  var socketRef = useRef(null);
  var tokenRef = useRef(null);

  useEffect(function () {
    var token = localStorage.getItem("token");
    if (!token) {
      token = generateToken(20);
      // oxlint-disable-next-line react-doctor/auth-token-in-web-storage
      localStorage.setItem("token", token);
    }
    tokenRef.current = token;

    var socket = io({ transports: ["websocket", "polling"] });
    socketRef.current = socket;

    return function () {
      socket.disconnect();
    };
  }, []);

  var startDownload = useCallback(function (url, onEvent) {
    var socket = socketRef.current;
    var token = tokenRef.current;
    if (!socket || !token) return;

    // Remove any stale listener before adding a new one
    socket.off(token);
    socket.on(token, onEvent);
    socket.emit("request", { token: token, website: url });
  }, []);

  var cleanup = useCallback(function () {
    var socket = socketRef.current;
    var token = tokenRef.current;
    if (socket && token) {
      socket.off(token);
    }
  }, []);

  return { startDownload: startDownload, cleanup: cleanup };
}
