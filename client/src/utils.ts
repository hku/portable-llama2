export async function fetchFile(filename: string, updateProgress: (progress: number) => void = () => {}): Promise<Blob> {
    let response = await fetch(filename, { method: 'GET' });
    let reader = response.body!.getReader();
    let contentLength = +response.headers.get('Content-Length')!;
    let receivedLength = 0;
    let chunks: Uint8Array[] = [];
  
    while (true) {
      let { done, value } = await reader.read();
  
      if (done) {
        break;
      }
      const _value = value as Uint8Array
      chunks.push(_value);
      receivedLength += _value.length;
      updateProgress(receivedLength / contentLength);
    }
  
    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
  
    return new Blob([chunksAll]);
  }
