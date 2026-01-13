import { getContext, extension_settings } from '../../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';

// --- 1. 常量与配置 ---
const SETTING_KEY = "the_huntress";

const EFFECTS_MAP = {
    "": "无特效",
    "fx-shake": "震动",
    "fx-nod": "摇晃",
    "fx-noir": "黑白",
    "fx-blur": "模糊",
    "fx-invert": "反色",
    "fx-alert": "警报"
};

const STICKER_MAP = [
    { words: ["?", "what", "什么", "哈", "confused", "不懂", "意图"], icon: "❓" },
    { words: ["angry", "怒", "滚", "fuck", "shit", "生气", "damn"], icon: "💢" },
    { words: ["love", "爱", "kiss", "喜欢", "心"], icon: "💗" },
    { words: ["...", "无语", "sweat", "呃", "尴尬"], icon: "💧" },
    { words: ["shy", "害羞", "blush", "脸红", "热"], icon: "////" }, 
    { words: ["idea", "懂", "哦", "ah","知道", "know"], icon: "💡" },
    { words: ["music", "哼", "sing", "歌", "听", "music", "listen"], icon: "🎵" },
    { words: ["sleep", "困", "晚安", "累", "睡觉", "sleep", "bed"], icon: "💤" }
];

const DEFAULT_TRIGGERS = [
    { words: ["爱", "love", "喜欢", "永远"], emoji: "💖" },
    { words: ["hug", "温暖", "睡"], emoji: "💤" },
    { words: ["xoxo", "抱抱", "亲亲", "mua", "kiss", "接吻"], emoji: "💋" },
    { words: ["mi manchi", "miss u", "miss you", "想你", "好想你", "星星"], emoji: "✨" },
    { words: ["烟花", "firework", "fireworks", "新年快乐", "happy new year", "庆典"], emoji: "🎊" },
    { words: ["hunt", "kill", "entity", "黎明杀机", "祭品", "挂钩"], emoji: "💀" },
    { words: ["开心", "happy", "lol", "哈哈", "笑死"], emoji: "🪼" },
    { words: ["难过", "sad", "cry", "呜呜", "emo", "伤心"], emoji: "🫧" },
    { words: ["生气", "angry", "滚", "mad", "怒", "烦"], emoji: "💢" },
    { words: ["酷", "cool", "帅", "厉害", "awesome", "强"], emoji: "😎" },
    { words: ["疑惑", "question", "what", "什么", "confused"], emoji: "❓" },
    { words: ["加油", "fighting", "努力"], emoji: "💪" },
    { words: ["ok", "好的", "收到", "yes", "deal", "没问题"], emoji: "👌" },
    { words: ["no", "不行", "拒绝", "reject", "不可以"], emoji: "✂️" },
    { words: ["花", "flower", "bloom", "美", "春天", "绽放"], emoji: "🌸" },
    { words: ["下雪", "snow", "冬天", "winter"], emoji: "❄️" },
    { words: ["火", "辣", "性感"], emoji: "🔥" },
    { words: ["wet", "rain", "storm", "下雨"], emoji: "🌧️" },
    { words: ["sparkle", "bling", "闪", "光", "希望", "hope"], emoji: "🌟" },
];

// --- 2. 设置管理 ---
function loadSettings() {
    if (!extension_settings[SETTING_KEY]) {
        extension_settings[SETTING_KEY] = {
            customSlots: Array.from({ length: 10 }, () => ({ words: "", emoji: "", effect: "" }))
        };
    }
    return extension_settings[SETTING_KEY];
}

function saveSettings() {
    saveSettingsDebounced();
    console.log("[The Huntress] 设置已更新并保存");
}

// --- 3. UI 构建 ---
function buildUI() {
    const settings = loadSettings();
    const $settingsContainer = $("#extensions_settings");

    $settingsContainer.find(".the-huntress-settings").remove();

    const styleBlock = `
    <style>
        .huntress-wrapper { padding: 5px; }
        .huntress-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; gap: 5px; }
        
        .huntress-input-words { flex-grow: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--SmartThemeBorderColor); border-radius: 4px; padding: 5px; color: var(--SmartThemeBodyColor); }
        .huntress-input-emoji { text-align: center; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--SmartThemeBorderColor); border-radius: 4px; padding: 5px; color: var(--SmartThemeBodyColor); }
        .huntress-select-effect { background: rgba(0,0,0,0.3); color: var(--SmartThemeBodyColor); border: 1px solid var(--SmartThemeBorderColor); border-radius: 4px; padding: 5px; }
        
        .huntress-input-words:focus, .huntress-input-emoji:focus, .huntress-select-effect:focus { border-color: var(--SmartThemeQuoteColor); outline: none; }
        .huntress-label-hint { font-size: 0.8em; opacity: 0.6; margin-bottom: 8px; display: block;}

        /* --- 特效 CSS 定义 --- */
        @keyframes fx-shake-hard {
            0% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-2px, -2px) rotate(-1deg); }
            30% { transform: translate(4px, 4px) rotate(1deg); }
            50% { transform: translate(-2px, 2px) rotate(-1deg); }
            70% { transform: translate(4px, -2px) rotate(1deg); }
            90% { transform: translate(-2px, 0) rotate(0deg); }
            100% { transform: translate(0, 0) rotate(0); }
        }
        .fx-shake { animation: fx-shake-hard 0.4s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes fx-wobble {
            0%, 100% { transform: translateX(0%); transform-origin: 50% 50%; }
            15% { transform: translateX(-6px) rotate(-3deg); }
            30% { transform: translateX(4px) rotate(2deg); }
            45% { transform: translateX(-3px) rotate(-1.2deg); }
            60% { transform: translateX(2px) rotate(0.6deg); }
            75% { transform: translateX(-1px) rotate(-0.3deg); }
        }
        .fx-nod { animation: fx-wobble 0.8s ease-in-out; }

        .fx-noir { filter: grayscale(100%) contrast(1.2) !important; transition: filter 1s; }
        .fx-blur { filter: blur(3px) !important; transition: filter 0.5s; }
        .fx-invert { filter: invert(100%) !important; transition: filter 0.2s; }

        @keyframes fx-flash-anim {
            0% { box-shadow: inset 0 0 0 0 rgba(255,0,0,0); }
            20% { box-shadow: inset 0 0 100px 20px rgba(220, 20, 60, 0.6); }
            100% { box-shadow: inset 0 0 0 0 rgba(255,0,0,0); }
        }
        .fx-alert { position: relative; }
        .fx-alert::after {
            content: " "; display: block; position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            pointer-events: none; z-index: 99999;
            animation: fx-flash-anim 1.2s ease-out;
        }

        /* --- 头像贴纸 CSS --- */
        .huntress-sticker {
            position: absolute;
            top: -5px; right: -5px; 
            font-size: 24px;
            z-index: 100;
            cursor: pointer;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
            animation: sticker-bounce 2s infinite ease-in-out;
            user-select: none;
            transition: transform 0.1s;
        }
        .huntress-sticker:hover { transform: scale(1.2); }
        .huntress-sticker:active { transform: scale(0.9); }

        @keyframes sticker-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }

        /* 贴纸消失特效 (Poof) */
        @keyframes sticker-poof {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(2); opacity: 0; }
        }
        .sticker-poofing {
            animation: sticker-poof 0.3s ease-out forwards;
            pointer-events: none;
        }
    </style>
    `;

    function createSelectOptions(currentValue) {
        return Object.entries(EFFECTS_MAP).map(([cssClass, name]) => {
            const isSelected = currentValue === cssClass ? "selected" : "";
            return `<option value="${cssClass}" ${isSelected}>${name}</option>`;
        }).join('');
    }

    let inputRowsHtml = '';
    for (let i = 0; i < 10; i++) {
        const slot = settings.customSlots[i] || { words: "", emoji: "", effect: "" };
        inputRowsHtml += `
        <div class="huntress-row">
            <input type="text" class="huntress-input-words" style="width: 50%;" data-idx="${i}" placeholder="关键词..." value="${slot.words}">
            <input type="text" class="huntress-input-emoji" style="width: 15%;" data-idx="${i}" placeholder="🪓" value="${slot.emoji}">
            <select class="huntress-select-effect" style="width: 30%;" data-idx="${i}">
                ${createSelectOptions(slot.effect)}
            </select>
        </div>
        `;
    }

    const html = `
    ${styleBlock}
    <div class="the-huntress-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🪓 The Huntress</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content huntress-wrapper">
                <span class="huntress-label-hint">* 支持中英逗号分隔</span>
                ${inputRowsHtml}
            </div>
        </div>
    </div>
    `;

    $settingsContainer.append(html);

    $(".huntress-input-words, .huntress-input-emoji, .huntress-select-effect").on('input change', function () {
        const idx = $(this).data('idx');
        const parentRow = $(this).closest('.huntress-row');
        
        const wordsVal = parentRow.find('.huntress-input-words').val();
        const emojiVal = parentRow.find('.huntress-input-emoji').val();
        const effectVal = parentRow.find('.huntress-select-effect').val();

        extension_settings[SETTING_KEY].customSlots[idx] = {
            words: wordsVal,
            emoji: emojiVal,
            effect: effectVal
        };
        saveSettings();
    });
}

// --- 4. 动画效果逻辑 (Emoji雨) ---
const styleId = 'huntress-particle-style';
if (!$(`#${styleId}`).length) {
    const cssStyle = `
    @keyframes floatUp {
        0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
    }
    .huntress-particle {
        position: fixed;
        top: 0; left: 0;
        pointer-events: none; 
        z-index: 9999;
        font-size: 2rem;
        will-change: transform, opacity;
        text-shadow: 0 0 5px rgba(0,0,0,0.5);
    }
    `;
    $('head').append(`<style id="${styleId}">${cssStyle}</style>`);
}

function spawnEmojiRain(emoji) {
    const particleCount = 20;
    const container = $('body');

    for (let i = 0; i < particleCount; i++) {
        const $el = $(`<div class="huntress-particle">${emoji}</div>`);
        const startLeft = Math.random() * 100;
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 2;

        $el.css({
            left: `${startLeft}vw`,
            animation: `floatUp ${duration}s ease-in ${delay}s forwards`,
            fontSize: `${1.5 + Math.random()}rem`
        });

        container.append($el);
        setTimeout(() => $el.remove(), (duration + delay) * 1000);
    }
}

// --- 5. 头像贴纸逻辑 ---
function attachSticker(text) {
    let matchedIcon = null;
    for (const sticker of STICKER_MAP) {
        if (sticker.words.some(word => text.includes(word.toLowerCase()))) {
            matchedIcon = sticker.icon;
            break; 
        }
    }
    if (!matchedIcon) return;

    const $lastMsg = $('.mes').last();
    if ($lastMsg.hasClass('is_user')) return; 

    const $avatarContainer = $lastMsg.find('.avatar'); 
    
    if ($avatarContainer.length) {
        console.log(`[The Huntress] Attaching sticker ${matchedIcon} to avatar.`);
        
        if ($avatarContainer.css('position') === 'static') {
            $avatarContainer.css('position', 'relative');
        }

        $avatarContainer.find('.huntress-sticker').remove();

        const $sticker = $(`<div class="huntress-sticker" title="点击消除">${matchedIcon}</div>`);
        
        $sticker.on('click', function(e) {
            e.stopPropagation(); 
            $(this).addClass('sticker-poofing'); 
            setTimeout(() => $(this).remove(), 300); 
        });

        $avatarContainer.append($sticker);
    }
}

// --- 6. 核心触发逻辑 ---
function checkResonance() {
    const context = getContext();
    const chat = context.chat;
    if (!chat || chat.length === 0) return;

    const lastMsg = chat[chat.length - 1];
    if (!lastMsg.mes) return;

    const currentText = lastMsg.mes.toLowerCase();
    const settings = loadSettings();

    attachSticker(currentText);

    const validCustomSlots = settings.customSlots.filter(s => s.words);
    let activeEmojis = [];
    let activeEffects = []; 

    for (const slot of validCustomSlots) {
        const keywords = slot.words.split(/[,，]/).map(w => w.trim()).filter(w => w);
        const isHit = keywords.some(word => currentText.includes(word.toLowerCase()));

        if (isHit) {
            if (slot.emoji) activeEmojis.push(slot.emoji);
            if (slot.effect) activeEffects.push(slot.effect);
        }
    }

    for (const trigger of DEFAULT_TRIGGERS) {
        const isHit = trigger.words.some(word => currentText.includes(word.toLowerCase()));
        if (isHit) {
            activeEmojis.push(trigger.emoji);
        }
    }

    const finalEmojis = [...new Set(activeEmojis)].slice(0, 2);
    if (finalEmojis.length > 0) {
        finalEmojis.forEach(emoji => spawnEmojiRain(emoji));
    }

    if (activeEffects.length > 0) {
        const effectClass = activeEffects[0];
        const $target = $('#app').length ? $('#app') : $('body');

        const allEffects = Object.keys(EFFECTS_MAP).filter(k => k !== "");
        $target.removeClass(allEffects.join(' '));
        void $target[0].offsetWidth;
        $target.addClass(effectClass);

        setTimeout(() => {
            $target.removeClass(effectClass);
        }, 1200);
    }
}

// --- 7. 初始化 ---
jQuery(async () => {
    buildUI();
    eventSource.on(event_types.MESSAGE_RECEIVED, checkResonance);
    console.log("[The Huntress 🪓] 飞斧蓄力。");
});
