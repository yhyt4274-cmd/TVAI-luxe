// TVAI Smart Composition Engine
async function generateAIContent() {
    const prompt = document.getElementById('ai-prompt').value.trim();
    const tone = document.getElementById('ai-tone').value;
    const lang = document.getElementById('ai-lang').value;
    const btn = document.getElementById('ai-generate-btn');

    if (!prompt) {
        alert('الرجاء كتابة الفكرة الأساسية للرسالة.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">جاري الصياغة الملكية عبر TVAI...</span>`;

    // Simulate AI Generation / Connect with TVAI Helper
    setTimeout(() => {
        let resultText = "";
        if (lang === 'ar') {
            if (tone === 'royal') {
                resultText = `صاحب السعادة والسمو،\n\nنود أن نعرب لكم عن خالص التقدير والامتنان. بالإشارة إلى موضوع "${prompt}"، يشرفنا إفادتكم بأننا نولي هذا الأمر بالغ الاهتمام، ونتطلع إلى تعزيز أواصر التعاون المشترك بما يخدم المصالح المتبادلة بين ديواننا الموقر ومؤسستكم الموقرة.\n\nوتفضلوا بقبول فائق الاحترام والتقدير،\nديوان TVAI Luxe`;
            } else if (tone === 'poetic') {
                resultText = `تحية تليق بمقامكم الرفيع،\n\nكأنما الحروف تصطف خجلاً لتخاطب فخامتكم. نسطر هذه الكلمات لنعبر عن رغبتنا الصادقة في مد جسور التواصل الفكري والعملي بشأن "${prompt}". نأمل أن تجد كلماتنا هذه صدىً طيباً في قلوبكم النبيلة.\n\nدمتم في رعاية الله وحفظه.`;
            } else {
                resultText = `السلام عليكم ورحمة الله وبركاته،\n\nبخصوص "${prompt}"، نود إعلامكم بأن العمل يسير وفق الخطة المحددة وبأعلى معايير الجودة الرقمية. سنوافيكم بكافة التحديثات فور صدورها.\n\nتحياتنا،\nفريق العمل`;
            }
        } else {
            resultText = `Your Excellency,\n\nWe convey our highest compliments. Regarding "${prompt}", we are honored to propose a strategic collaboration that aligns with your prestigious standards. We look forward to establishing a prosperous relationship.\n\nSincerely,\nTVAI Luxe Suite`;
        }

        document.getElementById('ai-result-text').value = resultText;
        document.getElementById('ai-result-container').classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i><span>توليد الصياغة الملكية</span>`;
        lucide.createIcons();
    }, 1500);
}