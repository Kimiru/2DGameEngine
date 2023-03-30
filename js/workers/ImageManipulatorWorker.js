onmessage = async (event) => {
    let canvas = event.data;
    let ctx = canvas.getContext('2d');
    let blob = await canvas.convertToBlob();
    let blobUrl = URL.createObjectURL(blob);
    postMessage(blobUrl);
};
