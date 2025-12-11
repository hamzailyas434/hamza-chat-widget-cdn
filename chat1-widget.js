// Interactive Chat Widget for n8n (DIRECT-START VERSION, PRE-CHAT BYPASSED)
// Changes: 1) No name/email  2) Auto greeting  3) "Powered by Adan Construction"
(function() {
    // Initialize widget only once
    if (window.N8nChatWidgetLoaded) return;
    window.N8nChatWidgetLoaded = true;

    // ==== SETTINGS (toggle) ====
    const PRECHAT_ENABLED = false; // ⛔ false => name/email never asked
    const AUTO_GREETING = "Hello! Adan Construction AI Agent — how can I help you today?";

    // Load font resource - using Poppins for a fresh look
    const fontElement = document.createElement('link');
    fontElement.rel = 'stylesheet';
    fontElement.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontElement);

    // Apply widget styles
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        .chat-assist-widget {
            --chat-color-primary: var(--chat-widget-primary, #10b981);
            --chat-color-secondary: var(--chat-widget-secondary, #059669);
            --chat-color-tertiary: var(--chat-widget-tertiary, #047857);
            --chat-color-light: var(--chat-widget-light, #d1fae5);
            --chat-color-surface: var(--chat-widget-surface, #ffffff);
            --chat-color-text: var(--chat-widget-text, #1f2937);
            --chat-color-text-light: var(--chat-widget-text-light, #6b7280);
            --chat-color-border: var(--chat-widget-border, #e5e7eb);
            --chat-shadow-sm: 0 1px 3px rgba(16, 185, 129, 0.1);
            --chat-shadow-md: 0 4px 6px rgba(16, 185, 129, 0.15);
            --chat-shadow-lg: 0 10px 15px rgba(16, 185, 129, 0.2);
            --chat-radius-sm: 8px;
            --chat-radius-md: 12px;
            --chat-radius-lg: 20px;
            --chat-radius-full: 9999px;
            --chat-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Poppins', sans-serif;
        }

        .chat-assist-widget .chat-window {
            position: fixed;
            bottom: 90px;
            z-index: 1000;
            width: 380px;
            height: 580px;
            background: var(--chat-color-surface);
            border-radius: var(--chat-radius-lg);
            box-shadow: var(--chat-shadow-lg);
            border: 1px solid var(--chat-color-light);
            overflow: hidden;
            display: none;
            flex-direction: column;
            transition: var(--chat-transition);
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        .chat-assist-widget .chat-window.right-side { right: 20px; }
        .chat-assist-widget .chat-window.left-side { left: 20px; }
        .chat-assist-widget .chat-window.visible { display: flex; opacity: 1; transform: translateY(0) scale(1); }

        .chat-assist-widget .chat-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white;
            position: relative;
        }
        .chat-assist-widget .chat-header-logo {
            width: 32px; height: 32px; border-radius: var(--chat-radius-sm);
            object-fit: contain; background: white; padding: 4px;
        }
        .chat-assist-widget .chat-header-title { font-size: 16px; font-weight: 600; color: white; }
        .chat-assist-widget .chat-close-btn {
            position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
            background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 4px;
            display: flex; align-items: center; justify-content: center; transition: var(--chat-transition);
            font-size: 18px; border-radius: var(--chat-radius-full); width: 28px; height: 28px;
        }
        .chat-assist-widget .chat-close-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-50%) scale(1.1); }

        .chat-assist-widget .chat-welcome {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            padding: 24px; text-align: center; width: 100%; max-width: 320px;
        }
        .chat-assist-widget .chat-welcome-title { font-size: 22px; font-weight: 700; color: var(--chat-color-text); margin-bottom: 24px; line-height: 1.3; }
        .chat-assist-widget .chat-start-btn {
            display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;
            padding: 14px 20px; background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white; border: none; border-radius: var(--chat-radius-md); cursor: pointer; font-size: 15px;
            transition: var(--chat-transition); font-weight: 600; font-family: inherit; margin-bottom: 16px; box-shadow: var(--chat-shadow-md);
        }
        .chat-assist-widget .chat-start-btn:hover { transform: translateY(-2px); box-shadow: var(--chat-shadow-lg); }
        .chat-assist-widget .chat-response-time { font-size: 14px; color: var(--chat-color-text-light); margin: 0; }

        .chat-assist-widget .chat-body { display: none; flex-direction: column; height: 100%; }
        .chat-assist-widget .chat-body.active { display: flex; }
        .chat-assist-widget .chat-messages {
            flex:1; overflow-y:auto; padding:20px; background:#f9fafb; display:flex; flex-direction:column; gap:12px;
        }
        .chat-assist-widget .chat-messages::-webkit-scrollbar { width:6px; }
        .chat-assist-widget .chat-messages::-webkit-scrollbar-track { background:transparent; }
        .chat-assist-widget .chat-messages::-webkit-scrollbar-thumb { background-color: rgba(16,185,129,0.3); border-radius: var(--chat-radius-full); }

        .chat-assist-widget .chat-bubble {
            padding: 14px 18px; border-radius: var(--chat-radius-md); max-width: 85%;
            word-wrap: break-word; font-size: 14px; line-height: 1.6; position: relative; white-space: pre-line;
        }
        .chat-assist-widget .chat-bubble.user-bubble {
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: var(--chat-shadow-sm);
        }
        .chat-assist-widget .chat-bubble.bot-bubble {
            background: white; color: var(--chat-color-text); align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: var(--chat-shadow-sm); border:1px solid var(--chat-color-light);
        }

        .chat-assist-widget .typing-indicator {
            display:flex; align-items:center; gap:4px; padding:14px 18px; background:white; border-radius:var(--chat-radius-md);
            border-bottom-left-radius:4px; max-width:80px; align-self:flex-start; box-shadow:var(--chat-shadow-sm); border:1px solid var(--chat-color-light);
        }
        .chat-assist-widget .typing-dot { width:8px; height:8px; background: var(--chat-color-primary); border-radius: var(--chat-radius-full); opacity:.7; animation: typingAnimation 1.4s infinite ease-in-out; }
        .chat-assist-widget .typing-dot:nth-child(2){ animation-delay:.2s } .chat-assist-widget .typing-dot:nth-child(3){ animation-delay:.4s }
        @keyframes typingAnimation { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }

        .chat-assist-widget .chat-controls { padding:16px; background:var(--chat-color-surface); border-top:1px solid var(--chat-color-light); display:flex; gap:10px; }
        .chat-assist-widget .chat-textarea {
            flex:1; padding:14px 16px; border:1px solid var(--chat-color-light); border-radius:var(--chat-radius-md);
            background:var(--chat-color-surface); color:var(--chat-color-text); resize:none; font-family:inherit; font-size:14px; line-height:1.5; max-height:120px; min-height:48px; transition: var(--chat-transition);
        }
        .chat-assist-widget .chat-textarea:focus { outline:none; border-color:var(--chat-color-primary); box-shadow:0 0 0 3px rgba(16,185,129,0.2); }
        .chat-assist-widget .chat-textarea::placeholder { color: var(--chat-color-text-light); }
        .chat-assist-widget .chat-submit {
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color:white; border:none; border-radius:var(--chat-radius-md); width:48px; height:48px; cursor:pointer; transition:var(--chat-transition);
            display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:var(--chat-shadow-sm);
        }
        .chat-assist-widget .chat-submit:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-md); }
        .chat-assist-widget .chat-submit svg { width:22px; height:22px; }

        .chat-assist-widget .chat-launcher {
            position: fixed; bottom: 20px; height: 56px; border-radius: var(--chat-radius-full);
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color:white; border:none; cursor:pointer; box-shadow: var(--chat-shadow-md); z-index:999; transition: var(--chat-transition);
            display:flex; align-items:center; padding:0 20px 0 16px; gap:8px;
        }
        .chat-assist-widget .chat-launcher.right-side { right: 20px; }
        .chat-assist-widget .chat-launcher.left-side { left: 20px; }
        .chat-assist-widget .chat-launcher:hover { transform: scale(1.05); box-shadow: var(--chat-shadow-lg); }
        .chat-assist-widget .chat-launcher svg { width:24px; height:24px; }
        .chat-assist-widget .chat-launcher-text { font-weight:600; font-size:15px; white-space:nowrap; }

        .chat-assist-widget .chat-footer { padding:10px; text-align:center; background:var(--chat-color-surface); border-top:1px solid var(--chat-color-light); }
        .chat-assist-widget .chat-footer-link { color: var(--chat-color-primary); text-decoration:none; font-size:12px; opacity:.85; transition: var(--chat-transition); font-family: inherit; }
        .chat-assist-widget .chat-footer-link:hover { opacity:1; text-decoration: underline; }

        /* Registration (kept for compatibility but hidden if PRECHAT_ENABLED=false) */
        .chat-assist-widget .user-registration {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            padding: 24px; text-align: center; width: 100%; max-width: 320px; display: none;
        }
        .chat-assist-widget .user-registration.active { display: block; }
        .chat-assist-widget .registration-title { font-size: 18px; font-weight: 600; color: var(--chat-color-text); margin-bottom: 16px; line-height: 1.3; }
        .chat-assist-widget .registration-form { display:flex; flex-direction:column; gap:12px; margin-bottom:16px; }
        .chat-assist-widget .form-field { display:flex; flex-direction:column; gap:4px; text-align:left; }
        .chat-assist-widget .form-label { font-size:14px; font-weight:500; color: var(--chat-color-text); }
        .chat-assist-widget .form-input { padding:12px 14px; border:1px solid var(--chat-color-border); border-radius: var(--chat-radius-md); font-family: inherit; font-size: 14px; transition: var(--chat-transition); }
        .chat-assist-widget .form-input:focus { outline:none; border-color:var(--chat-color-primary); box-shadow:0 0 0 3px rgba(16,185,129,.2); }
        .chat-assist-widget .form-input.error { border-color:#ef4444; }
        .chat-assist-widget .error-text { font-size:12px; color:#ef4444; margin-top:2px; }
        .chat-assist-widget .submit-registration {
            display:flex; align-items:center; justify-content:center; width:100%; padding:14px 20px;
            background: linear-gradient(135deg, var(--chat-color-primary) 0%, var(--chat-color-secondary) 100%);
            color:white; border:none; border-radius: var(--chat-radius-md); cursor:pointer; font-size:15px; transition: var(--chat-transition); font-weight:600; font-family:inherit; box-shadow: var(--chat-shadow-md);
        }
        .chat-assist-widget .submit-registration:hover { transform: translateY(-2px); box-shadow: var(--chat-shadow-lg); }
        .chat-assist-widget .submit-registration:disabled { opacity:.7; cursor:not-allowed; transform:none; }

        /* Suggested Reply Buttons */
        .chat-assist-widget .suggested-replies {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
            align-self: flex-start;
            max-width: 90%;
        }
        .chat-assist-widget .suggested-reply-btn {
            padding: 8px 12px;
            background: white;
            color: var(--chat-color-primary);
            border: 1.5px solid var(--chat-color-primary);
            border-radius: var(--chat-radius-md);
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
            font-family: inherit;
            transition: var(--chat-transition);
            box-shadow: var(--chat-shadow-sm);
            text-align: left;
            line-height: 1.4;
        }
        .chat-assist-widget .suggested-reply-btn:hover {
            background: var(--chat-color-primary);
            color: white;
            transform: translateY(-2px);
            box-shadow: var(--chat-shadow-md);
        }
        .chat-assist-widget .suggested-reply-btn:active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(widgetStyles);

    // Default configuration
    const defaultSettings = {
        webhook: { url: '', route: '' },
        branding: {
            logo: '',
            name: 'Adan Construction',
            welcomeText: 'We’re here to help!',
            responseTimeText: 'Typically replies in a few minutes',
            poweredBy: {
                text: 'Powered by Adan Construction',
                link: 'https://www.adanconstruction.net/'
            }
        },
        style: {
            primaryColor: '#10b981',
            secondaryColor: '#059669',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#1f2937'
        },
        suggestedQuestions: []
    };

    // Merge user settings with defaults (+ force purple -> green override if provided)
    const settings = window.ChatWidgetConfig ?
        {
            webhook: { ...defaultSettings.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultSettings.branding, ...window.ChatWidgetConfig.branding },
            style: {
                ...defaultSettings.style,
                ...window.ChatWidgetConfig.style,
                primaryColor: window.ChatWidgetConfig.style?.primaryColor === '#854fff' ? '#10b981' : (window.ChatWidgetConfig.style?.primaryColor || '#10b981'),
                secondaryColor: window.ChatWidgetConfig.style?.secondaryColor === '#6b3fd4' ? '#059669' : (window.ChatWidgetConfig.style?.secondaryColor || '#059669')
            },
            suggestedQuestions: window.ChatWidgetConfig.suggestedQuestions || defaultSettings.suggestedQuestions
        } : defaultSettings;

    // Session tracking
    let conversationId = '';
    let isWaitingForResponse = false;

    // Create widget DOM structure
    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'chat-assist-widget';

    // Apply custom colors
    widgetRoot.style.setProperty('--chat-widget-primary', settings.style.primaryColor);
    widgetRoot.style.setProperty('--chat-widget-secondary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-tertiary', settings.style.secondaryColor);
    widgetRoot.style.setProperty('--chat-widget-surface', settings.style.backgroundColor);
    widgetRoot.style.setProperty('--chat-widget-text', settings.style.fontColor);

    // Create chat panel
    const chatWindow = document.createElement('div');
    chatWindow.className = `chat-window ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;

    // Welcome header + screen
    const welcomeScreenHTML = `
        <div class="chat-header">
            <img class="chat-header-logo" src="${settings.branding.logo}" alt="${settings.branding.name}">
            <span class="chat-header-title">${settings.branding.name}</span>
            <button class="chat-close-btn" aria-label="Close chat">×</button>
        </div>
        <div class="chat-welcome">
            <h2 class="chat-welcome-title">${settings.branding.welcomeText}</h2>
            <button class="chat-start-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Start chatting
            </button>
            <p class="chat-response-time">${settings.branding.responseTimeText}</p>
        </div>
        <div class="user-registration">
            <h2 class="registration-title">Please enter your details to start chatting</h2>
            <form class="registration-form">
                <div class="form-field">
                    <label class="form-label" for="chat-user-name">Name</label>
                    <input type="text" id="chat-user-name" class="form-input" placeholder="Your name" required>
                    <div class="error-text" id="name-error"></div>
                </div>
                <div class="form-field">
                    <label class="form-label" for="chat-user-email">Email</label>
                    <input type="email" id="chat-user-email" class="form-input" placeholder="Your email address" required>
                    <div class="error-text" id="email-error"></div>
                </div>
                <button type="submit" class="submit-registration">Continue to Chat</button>
            </form>
        </div>
    `;

    // Main chat interface
    const chatInterfaceHTML = `
        <div class="chat-body">
            <div class="chat-messages"></div>
            <div class="chat-controls">

              <label class="chat-upload-btn" style="cursor:pointer; font-size:20px; padding:0 8px; display:flex; align-items:center;">
        📎
        <input type="file" class="chat-file-input" style="display:none">
           </label>

    <textarea class="chat-textarea" placeholder="Type your message here..." rows="1"></textarea>

    <button class="chat-submit" aria-label="Send message">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"></path>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
        </svg>
    </button>

</div>

</div>
            <div class="chat-footer">
                <a class="chat-footer-link" href="${settings.branding.poweredBy.link}" target="_blank" rel="noopener">${settings.branding.poweredBy.text}</a>
            </div>
        </div>
    `;

    chatWindow.innerHTML = welcomeScreenHTML + chatInterfaceHTML;

    // Toggle launcher
    const launchButton = document.createElement('button');
    launchButton.className = `chat-launcher ${settings.style.position === 'left' ? 'left-side' : 'right-side'}`;
    launchButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span class="chat-launcher-text">Need help?</span>`;

    // Mount
    widgetRoot.appendChild(chatWindow);
    widgetRoot.appendChild(launchButton);
    document.body.appendChild(widgetRoot);

    // DOM refs
    const startChatButton = chatWindow.querySelector('.chat-start-btn');
    const chatBody = chatWindow.querySelector('.chat-body');
    const messagesContainer = chatWindow.querySelector('.chat-messages');
    const messageTextarea = chatWindow.querySelector('.chat-textarea');
    const sendButton = chatWindow.querySelector('.chat-submit');

    // Registration elements (kept for compatibility)
    const registrationForm = chatWindow.querySelector('.registration-form');
    const userRegistration = chatWindow.querySelector('.user-registration');
    const chatWelcome = chatWindow.querySelector('.chat-welcome');
    const nameInput = chatWindow.querySelector('#chat-user-name');
    const emailInput = chatWindow.querySelector('#chat-user-email');
    const nameError = chatWindow.querySelector('#name-error');
    const emailError = chatWindow.querySelector('#email-error');

    // Utils
    function createSessionId(){ return (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2); }
    function createTypingIndicator(){
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        return indicator;
    }
    function linkifyText(text){
        const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        return text.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`);
    }

    // Parse [BUTTONS]...[/BUTTONS] format from n8n response
    function parseButtonsFromText(text) {
        const buttonRegex = /\[BUTTONS\]([\s\S]*?)\[\/BUTTONS\]/gi;
        const matches = [];
        let cleanText = text;
        let match;

        while ((match = buttonRegex.exec(text)) !== null) {
            const buttonContent = match[1].trim();
            // Split by newlines and filter out empty lines
            const buttons = buttonContent
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    // Remove bullet points (•, -, *, etc.) and leading/trailing whitespace
                    return line.replace(/^[•\-\*⁠\s]+/, '').trim();
                })
                .filter(line => line.length > 0);
            
            matches.push(buttons);
        }

        // Remove [BUTTONS]...[/BUTTONS] blocks from text
        cleanText = cleanText.replace(buttonRegex, '').trim();

        return {
            cleanText,
            buttonGroups: matches
        };
    }

    // Create suggested reply buttons
    function createSuggestedReplies(buttons) {
        if (!Array.isArray(buttons) || buttons.length === 0) return null;

        const container = document.createElement('div');
        container.className = 'suggested-replies';

        buttons.forEach(buttonText => {
            const button = document.createElement('button');
            button.className = 'suggested-reply-btn';
            button.textContent = buttonText;
            button.addEventListener('click', () => {
                submitMessage(buttonText);
                container.remove(); // Remove buttons after click
            });
            container.appendChild(button);
        });

        return container;
    }

    function showRegistrationForm(){
        chatWelcome.style.display = 'none';
        userRegistration.classList.add('active');
    }

    // === DIRECT START without registration ===
    function startChatWithoutRegistration(){
        chatWelcome.style.display = 'none';
        userRegistration.classList.remove('active');
        chatBody.classList.add('active');

        if (!conversationId) conversationId = createSessionId();

        // Local instant greeting
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-bubble bot-bubble';
        botMessage.textContent = AUTO_GREETING;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Optional: load/init session on backend
        if (settings.webhook?.url) {
            const initData = [{
                action: "loadPreviousSession",
                sessionId: conversationId,
                route: settings.webhook.route || "",
                metadata: {}
            }];
            fetch(settings.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initData)
            }).catch(()=>{});
        }
    }

    // Registration submit (kept if someone enables PRECHAT)
    async function handleRegistration(e){
        e.preventDefault();
        nameError.textContent=''; emailError.textContent='';
        nameInput.classList.remove('error'); emailInput.classList.remove('error');

        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        let ok = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!nameVal){ nameError.textContent='Please enter your name'; nameInput.classList.add('error'); ok=false; }
        if (!emailVal){ emailError.textContent='Please enter your email'; emailInput.classList.add('error'); ok=false; }
        else if (!emailRegex.test(emailVal)){ emailError.textContent='Please enter a valid email address'; emailInput.classList.add('error'); ok=false; }
        if (!ok) return;

        conversationId = createSessionId();

        // UI
        userRegistration.classList.remove('active');
        chatBody.classList.add('active');

        const typing = createTypingIndicator();
        messagesContainer.appendChild(typing);

        try{
            // load session
            const sessionData = [{
                action:"loadPreviousSession",
                sessionId:conversationId,
                route: settings.webhook.route,
                metadata: { userId: emailVal, userName: nameVal }
            }];
            const r1 = await fetch(settings.webhook.url, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify(sessionData)
            });
            await r1.json().catch(()=> ({}));

            // send user info as first message
            const userInfoData = {
                action:"sendMessage",
                sessionId: conversationId,
                route: settings.webhook.route,
                chatInput: `Name: ${nameVal}\nEmail: ${emailVal}`,
                metadata: { userId: emailVal, userName: nameVal, isUserInfo: true }
            };
            const r2 = await fetch(settings.webhook.url, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify(userInfoData)
            });
            const d2 = await r2.json().catch(()=> ({}));

            messagesContainer.removeChild(typing);

            // Parse response for buttons
            const messageText = Array.isArray(d2) ? d2[0]?.output || '' : d2?.output || '';
            const { cleanText, buttonGroups } = parseButtonsFromText(messageText);

            const botMessage = document.createElement('div');
            botMessage.className = 'chat-bubble bot-bubble';
            botMessage.innerHTML = linkifyText(cleanText || AUTO_GREETING);
            messagesContainer.appendChild(botMessage);

            // Add buttons if found
            if (buttonGroups.length > 0) {
                buttonGroups.forEach(buttons => {
                    const repliesContainer = createSuggestedReplies(buttons);
                    if (repliesContainer) {
                        messagesContainer.appendChild(repliesContainer);
                    }
                });
            }

            // Suggested questions (if any)
            if (Array.isArray(settings.suggestedQuestions) && settings.suggestedQuestions.length){
                const wrap = document.createElement('div'); wrap.className='suggested-questions';
                settings.suggestedQuestions.forEach(q=>{
                    const b = document.createElement('button');
                    b.className='suggested-question-btn'; b.textContent=q;
                    b.addEventListener('click', ()=>{ submitMessage(q); wrap.remove(); });
                    wrap.appendChild(b);
                });
                messagesContainer.appendChild(wrap);
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        }catch(err){
            console.error('Registration error:', err);
            if (typing && typing.parentNode) messagesContainer.removeChild(typing);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-bubble bot-bubble';
            errorMessage.textContent = "Sorry, I couldn't connect to the server. Please try again later.";
            messagesContainer.appendChild(errorMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Send a message to webhook
    async function submitMessage(messageText){
        if (isWaitingForResponse) return;
        isWaitingForResponse = true;

        // Since pre-chat is bypassed, don't send PII
        const nameVal = PRECHAT_ENABLED ? (nameInput?.value.trim() || "") : "";
        const emailVal = PRECHAT_ENABLED ? (emailInput?.value.trim() || "") : "";

        const requestData = {
            action: "sendMessage",
            sessionId: conversationId || (conversationId = createSessionId()),
            route: settings.webhook.route,
            chatInput: messageText,
            metadata: { userId: emailVal, userName: nameVal }
        };

        // UI: echo user message
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-bubble user-bubble';
        userMessage.textContent = messageText;
        messagesContainer.appendChild(userMessage);

        // typing
        const typing = createTypingIndicator();
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try{
            const resp = await fetch(settings.webhook.url, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify(requestData)
            });
            const data = await resp.json().catch(()=> ({}));

            if (typing && typing.parentNode) messagesContainer.removeChild(typing);

            // Parse response for buttons
            const responseText = Array.isArray(data) ? (data[0]?.output || '') : (data?.output || '');
            const { cleanText, buttonGroups } = parseButtonsFromText(responseText);

            const botMessage = document.createElement('div');
            botMessage.className = 'chat-bubble bot-bubble';
            botMessage.innerHTML = linkifyText(cleanText || "...");
            messagesContainer.appendChild(botMessage);

            // Add buttons if found
            if (buttonGroups.length > 0) {
                buttonGroups.forEach(buttons => {
                    const repliesContainer = createSuggestedReplies(buttons);
                    if (repliesContainer) {
                        messagesContainer.appendChild(repliesContainer);
                    }
                });
            }

            messagesContainer.scrollTop = messagesContainer.scrollHeight;

        }catch(err){
            console.error('Message submission error:', err);
            if (typing && typing.parentNode) messagesContainer.removeChild(typing);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'chat-bubble bot-bubble';
            errorMessage.textContent = "Sorry, I couldn't send your message. Please try again.";
            messagesContainer.appendChild(errorMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }finally{
            isWaitingForResponse = false;
        }
    }

    // Auto-resize textarea
    function autoResizeTextarea(){
        messageTextarea.style.height = 'auto';
        const h = Math.min(messageTextarea.scrollHeight, 120);
        messageTextarea.style.height = h + 'px';
    }

    // ===== Event listeners =====
    // Start button: either show reg form or direct start
    startChatButton.addEventListener('click', () => {
        if (PRECHAT_ENABLED) { showRegistrationForm(); }
        else { startChatWithoutRegistration(); }
    });

    // Registration form (only meaningful if pre-chat enabled)
    registrationForm.addEventListener('submit', handleRegistration);

    sendButton.addEventListener('click', () => {
        const messageText = messageTextarea.value.trim();
        if (messageText && !isWaitingForResponse) {
            submitMessage(messageText);
            messageTextarea.value = '';
            messageTextarea.style.height = 'auto';
        }
    });

    messageTextarea.addEventListener('input', autoResizeTextarea);
    messageTextarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const messageText = messageTextarea.value.trim();
            if (messageText && !isWaitingForResponse) {
                submitMessage(messageText);
                messageTextarea.value = '';
                messageTextarea.style.height = 'auto';
            }
        }
    });

    // First open → show chat + auto greeting (if prechat disabled)
    let firstOpen = true;
    launchButton.addEventListener('click', () => {
        chatWindow.classList.toggle('visible');
        if (chatWindow.classList.contains('visible')) {
            if (!PRECHAT_ENABLED && firstOpen) {
                startChatWithoutRegistration();
                firstOpen = false;
            }
        }
    });

    // Close button
    const closeButtons = chatWindow.querySelectorAll('.chat-close-btn');
    closeButtons.forEach(btn => btn.addEventListener('click', () => chatWindow.classList.remove('visible')));
})();
