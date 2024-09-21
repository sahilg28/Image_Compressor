const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewImage = document.getElementById('previewImage');
const uploadedFileSize = document.getElementById('uploadedFileSize');
const compressionSlider = document.getElementById('compressionSlider');
const compressionValue = document.getElementById('compressionValue');
const estimatedCompressedSize = document.getElementById('estimatedCompressedSize');
const qualityWarning = document.getElementById('qualityWarning');
const compressBtn = document.getElementById('compressBtn');
const resultContainer = document.getElementById('resultContainer');
const compressionFeedback = document.getElementById('compressionFeedback');
const sizeComparison = document.getElementById('sizeComparison');
const downloadBtn = document.getElementById('downloadBtn');

let originalFile;

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', handleFileDrop);
fileInput.addEventListener('change', handleFileSelect);
compressionSlider.addEventListener('input', updateCompressionValue);
compressBtn.addEventListener('click', compressImage);

function handleFileDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
}

function handleFileSelect(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    if (files.length > 0) {
        originalFile = files[0];
        previewImage.src = URL.createObjectURL(originalFile);
        previewImage.hidden = false;
        uploadedFileSize.textContent = `Uploaded file size: ${formatSizeKB(originalFile.size)} KB`;
        updateCompressionEstimate();
        dropZone.hidden = true;
        compressBtn.disabled = false;
        resultContainer.hidden = true; // Hide previous results
    }
}

function formatSizeKB(bytes) {
    return (bytes / 1024).toFixed(2);
}

function updateCompressionValue() {
    const value = compressionSlider.value;
    compressionValue.textContent = `${value}%`;
    updateCompressionEstimate();
    
    if (value > 80) {
        qualityWarning.textContent = "Warning: High compression may result in noticeable quality loss.";
        qualityWarning.hidden = false;
    } else {
        qualityWarning.hidden = true;
    }
}

function updateCompressionEstimate() {
    if (originalFile) {
        const compressionRatio = compressionSlider.value / 100;
        // Improved estimation formula
        const estimatedSize = originalFile.size * (1 - compressionRatio * 0.9);
        estimatedCompressedSize.textContent = `Estimated compressed size: ${formatSizeKB(estimatedSize)} KB`;
    }
}

async function compressImage() {
    if (!originalFile) {
        console.error('No file selected for compression');
        return;
    }

    compressBtn.disabled = true;
    resultContainer.hidden = true;

    try {
        console.log('Starting compression...');
        const compressionRatio = compressionSlider.value / 100;
        const quality = 1 - compressionRatio;
        const options = {
            maxSizeMB: originalFile.size / (1024 * 1024), // Convert to MB
            maxWidthOrHeight: 4096,
            useWebWorker: true,
            initialQuality: quality
        };

        console.log('Compression options:', options);
        console.log('Original file:', originalFile.name, originalFile.type, originalFile.size);
        
        const compressedFile = await imageCompression(originalFile, options);
        
        console.log('Compressed file:', compressedFile.name, compressedFile.type, compressedFile.size);
        console.log('Compression ratio:', compressedFile.size / originalFile.size);
        
        const originalSizeKB = formatSizeKB(originalFile.size);
        const compressedSizeKB = formatSizeKB(compressedFile.size);
        const actualCompressionPercentage = ((originalFile.size - compressedFile.size) / originalFile.size * 100).toFixed(2);

        compressionFeedback.textContent = `Image compressed by ${actualCompressionPercentage}%`;
        sizeComparison.textContent = `Original: ${originalSizeKB} KB, Compressed: ${compressedSizeKB} KB`;
        
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = `compressed_${originalFile.name}`;
            link.click();
        };

        resultContainer.hidden = false;
        console.log('Compression results displayed');
    } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error compressing image: ' + error.message);
    } finally {
        compressBtn.disabled = false;
    }
}

// Initialize compression value display
updateCompressionValue();