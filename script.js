// ============================================
// التقويم الهجري - حسابات يدوية دقيقة
// ============================================

var HIJRI_MONTHS = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

var GREGORIAN_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

var DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// تحويل ميلادي إلى هجري
function gregorianToHijri(gYear, gMonth, gDay) {
    var jd = gregorianToJulian(gYear, gMonth, gDay);
    var hijriJD = jd - 1948440;
    var year = Math.floor((hijriJD - 1) / 354.367);
    var remainder = hijriJD - 1 - (year * 354.367);
    var month = Math.floor(remainder / 29.5);
    var day = Math.floor(remainder - (month * 29.5)) + 1;

    return {
        year: year + 1389,
        month: Math.min(month, 11),
        day: Math.max(1, Math.min(day, 30))
    };
}

function gregorianToJulian(year, month, day) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    var a = Math.floor(year / 100);
    var b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

// أيام الشهر الهجري
function hijriDaysInMonth(hYear, hMonth) {
    var oddMonths = [0, 2, 4, 6, 8, 10];
    return oddMonths.indexOf(hMonth) >= 0 ? 30 : 29;
}

// ============================================
// متغيرات التطبيق
// ============================================

var currentGregorian = new Date();
var appointments = [];

try {
    var stored = localStorage.getItem('calendar_appointments');
    if (stored) {
        appointments = JSON.parse(stored);
    }
} catch (e) {
    appointments = [];
}

// ============================================
// عرض التواريخ في الهيدر
// ============================================

function updateHeaderDates() {
    var now = new Date();
    var hijri = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());

    var hijriEl = document.getElementById('hijriDate');
    var gregEl = document.getElementById('gregorianDate');

    if (hijriEl) {
        hijriEl.textContent = hijri.day + ' ' + HIJRI_MONTHS[hijri.month] + ' ' + hijri.year + ' هـ';
    }
    if (gregEl) {
        gregEl.textContent = now.getDate() + ' ' + GREGORIAN_MONTHS[now.getMonth()] + ' ' + now.getFullYear() + ' م';
    }
}

// ============================================
// عرض التقويم الهجري
// ============================================

function renderHijriCalendar() {
    var gYear = currentGregorian.getFullYear();
    var gMonth = currentGregorian.getMonth();

    var hijriFirst = gregorianToHijri(gYear, gMonth + 1, 1);
    var mainHijriMonth = hijriFirst.month;
    var mainHijriYear = hijriFirst.year;

    var daysInHijriMonth = hijriDaysInMonth(mainHijriYear, mainHijriMonth);

    // نبحث عن أول يوم من الشهر الهجري في الشهر الميلادي الحالي
    var hijriStartGreg = 1;
    for (var d = 1; d <= 31; d++) {
        var test = new Date(gYear, gMonth, d);
        if (test.getMonth() !== gMonth) break;
        var h = gregorianToHijri(gYear, gMonth + 1, d);
        if (h.month === mainHijriMonth && h.day === 1) {
            hijriStartGreg = d;
            break;
        }
    }

    var startDate = new Date(gYear, gMonth, hijriStartGreg);
    var startDayOfWeek = startDate.getDay();

    var html = '';
    for (var i = 0; i < 7; i++) {
        html += '<div class="day-header">' + DAYS[i] + '</div>';
    }

    for (var i = 0; i < startDayOfWeek; i++) {
        html += '<div class="day-cell other-month"></div>';
    }

    var today = new Date();
    var isCurrentMonth = today.getMonth() === gMonth && today.getFullYear() === gYear;

    for (var day = 1; day <= daysInHijriMonth; day++) {
        var gregDay = hijriStartGreg + day - 1;
        var gregDate = new Date(gYear, gMonth, gregDay);
        var actualGreg = gregDate.getMonth() === gMonth ? gregDay : '';

        var isToday = isCurrentMonth && checkIfTodayHijri(mainHijriYear, mainHijriMonth, day);
        var hasApp = hasAppointmentDate(gregDate);

        var classes = 'day-cell';
        if (isToday) classes += ' today';
        if (hasApp) classes += ' has-appointment';

        html += '<div class="' + classes + '" onclick="selectDate('' + formatDate(gregDate) + '')">' +
                '<span>' + day + '</span>' +
                '<span class="dual-date">' + (actualGreg || '') + '</span>' +
                '</div>';
    }

    var hijriCalendar = document.getElementById('hijriCalendar');
    if (hijriCalendar) {
        hijriCalendar.innerHTML = html;
    }

    var titleEl = document.getElementById('currentMonthYear');
    if (titleEl) {
        titleEl.textContent = HIJRI_MONTHS[mainHijriMonth] + ' ' + mainHijriYear + ' هـ - ' + GREGORIAN_MONTHS[gMonth] + ' ' + gYear + ' م';
    }
}

function checkIfTodayHijri(hYear, hMonth, hDay) {
    var today = new Date();
    var todayHijri = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return todayHijri.year === hYear && todayHijri.month === hMonth && todayHijri.day === hDay;
}

// ============================================
// عرض التقويم الميلادي
// ============================================

function renderGregorianCalendar() {
    var year = currentGregorian.getFullYear();
    var month = currentGregorian.getMonth();

    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var daysInMonth = lastDay.getDate();
    var startDayOfWeek = firstDay.getDay();

    var html = '';
    for (var i = 0; i < 7; i++) {
        html += '<div class="day-header">' + DAYS[i] + '</div>';
    }

    for (var i = 0; i < startDayOfWeek; i++) {
        html += '<div class="day-cell other-month"></div>';
    }

    var today = new Date();
    var isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(year, month, day);
        var hijri = gregorianToHijri(year, month + 1, day);
        var isToday = isCurrentMonth && today.getDate() === day;
        var hasApp = hasAppointmentDate(date);

        var classes = 'day-cell';
        if (isToday) classes += ' today';
        if (hasApp) classes += ' has-appointment';

        html += '<div class="' + classes + '" onclick="selectDate('' + formatDate(date) + '')">' +
                '<span>' + day + '</span>' +
                '<span class="dual-date">' + hijri.day + '/' + (hijri.month + 1) + '</span>' +
                '</div>';
    }

    var gregorianCalendar = document.getElementById('gregorianCalendar');
    if (gregorianCalendar) {
        gregorianCalendar.innerHTML = html;
    }
}

// ============================================
// التنقل بين الأشهر
// ============================================

function prevMonth() {
    currentGregorian.setMonth(currentGregorian.getMonth() - 1);
    renderCalendars();
}

function nextMonth() {
    currentGregorian.setMonth(currentGregorian.getMonth() + 1);
    renderCalendars();
}

function renderCalendars() {
    renderHijriCalendar();
    renderGregorianCalendar();
}

// ============================================
// إدارة المواعيد
// ============================================

function formatDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function hasAppointmentDate(date) {
    var dateStr = formatDate(date);
    for (var i = 0; i < appointments.length; i++) {
        if (appointments[i].date === dateStr) return true;
    }
    return false;
}

function addAppointment() {
    var title = document.getElementById('appTitle').value.trim();
    var date = document.getElementById('appDate').value;
    var time = document.getElementById('appTime').value;

    if (!title || !date || !time) {
        showNotification('الرجاء ملء جميع الحقول!');
        return;
    }

    var appointment = {
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
    var newApps = [];
    for (var i = 0; i < appointments.length; i++) {
        if (appointments[i].id !== id) {
            newApps.push(appointments[i]);
        }
    }
    appointments = newApps;
    saveAppointments();
    renderAppointments();
    renderCalendars();
}

function saveAppointments() {
    try {
        localStorage.setItem('calendar_appointments', JSON.stringify(appointments));
    } catch (e) {
        console.log('localStorage not available');
    }
}

function renderAppointments() {
    var list = document.getElementById('appointmentsList');
    if (!list) return;

    var now = new Date();

    if (appointments.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.7;">لا توجد مواعيد</p>';
        return;
    }

    var sorted = appointments.slice().sort(function(a, b) {
        return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
    });

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
        var app = sorted[i];
        var appDateTime = new Date(app.date + 'T' + app.time);
        var diffHours = (appDateTime - now) / (1000 * 60 * 60);
        var isUpcoming = diffHours <= 24 && diffHours > 0;
        var isPast = appDateTime < now;

        var itemClass = 'appointment-item';
        if (isUpcoming) itemClass += ' upcoming';

        html += '<div class="' + itemClass + '" style="' + (isPast ? 'opacity:0.5;' : '') + '">' +
                '<div><strong>' + app.title + '</strong>' +
                '<div class="time">' + app.date + ' | ' + app.time + '</div></div>' +
                '<button class="delete-btn" onclick="deleteAppointment(' + app.id + ')">حذف</button>' +
                '</div>';
    }

    list.innerHTML = html;
}

function selectDate(dateStr) {
    var appDate = document.getElementById('appDate');
    var appTitle = document.getElementById('appTitle');
    if (appDate) appDate.value = dateStr;
    if (appTitle) appTitle.focus();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// ============================================
// الإشعارات
// ============================================

function showNotification(text) {
    var notif = document.getElementById('notification');
    var notifText = document.getElementById('notificationText');
    if (notif && notifText) {
        notifText.textContent = text;
        notif.style.display = 'block';

        setTimeout(function() {
            notif.style.display = 'none';
        }, 4000);
    }
}

function closeNotification() {
    var notif = document.getElementById('notification');
    if (notif) notif.style.display = 'none';
}

function checkAppointments() {
    var now = new Date();

    for (var i = 0; i < appointments.length; i++) {
        var app = appointments[i];
        if (app.notified) continue;

        var appDateTime = new Date(app.date + 'T' + app.time);
        var diffMinutes = (appDateTime - now) / (1000 * 60);

        if (diffMinutes <= 5 && diffMinutes > 0) {
            app.notified = true;
            saveAppointments();

            showNotification('موعد قريب: "' + app.title + '" بعد ' + Math.ceil(diffMinutes) + ' دقيقة!');

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('تذكير بالموعد', {
                    body: app.title + ' - الساعة ' + app.time
                });
            }
        }
    }
}

// ============================================
// تهيئة عند تحميل الصفحة
// ============================================

function init() {
    updateHeaderDates();
    renderCalendars();
    renderAppointments();
    checkAppointments();

    // ربط الأزرار
    var prevBtn = document.getElementById('prevMonth');
    var nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.addEventListener('click', prevMonth);
    if (nextBtn) nextBtn.addEventListener('click', nextMonth);

    // تحديث كل دقيقة
    setInterval(function() {
        updateHeaderDates();
        checkAppointments();
    }, 60000);
}

// تأكد من اكتمال DOM قبل التهيئة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
