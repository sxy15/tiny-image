export function isImageFile(name: string) {
    const imageExtensions = /\.(png|jpe?g|gif)$/i;
    return imageExtensions.test(name);
}

export function isDotFile(name: string) {
    const dotExtensions = /^\./i;
    return dotExtensions.test(name);
}

export const fileToUint8Array = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result;
        resolve(new Uint8Array(arrayBuffer)); // Convert ArrayBuffer to Uint8Array
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

// 字节转换函数 Kb Mb 
export const byteToSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}
