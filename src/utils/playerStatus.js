export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getPlayerStatus(p) {
  if (!p) {
    return { status: "offline", label: "Offline", dotClass: "status-offline" };
  }
  if (p.isAI) {
    return { status: "online", label: "AI Online", dotClass: "status-online" };
  }
  if (p.isConnected === false) {
    return { status: "offline", label: "Disconnected", dotClass: "status-offline" };
  }
  if (p.isAway) {
    return { status: "away", label: "Away (In Background)", dotClass: "status-away" };
  }
  return { status: "online", label: "Online", dotClass: "status-online" };
}
