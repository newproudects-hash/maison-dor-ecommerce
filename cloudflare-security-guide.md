# 🛡️ إعدادات الحماية المطلقة في Cloudflare (Edge Security)

لتطبيق أقصى درجات الحماية على موقع **Maison D'Or** وإحباط الهجمات قبل أن تصل إلى سيرفرات Vercel، يجب تطبيق الإعدادات التالية في لوحة تحكم Cloudflare.

## 1. إعدادات جدار الحماية (WAF Rules)
اذهب إلى **Security > WAF > Custom rules** وأنشئ القواعد التالية:

### القاعدة الأولى: حظر مسار الأدمن المزيف (Honeytoken) 🍯
هذه القاعدة تحظر أي شخص يقع في فخ الـ Honeytoken الذي برمجناه.
- **Field:** URI Path
- **Operator:** equals
- **Value:** `/api/admin/debug-auth`
- **Action:** Block

### القاعدة الثانية: حماية API الطلبات من الهجمات خارج الجزائر (اختياري)
بما أن التوصيل حصري في الجزائر، يمكننا تقييد الطلبات.
- **Expression:** `(http.request.uri.path contains "/api/orders" and ip.geoip.country ne "DZ")`
- **Action:** Managed Challenge (أو Block إذا كنت متأكداً).

## 2. إدارة البوتات (Bot Management)
اذهب إلى **Security > Bots**:
- قم بتفعيل **Bot Fight Mode**. سيرسل هذا التحديات (Challenges) لجميع البوتات المشبوهة، مما يمنع هجمات DDoS والـ Scraping (سرقة أسعار المنتجات وصورها).

## 3. الحد من الطلبات (Rate Limiting)
اذهب إلى **Security > WAF > Rate limiting rules**:
- **Rule Name:** Protect Orders API
- **If matching:** `URI Path equals "/api/orders"`
- **Requests:** `10` requests per `10 seconds`
- **Action:** Block (لمدة 1 ساعة)
*(تم دمج حظر أوتوماتيكي داخل Next.js مسبقاً، ولكن هذه القاعدة تمنع استنزاف موارد Vercel نهائياً).*

## 4. إعدادات الشبكة والتشفير (SSL/TLS & Network)
1. **SSL/TLS > Edge Certificates:**
   - **Minimum TLS Version:** اختر `TLS 1.3`.
   - **HTTP Strict Transport Security (HSTS):** تفعيل (Enable).
2. **SSL/TLS > Overview:**
   - **Encryption mode:** `Full (strict)`.

## 5. حماية الأدمن المتقدمة (Zero Trust Access) - الخطوة القصوى
اذهب إلى **Zero Trust > Access > Applications** وأضف تطبيقاً جديداً:
- **Application Path:** `maisondor.dz/admin`
- **Policies:** أضف سياسة `Allow` للبريد الإلكتروني الخاص بك فقط `(e.g., admin@maisondor.com)`.
- **النتيجة:** عندما تحاول الدخول إلى لوحة التحكم، سيطلب منك Cloudflare إدخال كود يصل إلى إيميلك الشخصي، قبل حتى أن يرى السيرفر طلبك، وبعدها يمكنك وضع كلمة السر في الموقع. (طبقة حماية ثنائية لا يمكن اختراقها).
