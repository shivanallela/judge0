const { execSync } = require('child_process');

class Judge0Service {
  constructor() {
    this.cachedUrl = process.env.JUDGE0_URL || 'http://localhost:2358';
    this.lastResolvedAt = 0;
  }

  async getWslIp() {
    try {
      const output = execSync('wsl hostname -I', { encoding: 'utf-8', timeout: 4000 });
      const firstIp = output.trim().split(/\s+/)[0];
      if (firstIp && /^\d+\.\d+\.\d+\.\d+$/.test(firstIp)) {
        return firstIp;
      }
    } catch (err) {
      // WSL not available or timed out
    }
    return null;
  }

  async testUrl(baseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${baseUrl}/about`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return true;
      }
    } catch (err) {
      // Connection failed
    }
    return false;
  }

  async resolveJudge0Url() {
    // If resolved within last 60 seconds, reuse
    if (this.cachedUrl && Date.now() - this.lastResolvedAt < 60000) {
      return this.cachedUrl;
    }

    const candidateUrls = [
      process.env.JUDGE0_URL,
      'http://localhost:2358',
      'http://127.0.0.1:2358'
    ].filter(Boolean);

    for (const url of candidateUrls) {
      if (await this.testUrl(url)) {
        this.cachedUrl = url;
        this.lastResolvedAt = Date.now();
        return url;
      }
    }

    // Try WSL IP detection
    if (process.env.AUTO_DETECT_WSL !== 'false') {
      const wslIp = await this.getWslIp();
      if (wslIp) {
        const wslUrl = `http://${wslIp}:2358`;
        if (await this.testUrl(wslUrl)) {
          this.cachedUrl = wslUrl;
          this.lastResolvedAt = Date.now();
          return wslUrl;
        }
      }
    }

    return this.cachedUrl || 'http://localhost:2358';
  }

  async checkHealth() {
    const baseUrl = await this.resolveJudge0Url();
    try {
      const res = await fetch(`${baseUrl}/about`);
      if (res.ok) {
        const data = await res.json();
        return {
          connected: true,
          url: baseUrl,
          version: data.version || 'unknown'
        };
      }
    } catch (err) {
      return {
        connected: false,
        url: baseUrl,
        error: err.message
      };
    }
  }

  async executeCode({ language_id, source_code, stdin = '', expected_output = undefined }) {
    const baseUrl = await this.resolveJudge0Url();
    const endpoint = `${baseUrl}/submissions?base64_encoded=true&wait=true`;

    const encodeB64 = (str) => {
      if (!str) return '';
      return Buffer.from(str, 'utf-8').toString('base64');
    };

    const decodeB64 = (b64) => {
      if (!b64) return '';
      return Buffer.from(b64, 'base64').toString('utf-8');
    };

    const payload = {
      language_id: Number(language_id),
      source_code: encodeB64(source_code),
      stdin: encodeB64(stdin)
    };

    if (expected_output !== undefined && expected_output !== null) {
      payload.expected_output = encodeB64(expected_output);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Judge0 responded with HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      return {
        token: result.token,
        status: {
          id: result.status ? result.status.id : null,
          description: result.status ? result.status.description : 'Unknown'
        },
        stdout: decodeB64(result.stdout),
        stderr: decodeB64(result.stderr),
        compile_output: decodeB64(result.compile_output),
        message: decodeB64(result.message),
        time: result.time !== null && result.time !== undefined ? `${result.time}s` : null,
        memory: result.memory !== null && result.memory !== undefined ? `${result.memory} KB` : null,
        exit_code: result.exit_code,
        exit_signal: result.exit_signal
      };
    } catch (err) {
      clearTimeout(timeoutId);
      this.lastResolvedAt = 0;
      if (err.name === 'AbortError' || (err.message && (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')))) {
        throw new Error('Judge0 execution service is unavailable.');
      }
      throw err;
    }
  }
}

module.exports = new Judge0Service();
