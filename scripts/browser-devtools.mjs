const delay=ms=>new Promise(r=>setTimeout(r,ms));
class DevTools {
  next = 0; pending = new Map(); listeners = new Map();
  static async open(url) {
    const client = new DevTools(); client.socket = new WebSocket(url);
    await new Promise((resolve, reject) => { client.socket.onopen = resolve; client.socket.onerror = reject; });
    client.socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const request = client.pending.get(message.id);
        if (!request) return;
        client.pending.delete(message.id); clearTimeout(request.timer);
        if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
      } else for (const listener of client.listeners.get(message.method) || []) listener(message.params);
    };
    return client;
  }
  on(method, listener) { this.listeners.set(method, [...this.listeners.get(method) || [], listener]); }
  call(method, params = {}) {
    const id = ++this.next;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 20000);
      this.pending.set(id, { resolve, reject, timer }); this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression, userGesture = false) {
    const result = await this.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture }).catch(error => { throw new Error('Runtime.evaluate: ' + expression.slice(0, 240), { cause: error }); });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  async wait(expression, label) {
    for (let i = 0; i < 150; i++) { if (await this.evaluate(`Boolean(${expression})`)) return; await delay(100); }
    throw Error('Timeout: ' + label);
  }
  close() { this.socket.close(); }
}


export { DevTools, delay };
