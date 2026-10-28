import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client as SSHClient } from "ssh2";
import net from "net";

// Polyfill para permitir serialização de BigInt em JSON
if (typeof BigInt !== "undefined" && !(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}

const globalForPrisma = globalThis as unknown as {
  prismaCache?: PrismaClient;
  tunnelConnecting?: Promise<PrismaClient>;
};

export async function getPrismaClient(): Promise<PrismaClient> {
  if (globalForPrisma.prismaCache) {
    return globalForPrisma.prismaCache;
  }

  // 1. MODO PRODUÇÃO / SERVIDOR (Sem SSH_HOST definido): Conexão direta com PostgreSQL
  if (!process.env.SSH_HOST) {
    const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      max: 10,
    });

    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ adapter });
    globalForPrisma.prismaCache = client;
    return client;
  }

  // 2. MODO DESENVOLVIMENTO LOCAL (Com SSH_HOST definido): Abre túnel SSH para a VPS
  if (globalForPrisma.tunnelConnecting) {
    return globalForPrisma.tunnelConnecting;
  }

  globalForPrisma.tunnelConnecting = new Promise<PrismaClient>((resolve, reject) => {
    const ssh = new SSHClient();

    const cleanup = () => {
      globalForPrisma.prismaCache = undefined;
      globalForPrisma.tunnelConnecting = undefined;
      try {
        ssh.end();
      } catch {}
    };

    ssh.on("ready", () => {
      const localServer = net.createServer((socket) => {
        ssh.forwardOut(
          "127.0.0.1",
          socket.remotePort || 12345,
          process.env.DB_HOST || "127.0.0.1",
          parseInt(process.env.DB_PORT || "5432", 10),
          (err, stream) => {
            if (err) {
              console.error("❌ Erro no SSH forwardOut:", err);
              socket.end();
              if (err.message === "Not connected") cleanup();
              return;
            }
            socket.pipe(stream);
            stream.pipe(socket);
          }
        );
      });

      localServer.on("error", (err) => {
        console.error("❌ Erro no servidor TCP de túnel local:", err);
        cleanup();
        reject(new Error("Erro no servidor local de túnel: " + err.message));
      });

      localServer.listen(0, "127.0.0.1", () => {
        const address = localServer.address() as net.AddressInfo;
        const localPort = address.port;

        const pool = new Pool({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          host: "127.0.0.1",
          port: localPort,
          max: 10,
        });

        const adapter = new PrismaPg(pool);
        const client = new PrismaClient({ adapter });
        globalForPrisma.prismaCache = client;
        resolve(client);
      });

      ssh.on("close", () => {
        cleanup();
      });
    });

    ssh.on("error", (err) => {
      console.error("❌ Erro na conexão SSH com a VPS:", err);
      cleanup();
      reject(new Error("Erro de conexão SSH: " + err.message));
    });

    try {
      ssh.connect({
        host: process.env.SSH_HOST,
        port: parseInt(process.env.SSH_PORT || "22", 10),
        username: process.env.SSH_USER || "root",
        password: process.env.SSH_PASSWORD,
        readyTimeout: 15000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
      });
    } catch (err: any) {
      cleanup();
      reject(new Error("Erro ao iniciar handshake SSH: " + err.message));
    }
  });

  return globalForPrisma.tunnelConnecting;
}

// Proxy transparente para suportar tanto "import { prisma } from '@/lib/prisma'" quanto "await getPrismaClient()"
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "$disconnect") {
      return async () => {
        if (globalForPrisma.prismaCache) {
          await globalForPrisma.prismaCache.$disconnect();
          globalForPrisma.prismaCache = undefined;
        }
      };
    }
    return new Proxy(
      {},
      {
        get(_modelTarget, modelProp) {
          return async (...args: any[]) => {
            const client = await getPrismaClient();
            const model = (client as any)[prop];
            if (typeof model === "function") {
              return model.apply(client, args);
            }
            if (model && typeof model[modelProp] === "function") {
              return model[modelProp].apply(model, args);
            }
            return model ? model[modelProp] : undefined;
          };
        },
      }
    );
  },
});
