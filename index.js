import { eventSource, event_types,} from '../../../../script.js';
import {getContext} from '../../../extensions.js';

const TRIGGERS = [
    { words: ["爱", "love", "喜欢", "永远"], emoji: "💖" },
    { words: ["hug", "温暖", "睡"], emoji: "💤" },
    { words: ["xoxo", "抱抱", "亲亲", "mua", "kiss", "接吻"], emoji: "💋" },
    { words: ["mi manchi", "miss u", "miss you", "想你", "好想你", "星星"], emoji: "✨" },
    { words: ["烟花", "firework", "fireworks", "新年快乐", "happy new year", "庆典"], emoji: "🎊" },
    {words: ["hunt", "kill", "entity", "黎明杀机", "祭品", "挂钩"],emoji: "💀"},
    { words: ["开心", "happy", "lol", "哈哈",  "笑死"], emoji: "🪼" },
    { words: ["难过", "sad", "cry", "呜呜", "emo", "伤心"], emoji: "🫧" },
    { words: ["生气", "angry", "滚", "mad", "怒", "烦"], emoji: "💢" },
    { words: ["酷", "cool", "帅", "厉害", "awesome", "强"], emoji: "😎" },
    { words: ["疑惑", "question", "what", "什么",  "confused"], emoji: "❓" },
    { words: ["加油", "fighting", "努力"], emoji: "💪" },
    { words: ["ok", "好的", "收到", "yes", "deal", "没问题"], emoji: "👌" },
    { words: ["no", "不行", "拒绝", "reject", "不可以"], emoji: "✂️" },
    { words: ["花", "flower", "bloom", "美", "春天", "绽放"], emoji: "🌸" },
    { words: ["下雪", "snow", "冬天", "winter"], emoji: "❄️" },
    { words: ["火", "辣", "性感"], emoji: "🔥" },
    { words: ["wet", "rain", "storm", "下雨"], emoji: "🌧️" },
    { words: ["sparkle", "bling", "闪", "光", "希望", "hope"], emoji: "🌟" },
];

const cssStyle = `
@keyframes floatUp {
    0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
}
.boon-particle {
    position: fixed;
    top: 0; left: 0;
    pointer-events: none; 
    z-index: 9999;
    font-size: 2rem;
    will-change: transform, opacity;
}
`;
$('head').append(`<style>${cssStyle}</style>`);

function spawnEmojiRain(emoji) {
    const particleCount = 20; 
    const container = $('body');

    for (let i = 0; i < particleCount; i++) {
        const $el = $(`<div class="boon-particle">${emoji}</div>`);
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

const styleId = 'boon-particle-style';
if (!$(`#${styleId}`).length) {
    const cssStyle = `
    @keyframes floatUp {
        0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
    }
    .boon-particle {
        position: fixed;
        top: 0; left: 0;
        pointer-events: none; 
        z-index: 9999;
        font-size: 2rem;
        will-change: transform, opacity;
    }
    `;
    $('head').append(`<style id="${styleId}">${cssStyle}</style>`);
}

function checkResonance() {
    const context = getContext();
    const chat = context.chat;
    if (!chat || chat.length === 0) return;
    const lastMsg = chat[chat.length - 1]; 
    if (!lastMsg.mes) return;
    const currentText = lastMsg.mes.toLowerCase();
    for (const trigger of TRIGGERS) {
        const isHit = trigger.words.some(word => currentText.includes(word.toLowerCase()));
        
        if (isHit) {
            console.log(`[The Boon] Triggered: ${trigger.emoji} by text: "${currentText.substring(0, 20)}..."`);
            spawnEmojiRain(trigger.emoji);
        }
    }
}

jQuery(async () => {
    eventSource.on(event_types.MESSAGE_RECEIVED, checkResonance);
});

