const IMAGE_QUALITY = 0.5;

function compressImage(image, scale, initalWidth, initalHeight){
    return new Promise((resolve, reject) => {

        const canvas = document.createElement("canvas");

        canvas.width = scale * initalWidth;
        canvas.height = scale * initalHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        ctx.canvas.toBlob((blob) => {
            resolve(blob);
        }, "image/png", IMAGE_QUALITY); 
    }); 
}

function getImageDimensions(image){
    return new Promise((resolve, reject) => {
        image.onload = function(e){
            const width = this.width;
            const height = this.height;
            resolve({height, width});
        }
    });
}

const imageInput = document.getElementById("image-input");
imageInput.addEventListener("change", async (ev) => {

    const uploadedImage = imageInput.files[0];
    if(!uploadedImage){ // if no file is uploaded, no need to do anything
        return;
    }

    //preview the inputted image
    const inputPreview = document.getElementById("input-preview"); 
    inputPreview.src = URL.createObjectURL(uploadedImage);
    
    //get the dimensions of the input image
    const {height, width} = await getImageDimensions(inputPreview); 

    const MAX_WIDTH = 200; //if we resize by width, this is the max width of compressed image
    const MAX_HEIGHT = 200; //if we resize by height, this is the max height of the compressed image

    const widthRatioBlob = await compressImage(inputPreview, MAX_WIDTH / width, width, height); 
    const heightRatioBlob = await compressImage(inputPreview, MAX_HEIGHT / height, width, height);
 
    //pick the smaller blob between both
    const compressedBlob = widthRatioBlob.size > heightRatioBlob.size ? heightRatioBlob : widthRatioBlob;
    
    // preview the compressed blob
    const outputPreview = document.getElementById("output-preview");
    outputPreview.src = URL.createObjectURL(compressedBlob);

    /*in some cases, the initial uploaded image maybe smaller than our compressed result. 
      if that is the case, reuse the uploaded image. */
  
    const optimalBlob = compressedBlob.size < uploadedImage.size ? compressedBlob : uploadedImage; 
    console.log(`Inital Size: ${uploadedImage.size}. Compressed Size: ${optimalBlob.size}`);
    
    URL.revokeObjectURL(inputPreview);
    URL.revokeObjectURL(outputPreview);
});
