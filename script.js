document.addEventListener('DOMContentLoaded', function() {
    // API endpoint
    const API_URL = 'https://multilingualscamdetection.onrender.com';
    
    // DOM elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');
    const textForm = document.getElementById('text-form');
    const voiceForm = document.getElementById('voice-form');
    const urlForm = document.getElementById('url-form');
    const resultDiv = document.getElementById('result');
    const resultContent = document.querySelector('.result-content');
    const audioPlayer = document.getElementById('audio-player');
    const audio = document.querySelector('audio');
    const loadingDiv = document.getElementById('loading');
    
    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected section, hide others
            sections.forEach(section => {
                if (section.id === target) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Hide result when switching tabs
            resultDiv.classList.add('hidden');
        });
    });
    
    // Text form submission
    textForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = textForm.querySelector('textarea').value;
        
        if (!text.trim()) return;
        
        showLoading();
        
        try {
            const formData = new FormData();
            formData.append('message', text);
            
            const response = await fetch(`${API_URL}/scan/text`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log("Text API Response:", data);
            displayResult(data);
        } catch (error) {
            showError('Failed to analyze text. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
    
    // Voice form submission
    voiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const voiceFile = document.getElementById('voice-file').files[0];
        
        if (!voiceFile) return;
        
        showLoading();
        
        try {
            const formData = new FormData();
            formData.append('file', voiceFile);
            
            const response = await fetch(`${API_URL}/scan/voice`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log("Voice API Response:", data);
            displayResult(data);
        } catch (error) {
            showError('Failed to analyze voice. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
    
    // URL form submission
    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlForm.querySelector('input').value;
        
        if (!url.trim()) return;
        
        showLoading();
        
        try {
            const formData = new FormData();
            formData.append('url', url);
            
            const response = await fetch(`${API_URL}/scan/url`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log("URL API Response:", data);
            displayResult(data);
        } catch (error) {
            showError('Failed to analyze URL. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoading();
        }
    });
    
    // Display result function
    function displayResult(data) {
        resultDiv.classList.remove('hidden');
    resultContent.classList.remove('scam', 'safe');
    
    const isScam = Boolean(data.scam);
    resultContent.classList.add(isScam ? 'scam' : 'safe');

    let resultHTML = `
        <div class="status-banner ${isScam ? 'scam' : 'safe'}">
            ${isScam ? '⚠️ SCAM DETECTED!' : '✅ No scam detected'}
        </div>
        <div class="analysis-summary">
            <div class="language-pill">Language: ${data.language || 'Unknown'}</div>
    `;

    if (data.transcript) {
        resultHTML += `<div class="transcript-box">${data.transcript}</div>`;
    }

    if (data.details && typeof data.details === 'object') {
        resultHTML += `
        <div class="analysis-details">
            <div class="indicators-grid">
                ${(data.details.scam_indicators || []).map(indicator => `
                    <div class="indicator-card">
                        <div class="indicator-icon">⚠️</div>
                        <div class="indicator-text">${indicator}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add detailed explanations
        const { scam_indicators, ...explanations } = data.details;
        resultHTML += Object.entries(explanations).map(([key, value]) => `
            <div class="explanation-box">
                <h4>${key.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</h4>
                <p>${value}</p>
            </div>
        `).join('');
        
        resultHTML += `</div>`; // Close analysis-details
    }

    resultContent.innerHTML = resultHTML;
        // Handle audio alert if available
        if (data.audio) {
            const audioSrc = API_URL + data.audio;
            audio.src = audioSrc;
            audioPlayer.classList.remove('hidden');
            
            console.log("Playing audio from:", audioSrc);
            audio.load();
            audio.play().catch(err => {
                console.error('Failed to play audio:', err);
            });
        } else {
            audioPlayer.classList.add('hidden');
        }
        
        // Scroll to result
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show error message
    function showError(message) {
        resultDiv.classList.remove('hidden');
        resultContent.classList.remove('scam', 'safe');
        resultContent.innerHTML = `<p class="error">${message}</p>`;
    }
    
    // Show loading state
    function showLoading() {
        loadingDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    }
    
    // Hide loading state
    function hideLoading() {
        loadingDiv.classList.add('hidden');
    }
});
