import { Command } from '@tauri-apps/api/shell';

let sidecarInstance: Command | null = null;
const resolvers = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();

// This function starts the sidecar and sets up listeners
async function getSidecar(): Promise<Command> {
  if (sidecarInstance) {
    return sidecarInstance;
  }

  const cmd = Command.sidecar('src-deno/bin/backend');

  cmd.stdout.on('data', (line: string) => {
    try {
      const response = JSON.parse(line);
      const { id, result, error } = response;

      if (id && resolvers.has(id)) {
        const { resolve, reject } = resolvers.get(id)!;
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
        resolvers.delete(id);
      }
    } catch (e) {
      console.error("Failed to parse sidecar response:", line, e);
    }
  });

  cmd.stderr.on('data', (line) => {
    console.error(`[Sidecar STDERR]: ${line}`);
  });

  await cmd.spawn();
  sidecarInstance = cmd;
  return cmd;
}

// A helper function to execute commands on the Deno sidecar
export async function executeSidecarCommand<T>(
  command: string,
  params: any[] = []
): Promise<T> {
  const sidecar = await getSidecar();
  const id = `${command}-${Date.now()}-${Math.random()}`;

  const request = {
    command,
    params,
    id,
  };

  return new Promise<T>((resolve, reject) => {
    resolvers.set(id, { resolve, reject });
    sidecar.write(JSON.stringify(request) + '\n');

    // Add a timeout to prevent promises from hanging forever
    setTimeout(() => {
      if (resolvers.has(id)) {
        resolvers.delete(id);
        reject(new Error(`Command '${command}' timed out after 30 seconds`));
      }
    }, 30000);
  });
}
