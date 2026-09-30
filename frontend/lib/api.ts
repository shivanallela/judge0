export interface Judge0StatusResponse {
  connected: boolean;
  url: string;
  version?: string;
  error?: string;
}

export interface RunResult {
  token?: string;
  status: string;
  status_id?: number;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  time?: string;
  memory?: number;
  exit_code?: number;
  exit_signal?: number;
}

export interface RunResponse {
  success: boolean;
  action?: string;
  result?: RunResult;
  error?: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export async function checkJudge0Status(): Promise<Judge0StatusResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/judge0/status`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return { connected: false, url: '', error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      url: '',
      error: err.message || 'Failed to connect to backend',
    };
  }
}

export async function runCode(
  languageId: number,
  sourceCode: string,
  stdin: string = ''
): Promise<RunResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to compiler backend.',
    };
  }
}
