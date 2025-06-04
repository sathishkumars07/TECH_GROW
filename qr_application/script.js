document.addEventListener('DOMContentLoaded', function() {
    const startScanBtn = document.getElementById('startScanBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const stopScanBtn = document.getElementById('stopScanBtn');
    const fileInput = document.getElementById('fileInput');
    const scannerPlaceholder = document.getElementById('scanner-placeholder');
    const scannerView = document.getElementById('scanner-view');
    const videoElement = document.getElementById('scanner-video');
    const canvasElement = document.getElementById('scanner-canvas');
    const statusText = document.getElementById('statusText');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const copyBtn = document.getElementById('copyBtn');
    
    let stream = null;
    let scanning = false;
    let currentResult = null;
    
    startScanBtn.addEventListener('click', startCameraScan);
    uploadBtn.addEventListener('click', () => fileInput.click());
    stopScanBtn.addEventListener('click', stopCameraScan);
    fileInput.addEventListener('change', handleFileUpload);
    copyBtn.addEventListener('click', copyResult);
    
    async function startCameraScan() {
        try {
            resultContainer.style.display = 'none';
            
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            scannerPlaceholder.style.display = 'none';
            videoElement.style.display = 'block';
            scannerView.innerHTML = '';
            scannerView.appendChild(videoElement);

            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });

            videoElement.srcObject = stream;
            await videoElement.play();
            
            startScanBtn.style.display = 'none';
            uploadBtn.style.display = 'none';
            stopScanBtn.style.display = 'block';
            
            statusText.textContent = 'Scanning... Point camera at QR code';
            scanning = true;
            
            scanFrame();
        } catch (err) {
            console.error('Camera error:', err);
            statusText.textContent = 'Could not access camera. Please try uploading an image instead.';
            startScanBtn.style.display = 'block';
            uploadBtn.style.display = 'block';
            stopScanBtn.style.display = 'none';
            
            videoElement.style.display = 'none';
            scannerPlaceholder.style.display = 'flex';
        }
    }
    
    function stopCameraScan() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        scanning = false;
        videoElement.style.display = 'none';
        scannerPlaceholder.style.display = 'flex';
        startScanBtn.style.display = 'block';
        uploadBtn.style.display = 'block';
        stopScanBtn.style.display = 'none';
        statusText.textContent = 'Point your camera at the QR code to scan';
    }
    
    function scanFrame() {
        if (!scanning) return;
        
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            const canvasContext = canvasElement.getContext('2d');
            canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            
            const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            
            if (code) {
                stopCameraScan();
                showResult(code.data);
            }
        }
        
        requestAnimationFrame(scanFrame);
    }
    
    function handleFileUpload(event) {
        resultContainer.style.display = 'none';
        const file = event.target.files[0];
        if (!file) return;
        
        fileInput.value = '';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            scannerPlaceholder.style.display = 'none';
            scannerView.innerHTML = '';
            
            const img = new Image();
            img.onload = function() {
                scannerView.appendChild(img);
                readQRFromImage(img);
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            statusText.textContent = 'Error reading file. Please try another image.';
        };
        reader.readAsDataURL(file);
    }
    
    function readQRFromImage(imgElement) {
        statusText.textContent = 'Processing image...';
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        if (code) {
            showResult(code.data);
        } else {
            statusText.textContent = 'No QR code found in the image';
            setTimeout(() => {
                scannerPlaceholder.style.display = 'flex';
                scannerView.innerHTML = '';
                statusText.textContent = 'Point your camera at the QR code to scan';
            }, 2000);
        }
    }
    
    function showResult(data) {
        resultContainer.style.display = 'flex';
        currentResult = data;
        
        const placeholder = resultContent.querySelector('.placeholder-text');
        if (placeholder) {
            resultContent.removeChild(placeholder);
        }
        
        resultContent.innerHTML = '';
        
        if (!data) {
            resultContent.innerHTML = '<p class="no-result">No valid data found</p>';
            return;
        }
        
        const formattedData = formatScanData(data);
        resultContent.innerHTML = formattedData;
        
        statusText.textContent = 'QR code scanned successfully!';
    }
    
    function formatScanData(data) {
        const lines = data.split('\n').filter(line => line.trim().length > 0);
        
        return lines.map(line => {
            if (line.includes(':')) {
                const parts = line.split(':');
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                return `<div class="result-line"><strong>${key}:</strong> ${value}</div>`;
            }
            else if (line.includes(',')) {
                return line.split(',').map(item => 
                    `<div class="result-line">${item.trim()}</div>`
                ).join('');
            }
            return `<div class="result-line">${line}</div>`;
        }).join('');
    }
    
    function copyResult() {
        if (!currentResult) return;
        
        navigator.clipboard.writeText(currentResult)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Copy failed:', err);
                copyBtn.innerHTML = '<i class="fas fa-times"></i> Error';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        startScanBtn.disabled = true;
        startScanBtn.title = "Camera not supported by your browser";
    }
});