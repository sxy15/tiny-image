export function isImageFile(name: string) {
    const imageExtensions = /\.(png|jpe?g|gif)$/i;
    return imageExtensions.test(name);
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