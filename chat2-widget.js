(function() {
    // 1. Read Configuration from the user's script
    const userConfig = window.ChatWidgetConfig || {};
    
    // Default Configuration (Falls back to this if specific settings are missing)
    const CONFIG = {
        webhookUrl: userConfig.webhook?.url || "",
        // Colors
        primaryColor: userConfig.style?.primaryColor || "#1D2959",
        secondaryColor: userConfig.style?.secondaryColor || "#1D2959",
        // Branding
        logo: userConfig.branding?.logo || "",
        companyName: userConfig.branding?.name || "Adan Construction",
        // We use the greeting with buttons by default, unless overriden
        greeting: "Hello! How can I help you today?",
        poweredByText: userConfig.branding?.poweredBy?.text || "Powered by Adan Construction",
        poweredByLink: userConfig.branding?.poweredBy?.link || "#"
    };

    // 2. Inject CSS Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .n8n-chat-widget {
            font-family: 'Poppins', sans-serif;
            --primary: ${CONFIG.primaryColor};
            --secondary: ${CONFIG.secondaryColor};
            box-sizing: border-box;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2147483647;
        }
        
        .n8n-launcher {
            height: 60px;
            padding: 0 25px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
            float: right; 
        }
        .n8n-launcher:hover { transform: scale(1.05); }

        .n8n-window {
            position: fixed;
            bottom: 95px;
            right: 20px;
            width: 380px;
            height: 600px;
            max-height: 80vh;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 5px 30px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #eee;
        }
        .n8n-window.active { display: flex; }

        .n8n-header {
            padding: 16px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .n8n-header-left { display: flex; align-items: center; gap: 10px; }
        .n8n-logo { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; background: white; }
        .n8n-title { font-weight: 600; font-size: 16px; }
        .n8n-close { background:none; border:none; color:white; font-size:24px; cursor:pointer; }

        .n8n-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .n8n-bubble {
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .n8n-bot {
            background: white;
            border: 1px solid #e5e7eb;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
            color: #333;
        }
        .n8n-user {
            background: var(--primary);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .n8n-image-preview {
            max-width: 100%;
            border-radius: 8px;
            margin-bottom: 5px;
            display: block;
        }

        /* QUICK REPLIES */
        .n8n-quick-replies-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: -5px;
            margin-bottom: 10px;
            width: 100%;
            align-self: flex-start;
            padding-left: 5px;
        }
        .n8n-quick-reply-btn {
            background: white;
            border: 1.5px solid var(--primary); 
            color: var(--primary);
            padding: 8px 16px;
            border-radius: 50px; 
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        .n8n-quick-reply-btn:hover {
            background: var(--primary);
            color: white;
        }

        .n8n-input-box {
            padding: 16px;
            background: white;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .n8n-attach-btn {
            font-size: 24px;
            cursor: pointer;
            color: #555;
            background: none;
            border: none;
            padding: 0 5px;
            transition: color 0.2s;
        }
        .n8n-attach-btn:hover { color: var(--primary); }
        
        .n8n-input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            outline: none;
            font-family: inherit;
        }
        .n8n-input:focus { border-color: var(--primary); }
        
        .n8n-send {
            width: 42px;
            height: 42px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }

        .n8n-file-preview {
            padding: 8px 16px;
            background: #f0fdf4;
            border-top: 1px solid #dcfce7;
            font-size: 12px;
            color: #166534;
            display: none;
            align-items: center;
            justify-content: space-between;
        }
        .n8n-file-preview.visible { display: flex; }
        .n8n-remove-file { cursor: pointer; color: #ef4444; font-weight: bold; margin-left: 10px; }

        .n8n-footer {
            text-align: center;
            padding: 8px;
            font-size: 11px;
            color: #999;
            border-top: 1px solid #f9f9f9;
        }
        .n8n-footer a { color: inherit; text-decoration: none; }
    `;
    document.head.appendChild(style);

    // 3. Inject HTML Structure
    const container = document.createElement('div');
    container.className = 'n8n-chat-widget';
    
    // Check if we have a logo to display
    const logoHtml = CONFIG.logo ? `<img src="${CONFIG.logo}" class="n8n-logo" alt="Logo">` : '';

    container.innerHTML = `
        <button class="n8n-launcher" id="n8n-launcher-btn">
            <span style="font-size: 24px;">💬</span>
            <span>Need help?</span>
        </button>

        <div class="n8n-window" id="n8n-window">
            <div class="n8n-header">
                <div class="n8n-header-left">
                    ${logoHtml}
                    <span class="n8n-title">${CONFIG.companyName}</span>
                </div>
                <button class="n8n-close" id="n8n-close-btn">×</button>
            </div>
            <div class="n8n-messages" id="n8n-messages"></div>
            
            <div class="n8n-file-preview" id="n8n-file-preview">
                <span id="n8n-filename"></span>
                <span class="n8n-remove-file" id="n8n-remove-file">×</span>
            </div>

            <div class="n8n-input-box">
                <button class="n8n-attach-btn" id="n8n-attach-btn" title="Attach file">📎</button>
                <input type="file" id="n8n-file-input" style="display:none" accept="image/*,.pdf,.doc,.docx">
                
                <input type="text" class="n8n-input" id="n8n-input" placeholder="Type a message...">
                <button class="n8n-send" id="n8n-send-btn">➤</button>
            </div>
            <div class="n8n-footer">
                <a href="${CONFIG.poweredByLink}" target="_blank">${CONFIG.poweredByText}</a>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 4. Logic Implementation
    const launcher = document.getElementById('n8n-launcher-btn');
    const windowEl = document.getElementById('n8n-window');
    const closeBtn = document.getElementById('n8n-close-btn');
    const input = document.getElementById('n8n-input');
    const sendBtn = document.getElementById('n8n-send-btn');
    const messages = document.getElementById('n8n-messages');
    const attachBtn = document.getElementById('n8n-attach-btn');
    const fileInput = document.getElementById('n8n-file-input');
    const filePreview = document.getElementById('n8n-file-preview');
    const fileNameDisplay = document.getElementById('n8n-filename');
    const removeFileBtn = document.getElementById('n8n-remove-file');

    let session_id = 'session-' + Math.random().toString(36).substring(7);
    let currentFile = null; 
    let currentFileBase64 = null; 

    // Initial Greeting
    processBotResponse(CONFIG.greeting);

    // Toggle Window
    launcher.onclick = () => {
        windowEl.classList.toggle('active');
        if(windowEl.classList.contains('active')) input.focus();
    };
    closeBtn.onclick = () => windowEl.classList.remove('active');

    // File Handling
    attachBtn.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            currentFile = file;
            fileNameDisplay.textContent = "📎 " + file.name;
            filePreview.classList.add('visible');
            const reader = new FileReader();
            reader.onload = function(evt) { currentFileBase64 = evt.target.result; };
            reader.readAsDataURL(file);
        }
    };
    removeFileBtn.onclick = () => {
        currentFile = null;
        currentFileBase64 = null;
        fileInput.value = "";
        filePreview.classList.remove('visible');
    };

    // Send Message Logic
    async function sendMessage(textOverride = null) {
        const text = textOverride !== null ? textOverride : input.value.trim();
        if(!text && !currentFile) return;

        // Clear buttons
        document.querySelectorAll('.n8n-quick-replies-container').forEach(el => el.remove());

        // User Bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'n8n-bubble n8n-user';
        
        let contentHtml = "";
        if (currentFile && currentFile.type.startsWith('image/')) {
            if(currentFileBase64) contentHtml += `<img src="${currentFileBase64}" class="n8n-image-preview">`;
            else contentHtml += `<div>📎 <i>${currentFile.name} (Image)</i></div>`;
        } else if (currentFile) {
            contentHtml += `<div>📎 <i>${currentFile.name}</i></div>`;
        }
        if (text) contentHtml += `<div>${text}</div>`;
        
        userBubble.innerHTML = contentHtml;
        messages.appendChild(userBubble);
        messages.scrollTop = messages.scrollHeight;

        // Prepare Payload
        const formData = new FormData();
        formData.append('sessionId', session_id);
        formData.append('action', 'sendMessage');
        if (text) formData.append('chatInput', text); 
        if (currentFile) formData.append('data', currentFile, currentFile.name); 

        // Reset UI
        input.value = '';
        removeFileBtn.click(); 

        const typingId = addMessage('...', 'bot');

        // Network Request
        try {
            const response = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error(`Server returned ${response.status}`);
            const data = await response.json();
            
            const typingEl = document.getElementById(typingId);
            if(typingEl) typingEl.remove();

            const rawText = data.output || data.text || data.message || (typeof data === 'string' ? data : JSON.stringify(data)); 
            processBotResponse(rawText);

        } catch (error) {
            console.error("Widget Error:", error);
            const typingEl = document.getElementById(typingId);
            if(typingEl) typingEl.textContent = "Connection Error";
        }
    }

    // Button Parser
    function processBotResponse(fullText) {
        const buttonBlockRegex = /\[BUTTONS\]([\s\S]*?)\[\/BUTTONS\]/;
        const match = buttonBlockRegex.exec(fullText);
        let buttons = [];
        let cleanText = fullText;

        if (match) {
            const rawContent = match[1];
            buttons = rawContent.split('\n').map(b => b.trim()).filter(b => b.length > 0);
            cleanText = fullText.replace(buttonBlockRegex, '').trim();
        }

        if(cleanText) addMessage(cleanText, 'bot');

        if (buttons.length > 0) {
            const containerDiv = document.createElement('div');
            containerDiv.className = 'n8n-quick-replies-container';
            buttons.forEach(btnText => {
                const btn = document.createElement('button');
                btn.className = 'n8n-quick-reply-btn';
                btn.textContent = btnText;
                btn.onclick = () => sendMessage(btnText);
                containerDiv.appendChild(btn);
            });
            messages.appendChild(containerDiv);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.id = 'msg-' + Math.random().toString(36).substring(7);
        div.className = `n8n-bubble n8n-${sender}`;
        div.innerHTML = text.replace(/\n/g, '<br>'); 
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div.id;
    }

    sendBtn.onclick = () => sendMessage();
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
})();
