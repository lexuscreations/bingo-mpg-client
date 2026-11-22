import { io } from "socket.io-client";
import { BACKEND_URL } from "../utils/config";

export const socket = io(BACKEND_URL || undefined);
