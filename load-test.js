import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 500 },    // تسخين سريع
    { duration: '30s', target: 10000 },  // الوصول إلى 10 آلاف
    { duration: '30s', target: 15000 },  // الارتفاع إلى 15 ألف
    { duration: '30s', target: 20000 },  // تحدي الـ 20 ألف زائر في نفس اللحظة!
    { duration: '10s', target: 0 },      // تبريد وإغلاق الاتصالات
  ],
};

export default function () {
  // سنقوم بضرب الصفحة الرئيسية للمتجر
  const res = http.get('http://localhost:3001/');
  
  // نتحقق من أن الموقع رد بنجاح (الكود 200) ولم ينهار (الكود 500)
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  // ينتظر الزائر ثانية واحدة قبل عمل أي تحديث آخر
  sleep(1);
}
