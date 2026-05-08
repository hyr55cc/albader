// ============================================
// التقويم الهجري - حسابات يدوية دقيقة
// ============================================

const HIJRI_MONTHS = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const GREGORIAN_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// تحويل ميلادي إلى هجري (تقريب دقيق)
function gregorianToHijri(gYear, gMonth, gDay) {
    const jd = gregorianToJulian(gYear, gMonth, gDay);
    const hijriJD = jd - 1948440;
    const year = Math.floor((hijriJD - 1) / 354.367);
    const remainder = hijriJD - 1 - (year * 354.367);
    const month = Math.floor(remainder / 29.5);
    const day = Math.floor(remainder - (month * 29.5)) + 1;

    return {
        year: year + 1389,
        month: Math.min(month, 11),
        day: Math.max(1, Math.min(day, 30))
    };
}

// تحويل هجري إلى ميلادي
function hijriToGregorian(hYear, hMonth, hDay) {
    const days = (hYear - 1389) * 354.367 + hMonth * 29.5 + hDay;
    const jd = days + 1948440;
    return julianToGregorian(jd);
}

function gregorianToJulian(year, month, day) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function julianToGregorian(jd) {
    const z = Math.floor(jd + 0.5);
    const w = Math.floor((z - 1867216.25) / 36524.25);
    const x = Math.floor(w / 4);
    const a = z + 1 + w - x;
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    return { year, month, day };
}

// أيام الشهر الهجري
function hijriDaysInMonth(hYear, hMonth) {
    const oddMonths = [0, 2, 4, 6, 8, 10];
    return oddMonths.includes(hMonth) ? 30 : 29;
}

// ============================================
// متغيرات التطبيق
// ============================================

let currentGregorian = new Date();
let appointments = JSON.parse(localStorage.getItem('calendar_appointments')) || [];

// ============================================
// عرض التواريخ في الهيدر
// ============================================

function updateHeaderDates() {
    const now = new Date();
    const hijri = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());

    document.getElementById('hijriDate').textContent = 
        hijri.day + ' ' + HIJRI_MONTHS[hijri.month] + ' ' + hijri.year + ' هـ';

    document.getElementById('gregorianDate').textContent = 
        now.getDate() + ' ' + GREGORIAN_MONTHS[now.getMonth()] + ' ' + now.getFullYear() + ' م';
}

// ============================================
// عرض التقويم الهجري
// ============================================

function renderHijriCalendar() {
    const gYear = currentGregorian.getFullYear();
    const gMonth = currentGregorian.getMonth();

    const firstDay = new Date(gYear, gMonth, 1);
    const lastDay = new Date(gYear, gMonth + 1, 0);

    const hijriFirst = gregorianToHijri(gYear, gMonth + 1, 1);
    const mainHijriMonth = hijriFirst.month;
    const mainHijriYear = hijriFirst.year;

    const daysInHijriMonth = hijriDaysInMonth(mainHijriYear, mainHijriMonth);

    let hijriStartGreg = 1;
    for (let d = 1; d <= 31; d++) {
        const test = new Date(gYear, gMonth, d);
        if (test.getMonth() !== gMonth) break;
        const h = gregorianToHijri(gYear, gMonth + 1, d);
        if (h.month === mainHijriMonth && h.day === 1) {
            hijriStartGreg = d;
            break;
        }
    }

    const startDate = new Date(gYear, gMonth, hijriStartGreg);
    const startDayOfWeek = startDate.getDay();

    let html = '';
    DAYS.forEach(function(day) {
        html += '<div class="day-header">' + day + '</div>';
    });

    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div class="day-cell other-month"></div>';
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === gMonth && today.getFullYear() === gYear;

    for (let day = 1; day <= daysInHijriMonth; day++) {
        const gregDay = hijriStartGreg + day - 1;
        const gregDate = new Date(gYear, gMonth, gregDay);
        const actualGreg = gregDate.getMonth() === gMonth ? gregDay : '';

        const isToday = isCurrentMonth && checkIfTodayHijri(mainHijriYear, mainHijriMonth, day);
        const hasApp = hasAppointmentDate(gregDate);

        html += '<div class="day-cell ' + (isToday ? 'today ' : '') + (hasApp ? 'has-appointment' : '') + '" ' +
                'onclick="selectDate('' + formatDate(gregDate) + '')">' +
                '<span>' + day + '</span>' +
                '<span class="dual-date">' + (actualGreg || '') + '</span>' +
                '</div>';
    }

    document.getElementById('hijriCalendar').innerHTML = html;

    document.getElementById('currentMonthYear').textContent = 
        HIJRI_MONTHS[mainHijriMonth] + ' ' + mainHijriYear + ' هـ - ' + GREGORIAN_MONTHS[gMonth] + ' ' + gYear + ' م';
}

function checkIfTodayHijri(hYear, hMonth, hDay) {
    const today = new Date();
    const todayHijri = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return todayHijri.year === hYear && todayHijri.month === hMonth && todayHijri.day === hDay;
}

// ============================================
// عرض التقويم الميلادي
// ============================================

function renderGregorianCalendar() {
    const year = currentGregorian.getFullYear();
    const month = currentGregorian.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    let html = '';
    DAYS.forEach(function(day) {
        html += '<div class="day-header">' + day + '</div>';
    });

    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div class="day-cell other-month"></div>';
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const hijri = gregorianToHijri(year, month + 1, day);
        const isToday = isCurrentMonth && today.getDate() === day;
        const hasApp = hasAppointmentDate(date);

        html += '<div class="day-cell ' + (isToday ? 'today ' : '') + (hasApp ? 'has-appointment' : '') + '" ' +
                'onclick="selectDate('' + formatDate(date) + '')">' +
                '<span>' + day + '</span>' +
                '<span class="dual-date">' + hijri.day + '/' + (hijri.month + 1) + '</span>' +
                '</div>';
    }

    document.getElementById('gregorianCalendar').innerHTML = html;
}

// ============================================
// التنقل بين الأشهر
// ============================================

document.getElementById('prevMonth').addEventListener('click', function() {
    currentGregorian.setMonth(currentGregorian.getMonth() - 1);
    renderCalendars();
});

document.getElementById('nextMonth').addEventListener('click', function() {
    currentGregorian.setMonth(currentGregorian.getMonth() + 1);
    renderCalendars();
});

function renderCalendars() {
    renderHijriCalendar();
    renderGregorianCalendar();
}

// ============================================
// إدارة المواعيد
// ============================================

function formatDate(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function hasAppointmentDate(date) {
    const dateStr = formatDate(date);
    return appointments.some(function(app) { return app.date === dateStr; });
}

function addAppointment() {
    const title = document.getElementById('appTitle').value.trim();
    const date = document.getElementById('appDate').value;
    const time = document.getElementById('appTime').value;

    if (!title || !date || !time) {
        showNotification('الرجاء ملء جميع الحقول!');
        return;
    }

    const appointment = {
        id: Date.now(),
        title: title,
        date: date,
        time: time,
        notified: false
    };

    appointments.push(appointment);
    saveAppointments();

    document.getElementById('appTitle').value = '';
    document.getElementById('appDate').value = '';
    document.getElementById('appTime').value = '';

    renderAppointments();
    renderCalendars();

    showNotification('تم إضافة الموعد بنجاح!');

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function deleteAppointment(id) {
    appointments = appointments.filter(function(app) { return app.id !== id; });
    saveAppointments();
    renderAppointments();
    renderCalendars();
}

function saveAppointments() {
    localStorage.setItem('calendar_appointments', JSON.stringify(appointments));
}

function renderAppointments() {
    const list = document.getElementById('appointmentsList');
    const now = new Date();

    if (appointments.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.7;">لا توجد مواعيد</p>';
        return;
    }

    const sorted = appointments.slice().sort(function(a, b) {
        return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
    });

    list.innerHTML = sorted.map(function(app) {
        const appDateTime = new Date(app.date + 'T' + app.time);
        const diffHours = (appDateTime - now) / (1000 * 60 * 60);
        const isUpcoming = diffHours <= 24 && diffHours > 0;
        const isPast = appDateTime < now;

        return '<div class="appointment-item ' + (isUpcoming ? 'upcoming' : '') + '" style="' + (isPast ? 'opacity:0.5;' : '') + '">' +
               '<div><strong>' + app.title + '</strong>' +
               '<div class="time">' + app.date + ' | ' + app.time + '</div></div>' +
               '<button class="delete-btn" onclick="deleteAppointment(' + app.id + ')">حذف</button>' +
               '</div>';
    }).join('');
}

function selectDate(dateStr) {
    document.getElementById('appDate').value = dateStr;
    document.getElementById('appTitle').focus();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// ============================================
// الإشعارات
// ============================================

function showNotification(text) {
    const notif = document.getElementById('notification');
    document.getElementById('notificationText').textContent = text;
    notif.classList.remove('hidden');

    setTimeout(function() {
        notif.classList.add('hidden');
    }, 4000);
}

function closeNotification() {
    document.getElementById('notification').classList.add('hidden');
}

function checkAppointments() {
    const now = new Date();

    appointments.forEach(function(app) {
        if (app.notified) return;

        const appDateTime = new Date(app.date + 'T' + app.time);
        const diffMinutes = (appDateTime - now) / (1000 * 60);

        if (diffMinutes <= 5 && diffMinutes > 0) {
            app.notified = true;
            saveAppointments();

            showNotification('موعد قريب: "' + app.title + '" بعد ' + Math.ceil(diffMinutes) + ' دقيقة!');

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('تذكير بالموعد', {
                    body: app.title + ' - الساعة ' + app.time,
                    icon: '📅'
                });
            }
        }
    });
}

// ============================================
// تهيئة
// ============================================

updateHeaderDates();
renderCalendars();
renderAppointments();
checkAppointments();

setInterval(function() {
    updateHeaderDates();
    checkAppointments();
}, 60000);
