const cycleData = [
    { start: "2021-08-05", end: "2021-08-08" },
    { start: "2021-09-07", end: "2021-09-11" },
    { start: "2021-10-05", end: "2021-10-10" },
    { start: "2021-11-05", end: "2021-11-10" },
    { start: "2021-12-15", end: "2021-12-21" },
    { start: "2022-01-14", end: "2022-01-18" },
    { start: "2022-02-15", end: "2022-02-19" },
    { start: "2022-03-18", end: "2022-03-22" },
    { start: "2022-04-20", end: "2022-04-24" },
    { start: "2022-05-18", end: "2022-05-21" },
    { start: "2022-06-13", end: "2022-06-17" },
    { start: "2022-07-11", end: "2022-07-15" },
    { start: "2022-08-11", end: "2022-08-16" },
    { start: "2022-09-09", end: "2022-09-14" },
    { start: "2022-10-10", end: "2022-10-14" },
    { start: "2022-11-11", end: "2022-11-15" },
    { start: "2022-12-08", end: "2022-12-13" },
    { start: "2023-01-10", end: "2023-01-14" },
    { start: "2023-02-04", end: "2023-02-09" },
    { start: "2023-03-05", end: "2023-03-08" },
    { start: "2023-04-02", end: "2023-04-07" },
    { start: "2023-04-29", end: "2023-05-03" },
    { start: "2023-05-29", end: "2023-06-02" },
    { start: "2023-06-27", end: "2023-07-01" },
    { start: "2023-07-26", end: "2023-07-31" },
    { start: "2023-08-23", end: "2023-08-29" },
    { start: "2023-09-22", end: "2023-09-26" },
    { start: "2023-10-21", end: "2023-10-25" },
    { start: "2023-11-17", end: "2023-11-21" },
    { start: "2024-12-21", end: "2024-12-26" },
    { start: "2025-01-19", end: "2025-01-23" },
    { start: "2025-02-23", end: "2025-02-28" },
    { start: "2025-03-24", end: "2025-03-29" },
    { start: "2025-04-19", end: "2025-04-23" },
    { start: "2025-05-15", end: "2025-05-20" },
    { start: "2025-06-12", end: "2025-06-17" },
    { start: "2025-07-07", end: "2025-07-12" },
    { start: "2025-08-05", end: "2025-08-10" },
    { start: "2025-09-01", end: "2025-09-06" },
    { start: "2025-09-28", end: "2025-10-02" },
    { start: "2025-10-21", end: "2025-10-26" },
    { start: "2025-11-17", end: "2025-11-21" },
    { start: "2026-01-08", end: "2026-01-13" },
    { start: "2026-01-30", end: "2026-02-03" },
    { start: "2026-02-26", end: "2026-03-03" },
    { start: "2026-03-26", end: "2026-03-31" },
    { start: "2026-04-19", end: "2026-04-24" }
];

function updateOnlineStatus() {
    const badge = document.getElementById('offline-badge');
    if (!badge) return;
    if (navigator.onLine) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'inline';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const today = stripTime(new Date());
    let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let latestPrediction = null;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetView) view.classList.add('active');
            });
        });
    });

    document.getElementById('view-tips-btn').addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        document.getElementById('tips').classList.add('active');
    });

    document.getElementById('enable-alerts-btn').addEventListener('click', requestNotificationPermission);

    document.getElementById('prev-month').addEventListener('click', () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
        renderCalendar(latestPrediction);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
        renderCalendar(latestPrediction);
    });

    document.getElementById('today-month').addEventListener('click', () => {
        visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        renderCalendar(latestPrediction);
    });

    const modal = document.getElementById('log-modal');
    document.getElementById('open-log-modal').addEventListener('click', () => openLogModal());
    document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('active'));

    document.getElementById('save-period').addEventListener('click', () => {
        const start = document.getElementById('new-start').value;
        const end = document.getElementById('new-end').value;
        const flow = document.getElementById('new-flow').value;
        const symptoms = getSelectedSymptoms();
        const editIndexValue = document.getElementById('edit-index').value;
        if (start) {
            const newCycle = { start, end: end || null, flow, symptoms };
            const storedData = getFullData();
            if (editIndexValue !== '') {
                storedData[Number(editIndexValue)] = newCycle;
            } else {
                storedData.push(newCycle);
            }
            localStorage.setItem('arpa_cycles', JSON.stringify(storedData));
            modal.classList.remove('active');
            initApp();
        }
    });

    function openLogModal(cycle = null, index = '') {
        document.getElementById('modal-title').textContent = cycle ? 'Edit Period Entry' : 'Log Period Date';
        document.getElementById('save-period').textContent = cycle ? 'Update Data' : 'Save Data';
        document.getElementById('edit-index').value = index;
        document.getElementById('new-start').value = cycle?.start || '';
        document.getElementById('new-end').value = cycle?.end || '';
        document.getElementById('new-flow').value = cycle?.flow || '';
        setSelectedSymptoms(cycle?.symptoms || []);
        modal.classList.add('active');
    }

    function getSelectedSymptoms() {
        return Array.from(document.querySelectorAll('#symptom-picker input:checked')).map(input => input.value);
    }

    function setSelectedSymptoms(symptoms) {
        const selected = new Set(symptoms);
        document.querySelectorAll('#symptom-picker input').forEach(input => {
            input.checked = selected.has(input.value);
        });
    }

    function getFullData() {
        const storedData = localStorage.getItem('arpa_cycles');
        if (!storedData) {
            localStorage.setItem('arpa_cycles', JSON.stringify(cycleData));
            return [...cycleData].sort((a, b) => new Date(a.start) - new Date(b.start));
        }
        const parsed = JSON.parse(storedData);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem('arpa_cycles', JSON.stringify(cycleData));
            return [...cycleData].sort((a, b) => new Date(a.start) - new Date(b.start));
        }
        return parsed.sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    function parseDate(value) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function stripTime(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function addDays(date, days) {
        const copy = new Date(date);
        copy.setDate(copy.getDate() + days);
        return copy;
    }

    function dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function daysBetween(start, end) {
        return Math.round((stripTime(end) - stripTime(start)) / (1000 * 60 * 60 * 24));
    }

    function average(values, fallback) {
        if (!values.length) return fallback;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    function formatDate(date, options = { month: 'short', day: 'numeric' }) {
        return date.toLocaleDateString(undefined, options);
    }

    function dateInRange(date, start, end) {
        return date >= stripTime(start) && date <= stripTime(end);
    }

    function deleteCycle(index) {
        if (confirm("Are you sure you want to delete this entry?")) {
            const fullData = getFullData();
            fullData.splice(index, 1);
            localStorage.setItem('arpa_cycles', JSON.stringify(fullData));
            initApp();
        }
    }

    function editCycle(index) {
        const fullData = getFullData();
        openLogModal(fullData[index], index);
    }

    window.deleteCycle = deleteCycle;
    window.editCycle = editCycle;

    function buildPrediction() {
        const fullData = getFullData();
        const recentCycles = fullData.slice(-18);
        const cycleLengths = [];
        const periodLengths = [];

        fullData.slice(-12).forEach(cycle => {
            if (!cycle.end) return;
            const start = parseDate(cycle.start);
            const end = parseDate(cycle.end);
            const duration = daysBetween(start, end) + 1;
            if (duration > 1 && duration < 11) periodLengths.push(duration);
        });

        for (let i = 1; i < recentCycles.length; i++) {
            const current = parseDate(recentCycles[i].start);
            const previous = parseDate(recentCycles[i - 1].start);
            const diffDays = daysBetween(previous, current);
            if (diffDays < 45 && diffDays > 10) cycleLengths.push(diffDays);
        }

        const avgCycle = Math.round(average(cycleLengths, 28));
        const avgPeriod = Math.round(average(periodLengths, 5));
        const variation = cycleLengths.length > 1
            ? Math.max(...cycleLengths) - Math.min(...cycleLengths)
            : 0;
        const confidence = cycleLengths.length < 3
            ? 'Getting started'
            : variation <= 4
                ? 'High'
                : variation <= 8
                    ? 'Medium'
                    : 'Low';

        const lastStart = parseDate(fullData[fullData.length - 1].start);
        let nextStart = addDays(lastStart, avgCycle);
        while (nextStart < addDays(today, -avgPeriod)) {
            nextStart = addDays(nextStart, avgCycle);
        }

        const nextEnd = addDays(nextStart, Math.max(avgPeriod - 1, 0));
        const ovulationDate = addDays(nextStart, -14);
        const fertileStart = addDays(ovulationDate, -5);
        const fertileEnd = addDays(ovulationDate, 1);

        return {
            nextStart,
            nextEnd,
            ovulationDate,
            fertileStart,
            fertileEnd,
            avgCycle,
            avgPeriod,
            confidence,
            sampleSize: cycleLengths.length,
            variation
        };
    }

    function predictNextPeriod() {
        latestPrediction = buildPrediction();
        updateDashboard(latestPrediction);
        renderCalendar(latestPrediction);
        renderPredictionPanel(latestPrediction);
        renderDailyInsight(latestPrediction);
        checkAndShowPeriodAlert(latestPrediction);
    }

    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                alert("Alerts enabled successfully! We will gently remind you before your next period.");
                // Test notification
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification("Arpa's Luna", {
                            body: "Alerts are now active \u2764\ufe0f",
                            icon: "assets/arpa1.jpg",
                            vibrate: [200, 100, 200]
                        });
                    });
                } else {
                    new Notification("Arpa's Luna", { body: "Alerts are now active \u2764\ufe0f", icon: "assets/arpa1.jpg" });
                }
            } else {
                alert("Permission denied. We cannot send you alerts without permission.");
            }
        });
    }

    function checkAndShowPeriodAlert(predictionData) {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        
        const daysUntil = daysBetween(today, predictionData.nextStart);
        // Only alert if period is expected in 0, 1, or 2 days
        if (daysUntil < 0 || daysUntil > 2) return;

        const dateKeyStr = dateKey(predictionData.nextStart);
        const lastAlerted = localStorage.getItem('arpa_last_alerted_cycle');
        
        // Already alerted for this cycle
        if (lastAlerted === dateKeyStr) return;

        let message = `Your period is expected in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`;
        if (daysUntil === 0) message = "Your period is expected today.";

        // Show notification via Service Worker if available (better for mobile)
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("Luna Period Alert", {
                    body: message + " Please take care \u2764\ufe0f",
                    icon: "assets/arpa1.jpg",
                    vibrate: [200, 100, 200],
                    tag: 'period-alert'
                });
                localStorage.setItem('arpa_last_alerted_cycle', dateKeyStr);
            });
        } else {
            new Notification("Luna Period Alert", {
                body: message + " Please take care \u2764\ufe0f",
                icon: "assets/arpa1.jpg",
                tag: 'period-alert'
            });
            localStorage.setItem('arpa_last_alerted_cycle', dateKeyStr);
        }
    }

    function updateDashboard(predictionData) {
        const daysLabel = document.querySelector('.days-label');
        const statusText = document.querySelector('.status-text');
        const pulseInner = document.querySelector('.pulse-inner');

        const fullData = getFullData();
        const lastCycle = fullData[fullData.length - 1];
        const isOnPeriod = lastCycle && !lastCycle.end && daysBetween(parseDate(lastCycle.start), today) >= 0;

        const oldDate = pulseInner.querySelector('.prediction-date');
        if (oldDate) oldDate.remove();

        if (isOnPeriod) {
            const daysSince = daysBetween(parseDate(lastCycle.start), today);
            daysLabel.textContent = daysSince === 0 ? "Day 1" : `Day ${daysSince + 1}`;
            statusText.textContent = "You are on your period \u2764\ufe0f";
            const subtitle = document.createElement('p');
            subtitle.className = 'prediction-date';
            subtitle.textContent = `Started ${formatDate(parseDate(lastCycle.start), { month: 'long', day: 'numeric' })}`;
            subtitle.style.fontSize = '0.9rem';
            subtitle.style.marginTop = '0.5rem';
            subtitle.style.color = '#d81b60';
            subtitle.style.fontWeight = '600';
            pulseInner.appendChild(subtitle);
            return;
        }

        const diffDays = daysBetween(today, predictionData.nextStart);
        daysLabel.textContent = diffDays > 0 ? diffDays : (diffDays === 0 ? "Today" : Math.abs(diffDays));
        statusText.textContent = diffDays > 0 ? "Days until period" : (diffDays === 0 ? "Period expected" : "Days late");
        const dateStr = formatDate(predictionData.nextStart, { month: 'long', day: 'numeric' });
        const subtitle = document.createElement('p');
        subtitle.className = 'prediction-date';
        subtitle.textContent = `Most likely on ${dateStr}`;
        subtitle.style.fontSize = '0.9rem';
        subtitle.style.marginTop = '0.5rem';
        subtitle.style.color = '#e57373';
        subtitle.style.fontWeight = '500';
        pulseInner.appendChild(subtitle);
    }

    function renderPredictionPanel(predictionData) {
        const panel = document.getElementById('prediction-panel');
        if (!panel) return;

        const daysUntil = daysBetween(today, predictionData.nextStart);
        const dueText = daysUntil > 0
            ? `${daysUntil} days away`
            : daysUntil === 0
                ? 'Expected today'
                : `${Math.abs(daysUntil)} days late`;

        panel.innerHTML = `
            <div class="prediction-card main">
                <span class="prediction-label">Most probable date</span>
                <strong>${formatDate(predictionData.nextStart, { month: 'long', day: 'numeric' })}</strong>
                <small>${dueText}</small>
            </div>
            <div class="prediction-card">
                <span class="prediction-label">Cycle pattern</span>
                <strong>${predictionData.avgCycle} days</strong>
                <small>${predictionData.confidence} confidence</small>
            </div>
            <div class="prediction-card">
                <span class="prediction-label">Fertile window</span>
                <strong>${formatDate(predictionData.fertileStart)} - ${formatDate(predictionData.fertileEnd)}</strong>
                <small>Ovulation around ${formatDate(predictionData.ovulationDate)}</small>
            </div>
        `;
    }

    const phaseInsights = {
        menstrual: {
            name: "Menstrual Phase",
            messages: [
                "Your body is working hard today, Arpa. Remember to rest and be gentle with yourself \u2764\ufe0f",
                "Take it easy today. A little self-care goes a long way \u2728",
                "Your energy might be lower right now, and that is completely okay. Rest up \u2764\ufe0f",
                "Treat yourself to something warm and comforting today. You deserve it \u2728"
            ]
        },
        follicular: {
            name: "Follicular Phase",
            messages: [
                "Your estrogen is rising! You might feel a burst of fresh energy and creativity today \u2728",
                "This is a great time to start new projects or plan something fun! \u2764\ufe0f",
                "You might be feeling more upbeat and social as your body prepares for the week ahead \u2728",
                "Your brain is sharp and your energy is returning. A beautiful day awaits you, Arpa \u2764\ufe0f"
            ]
        },
        ovulation: {
            name: "Ovulation Phase",
            messages: [
                "Your confidence and energy are at their peak today! You are glowing, Arpa \u2728",
                "Estrogen is high! This is your most magnetic and energetic time of the cycle \u2764\ufe0f",
                "You might feel extra social and vibrant today. Enjoy this beautiful energy! \u2728"
            ]
        },
        luteal: {
            name: "Luteal Phase",
            messages: [
                "Your body is starting to wind down. It's a perfect time for cozy, quiet activities \u2764\ufe0f",
                "You might feel like nesting or organizing. Listen to what your body needs today \u2728",
                "Progesterone is rising, which can make you feel a bit sleepy or introspective. Take care of yourself \u2764\ufe0f",
                "Be extra kind to yourself over the next few days as your body prepares for its next cycle \u2728"
            ]
        }
    };

    function renderDailyInsight(predictionData) {
        const card = document.getElementById('daily-insight-card');
        const phaseNameEl = document.getElementById('insight-phase-name');
        const messageEl = document.getElementById('insight-message');
        
        if (!card || !predictionData) return;

        const fullData = getFullData();
        if (fullData.length === 0) return;

        const lastCycle = fullData[fullData.length - 1];
        const lastStart = parseDate(lastCycle.start);
        const daysSinceStart = daysBetween(lastStart, today);
        let phaseKey = 'luteal';

        if (daysSinceStart >= 0 && daysSinceStart <= 5) {
            phaseKey = 'menstrual';
        } else if (daysSinceStart > 5 && daysSinceStart <= 13) {
            phaseKey = 'follicular';
        } else if (daysSinceStart >= 14 && daysSinceStart <= 16) {
            phaseKey = 'ovulation';
        }

        const phaseInfo = phaseInsights[phaseKey];
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const messageIndex = dayOfYear % phaseInfo.messages.length;

        phaseNameEl.textContent = phaseInfo.name;
        messageEl.textContent = phaseInfo.messages[messageIndex];
        
        card.classList.remove('hidden');
    }

    function renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        const fullData = [...getFullData()].reverse();
        historyList.innerHTML = '';
        fullData.forEach((cycle, index) => {
            const sourceIndex = fullData.length - 1 - index;
            const start = parseDate(cycle.start);
            const isOngoing = !cycle.end;
            const end = isOngoing ? today : parseDate(cycle.end);
            const duration = daysBetween(start, end) + 1;
            let cycleLen = '--';
            if (!isOngoing && index < fullData.length - 1) {
                const prevStart = parseDate(fullData[index + 1].start);
                cycleLen = daysBetween(prevStart, start);
            }
            const item = document.createElement('div');
            item.className = 'history-item' + (isOngoing ? ' ongoing' : '');
            const symptomChips = Array.isArray(cycle.symptoms) && cycle.symptoms.length
                ? cycle.symptoms.map(symptom => `<span class="symptom-chip">${symptom}</span>`).join('')
                : '<span class="symptom-chip muted">No symptoms logged</span>';
            const flowChip = cycle.flow ? `<span class="flow-chip">${cycle.flow} flow</span>` : '';
            const ongoingBadge = isOngoing ? '<span class="ongoing-badge">Ongoing</span>' : '';
            item.innerHTML = `
                <div class="history-date">
                    <span class="history-range">${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ${ongoingBadge}</span>
                    <span class="history-duration">${duration} day${isOngoing ? ' so far' : ' period'}</span>
                    <button class="edit-entry-btn" onclick="editCycle(${sourceIndex})">
                        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04c.39-.39.39-1.02 0-1.41L18.2 3.29a.9959.9959 0 0 0-1.41 0l-1.96 1.96L18.58 9l2.13-1.79z" fill="currentColor"/></svg>
                        ${isOngoing ? 'Add end date' : 'Edit entry'}
                    </button>
                    <div class="history-tags">
                        ${flowChip}
                        ${symptomChips}
                    </div>
                </div>
                <div class="history-actions">
                    <div class="history-cycle-length">${cycleLen} day cycle</div>
                    <button class="delete-btn" onclick="deleteCycle(${sourceIndex})" aria-label="Delete">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
                    </button>
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    function renderCalendar(predictionData) {
        const grid = document.getElementById('calendar-grid');
        const monthLabel = document.getElementById('current-month-year');
        const year = visibleMonth.getFullYear();
        const month = visibleMonth.getMonth();
        const fullData = getFullData();
        if (monthLabel) monthLabel.textContent = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (!grid) return;
        grid.innerHTML = '';

        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-weekday';
            dayEl.textContent = day;
            grid.appendChild(dayEl);
        });

        for (let i = 0; i < firstDay; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'calendar-empty';
            grid.appendChild(emptyEl);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            const numberEl = document.createElement('span');
            numberEl.textContent = d;
            dayEl.appendChild(numberEl);
            dayEl.setAttribute('aria-label', formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));

            if (dateKey(date) === dateKey(today)) {
                dayEl.classList.add('today');
            }

            const isPeriod = fullData.some(c => {
                const s = parseDate(c.start);
                const e = c.end ? parseDate(c.end) : today;
                return dateInRange(date, s, e);
            });
            if (isPeriod) dayEl.classList.add('period');

            if (predictionData && dateInRange(date, predictionData.fertileStart, predictionData.fertileEnd)) {
                dayEl.classList.add('fertile');
            }

            if (predictionData && dateKey(date) === dateKey(predictionData.ovulationDate)) {
                dayEl.classList.add('ovulation');
            }

            if (predictionData && dateInRange(date, predictionData.nextStart, predictionData.nextEnd)) {
                dayEl.classList.add('predicted');
            }

            grid.appendChild(dayEl);
        }
    }

    function initApp() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % dailyMemories.length;
        const memory = dailyMemories[index];

        document.documentElement.style.setProperty('--splash-bg', `url('${memory.image}')`);

        showSplash();
        predictNextPeriod();
        renderHistory();
        renderDailyMemory();
        setupDataManagement();
        initBannerAnimation();
    }

    function initBannerAnimation() {
        if (typeof lottie !== 'undefined') {
            fetch('assets/animations/luna_moon.json')
                .then(r => r.json())
                .then(data => {
                    lottie.loadAnimation({
                        container: document.getElementById('luna-banner'),
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        animationData: data
                    });
                })
                .catch(() => {});
        }
    }

    const dailyMemories = [
        { image: "assets/arpa_memory_1.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_2.jpg", caption: "You are the best decision I have ever made, my beautiful queen ❤️" },
        { image: "assets/arpa_memory_3.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_4.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_5.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_6.jpg", caption: "You shine brighter than all the stars in the sky \u2764\ufe0f" },
        { image: "assets/arpa_memory_7.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_8.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_9.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_10.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_11.jpg", caption: "You are my dream come true, Arpa \u2764\ufe0f" },
        { image: "assets/arpa_memory_12.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_13.jpg", caption: "I will love you and cherish you through every single season of life ❤️" },
        { image: "assets/arpa_memory_14.jpg", caption: "The love you give us is the greatest treasure we will ever own ✨" },
        { image: "assets/arpa_memory_15.jpg", caption: "You are the most stunning woman inside and out, my love ✨" },
        { image: "assets/arpa_memory_16.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_17.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_18.jpg", caption: "A beautiful moment with my beautiful queen \u2764\ufe0f" },
        { image: "assets/arpa_memory_19.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_20.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_21.jpg", caption: "I love you more than all the words in the universe can say \u2728" },
        { image: "assets/arpa_memory_22.jpg", caption: "Every love story is beautiful, but ours is my favorite \u2764\ufe0f" },
        { image: "assets/arpa_memory_23.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_24.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_25.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_26.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_27.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_28.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_29.jpg", caption: "Watching you care for our boy shows me what true love really is ❤️" },
        { image: "assets/arpa_memory_30.jpg", caption: "Every day with you feels like a beautiful dream I never want to end \u2728" },
        { image: "assets/arpa_memory_31.jpg", caption: "Thank you for bringing so much color and joy into my world ❤️" },
        { image: "assets/arpa_memory_32.jpg", caption: "You and our son are the two most beautiful things in my world \u2764\ufe0f" },
        { image: "assets/arpa_memory_33.jpg", caption: "You are my today, my tomorrow, and my forever \u2764\ufe0f" },
        { image: "assets/arpa_memory_34.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_35.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_36.jpg", caption: "The way you care for our family fills my heart with so much pride \u2728" },
        { image: "assets/arpa_memory_37.jpg", caption: "Every day with you is a beautiful reminder of how lucky I am ✨" },
        { image: "assets/arpa_memory_38.jpg", caption: "Another perfect memory captured in time \u2728" },
        { image: "assets/arpa_memory_39.jpg", caption: "Seeing you happy is my favorite thing in the world \u2728" },
        { image: "assets/arpa_memory_40.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_41.jpg", caption: "You are and always will be my forever love, Arpa \u2764\ufe0f" },
        { image: "assets/arpa_memory_42.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_43.jpg", caption: "You are the most beautiful chapter of my life \u2764\ufe0f" },
        { image: "assets/arpa_memory_44.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_45.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_46.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_47.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_48.jpg", caption: "You are my peace, my joy, and my greatest love \u2764\ufe0f" },
        { image: "assets/arpa_memory_49.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_50.jpg", caption: "Your presence is the greatest gift I have ever received \u2728" },
        { image: "assets/arpa_memory_51.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_52.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_53.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_54.jpg", caption: "My heart belongs to you, always and forever \u2728" },
        { image: "assets/arpa_memory_55.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_56.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_57.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_58.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_59.jpg", caption: "Every little moment with you and our son is a lifetime memory ✨" },
        { image: "assets/arpa_memory_60.jpg", caption: "Your love is the greatest adventure of my life \u2728" },
        { image: "assets/arpa_memory_61.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_62.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_63.jpg", caption: "You are the most amazing woman I have ever known, Arpa \u2764\ufe0f" },
        { image: "assets/arpa_memory_64.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_65.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_66.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_67.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_68.jpg", caption: "Thank you for being the most amazing wife \u2728" },
        { image: "assets/arpa_memory_69.jpg", caption: "Your laughter is the sweetest sound in our entire home ✨" },
        { image: "assets/arpa_memory_70.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_71.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_72.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_73.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_74.jpg", caption: "Watching you raise our little boy is a daily inspiration ✨" },
        { image: "assets/arpa_memory_75.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_76.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_77.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_78.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_79.jpg", caption: "Seeing you smile with him makes my entire world complete. I love you both endlessly \u2764\ufe0f" },
        { image: "assets/arpa_memory_80.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_81.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_82.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_83.jpg", caption: "You are the best part of my life \u2728" },
        { image: "assets/arpa_memory_84.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_85.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_86.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_87.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_88.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_89.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_90.jpg", caption: "You bring so much peace and happiness into my life, Arpa ❤️" },
        { image: "assets/arpa_memory_91.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_92.jpg", caption: "My world is complete because you are in it \u2728" },
        { image: "assets/arpa_memory_93.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_94.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_95.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_96.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_97.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_98.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_99.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_100.jpg", caption: "My heart beats faster every time you look at me ✨" },
        { image: "assets/arpa_memory_101.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_102.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_103.jpg", caption: "I will love you, protect you, and cherish you forever and always ❤️" },
        { image: "assets/arpa_memory_104.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_105.jpg", caption: "The love you give our family is the most precious thing in the world \u2764\ufe0f" },
        { image: "assets/arpa_memory_106.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_107.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_108.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_109.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_110.jpg", caption: "Your happiness is all I ever need to see \u2764\ufe0f" },
        { image: "assets/arpa_memory_111.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_112.jpg", caption: "Your love is the anchor that keeps me steady through every storm \u2764\ufe0f" },
        { image: "assets/arpa_memory_113.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_114.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_115.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_116.jpg", caption: "The way you love our son shows me what true beauty really means \u2728" },
        { image: "assets/arpa_memory_117.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_118.jpg", caption: "Every heartbeat of mine whispers your name \u2728" },
        { image: "assets/arpa_memory_119.jpg", caption: "Our love story is my favorite story ever told \u2764\ufe0f" },
        { image: "assets/arpa_memory_120.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_121.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_122.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_123.jpg", caption: "Every day I spend with you is my new favorite day ❤️" },
        { image: "assets/arpa_memory_124.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_125.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_126.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_127.jpg", caption: "The love we share is my greatest treasure \u2764\ufe0f" },
        { image: "assets/arpa_memory_128.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_129.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_130.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_131.jpg", caption: "Thank you for being my partner, my love, and my everything ✨" },
        { image: "assets/arpa_memory_132.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_133.jpg", caption: "You are the love of my life and the mother of our sweet son ❤️" },
        { image: "assets/arpa_memory_134.jpg", caption: "Seeing your face is the best part of every single day \u2764\ufe0f" },
        { image: "assets/arpa_memory_135.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_136.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_137.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_138.jpg", caption: "I fall in love with your beautiful soul more and more each day ✨" },
        { image: "assets/arpa_memory_139.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_140.jpg", caption: "You are the poetry my heart has been writing all my life \u2764\ufe0f" },
        { image: "assets/arpa_memory_141.jpg", caption: "I am so proud of the amazing mother and wife you are ✨" },
        { image: "assets/arpa_memory_142.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_143.jpg", caption: "You are the queen of our hearts and the light of our home ✨" },
        { image: "assets/arpa_memory_144.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_145.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_146.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_147.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_148.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_149.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_150.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_151.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_152.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_153.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_154.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_155.jpg", caption: "You are my greatest adventure and my safest place \u2728" },
        { image: "assets/arpa_memory_156.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_157.jpg", caption: "You are the missing piece I never knew I was searching for \u2764\ufe0f" },
        { image: "assets/arpa_memory_158.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_159.jpg", caption: "Your love is the most precious gift I have ever received ❤️" },
        { image: "assets/arpa_memory_160.jpg", caption: "Your gentle touch and sweet smile make everything better ✨" },
        { image: "assets/arpa_memory_161.jpg", caption: "Being with you feels like coming home \u2728" },
        { image: "assets/arpa_memory_162.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_163.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_164.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_165.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_166.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_167.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_168.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_169.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_170.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_171.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_172.jpg", caption: "Every moment spent with you is a memory I will cherish forever \u2764\ufe0f" },
        { image: "assets/arpa_memory_173.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_174.jpg", caption: "The love we share is the foundation of our beautiful family ❤️" },
        { image: "assets/arpa_memory_175.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_176.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_177.jpg", caption: "You make the hard days easy and the good days unforgettable ❤️" },
        { image: "assets/arpa_memory_178.jpg", caption: "Every moment captured with you is a moment I treasure forever \u2764\ufe0f" },
        { image: "assets/arpa_memory_179.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_180.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_181.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_182.jpg", caption: "Watching you guide our son is the greatest joy of my life ❤️" },
        { image: "assets/arpa_memory_183.jpg", caption: "Thank you for being the heart of our beautiful family \u2764\ufe0f" },
        { image: "assets/arpa_memory_184.jpg", caption: "My love for you grows deeper with every moment we share \u2728" },
        { image: "assets/arpa_memory_185.jpg", caption: "You are the definition of grace and strength, Arpa ✨" },
        { image: "assets/arpa_memory_186.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_187.jpg", caption: "You are the anchor that keeps our family steady and happy ✨" },
        { image: "assets/arpa_memory_188.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_189.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_190.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_191.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_192.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_193.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_194.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_195.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_196.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_197.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_198.jpg", caption: "Every time I look at you, I fall in love all over again \u2728" },
        { image: "assets/arpa_memory_199.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_200.jpg", caption: "Thank you for being the heart and soul of our beautiful family ❤️" },
        { image: "assets/arpa_memory_201.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_202.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_203.jpg", caption: "I thank the stars every night for bringing you into my life \u2764\ufe0f" },
        { image: "assets/arpa_memory_204.jpg", caption: "I am endlessly grateful for every moment with you \u2728" },
        { image: "assets/arpa_memory_205.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_206.jpg", caption: "You are my shelter, my guide, and my forever love ❤️" },
        { image: "assets/arpa_memory_207.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_208.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_209.jpg", caption: "There is no picture more beautiful than the two of you together. You are my paradise \u2728" },
        { image: "assets/arpa_memory_210.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_211.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_212.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_213.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_214.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_215.jpg", caption: "Seeing you happy is all I need to be completely content ✨" },
        { image: "assets/arpa_memory_216.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_217.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_218.jpg", caption: "You are the center of my universe \u2728" },
        { image: "assets/arpa_memory_219.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_220.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_221.jpg", caption: "Your love gives me strength I never knew I had \u2728" },
        { image: "assets/arpa_memory_222.jpg", caption: "My beautiful wife, my incredible queen, and our wonderful boy. Forever my everything \u2764\ufe0f" },
        { image: "assets/arpa_memory_223.jpg", caption: "Being your husband is the greatest honor of my life \u2764\ufe0f" },
        { image: "assets/arpa_memory_224.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_225.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_226.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_227.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_228.jpg", caption: "Forever by your side. You are my everything, Arpa \u2764\ufe0f" },
        { image: "assets/arpa_memory_229.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_230.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_231.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_232.jpg", caption: "You are the most beautiful soul I have ever known \u2728" },
        { image: "assets/arpa_memory_233.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_234.jpg", caption: "I love you more than words, actions, or time can ever show ✨" },
        { image: "assets/arpa_memory_235.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_236.jpg", caption: "Your love wraps around me like the warmest embrace \u2764\ufe0f" },
        { image: "assets/arpa_memory_237.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_238.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_239.jpg", caption: "Watching our son grow up with you is my absolute favorite view ✨" },
        { image: "assets/arpa_memory_240.jpg", caption: "You are the best wife and the most loving mother in the world ❤️" },
        { image: "assets/arpa_memory_241.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_242.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_243.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_244.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_245.jpg", caption: "Looking at this photo reminds me of how incredibly lucky I am \u2764\ufe0f" },
        { image: "assets/arpa_memory_246.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_247.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_248.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_249.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_250.jpg", caption: "You are my shelter, my joy, and my greatest love \u2764\ufe0f" },
        { image: "assets/arpa_memory_251.jpg", caption: "You are the most precious gift life has ever given me \u2764\ufe0f" },
        { image: "assets/arpa_memory_252.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_253.jpg", caption: "Your eyes hold a beauty that words can never fully describe ✨" },
        { image: "assets/arpa_memory_254.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_255.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_256.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_257.jpg", caption: "Your smile brings so much light into our lives, Arpa \u2728" },
        { image: "assets/arpa_memory_258.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_259.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_260.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_261.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_262.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_263.jpg", caption: "Seeing you smile makes every single worry disappear instantly ✨" },
        { image: "assets/arpa_memory_264.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_265.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_266.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_267.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_268.jpg", caption: "Our home is a paradise because you are the heart of it ❤️" },
        { image: "assets/arpa_memory_269.jpg", caption: "I am so grateful to have you by my side \u2728" },
        { image: "assets/arpa_memory_270.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_271.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_272.jpg", caption: "There is no one else I would rather build a life with, Arpa \u2764\ufe0f" },
        { image: "assets/arpa_memory_273.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_274.jpg", caption: "You are my forever valentine, my queen, and my best friend ❤️" },
        { image: "assets/arpa_memory_275.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_276.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_277.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_278.jpg", caption: "You are my happiness, my peace, and my everything \u2728" },
        { image: "assets/arpa_memory_279.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_280.jpg", caption: "You complete me in every possible way \u2728" },
        { image: "assets/arpa_memory_281.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_282.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_283.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_284.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_285.jpg", caption: "I will love you forever, Arpa \u2728" },
        { image: "assets/arpa_memory_286.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_287.jpg", caption: "A beautiful memory with the most beautiful person in the world \u2728" },
        { image: "assets/arpa_memory_288.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_289.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_290.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_291.jpg", caption: "I love you more than words can ever express ❤️" },
        { image: "assets/arpa_memory_292.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_293.jpg", caption: "Thank you for filling our lives with endless love and light ✨" },
        { image: "assets/arpa_memory_294.jpg", caption: "You are the most wonderful mother our son could ever ask for ❤️" },
        { image: "assets/arpa_memory_295.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_296.jpg", caption: "Watching you soothe our son to sleep is a moment of pure peace ❤️" },
        { image: "assets/arpa_memory_297.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_298.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_299.jpg", caption: "My love for you grows stronger with every passing day \u2764\ufe0f" },
        { image: "assets/arpa_memory_300.jpg", caption: "Your strength and grace inspire me every single day \u2728" },
        { image: "assets/arpa_memory_301.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_302.jpg", caption: "Every photo with you is a memory I will cherish forever ❤️" },
        { image: "assets/arpa_memory_303.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_304.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_305.jpg", caption: "Every new memory with you is a treasure I hold close to my heart ❤️" },
        { image: "assets/arpa_memory_306.jpg", caption: "The bond you share with our little boy is pure magic ❤️" },
        { image: "assets/arpa_memory_307.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_308.jpg", caption: "Watching you with our son makes my heart overflow with love ❤️" },
        { image: "assets/arpa_memory_309.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_310.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_311.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_312.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_313.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_314.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_315.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_316.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
        { image: "assets/arpa_memory_317.jpg", caption: "You are my dream come true, Arpa ✨" },
        { image: "assets/arpa_memory_318.jpg", caption: "Watching you and our son laugh together is pure bliss ✨" },
        { image: "assets/arpa_memory_319.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_320.jpg", caption: "You are the most beautiful part of every single day ❤️" },
        { image: "assets/arpa_memory_321.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_322.jpg", caption: "Watching you be the most amazing mother to our son is my favorite view \u2764\ufe0f" },
        { image: "assets/arpa_memory_323.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_324.jpg", caption: "I love you more than words could ever say \u2764\ufe0f" },
        { image: "assets/arpa_memory_325.jpg", caption: "The most beautiful mother and the most precious son. My two greatest blessings in this world \u2764\ufe0f" },
        { image: "assets/arpa_memory_326.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_327.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_328.jpg", caption: "You are the queen of my heart and soul ❤️" },
        { image: "assets/arpa_memory_329.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_330.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_331.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_332.jpg", caption: "You make our house a home with your endless love and warmth \u2728" },
        { image: "assets/arpa_memory_333.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_334.jpg", caption: "Thank you for filling our lives with endless joy and love ✨" },
        { image: "assets/arpa_memory_335.jpg", caption: "You make every single day brighter just by being in it \u2764\ufe0f" },
        { image: "assets/arpa_memory_336.jpg", caption: "You make my world brighter just by being in it \u2728" },
        { image: "assets/arpa_memory_337.jpg", caption: "This beautiful family is my greatest achievement. I love you, Arpa \u2728" },
        { image: "assets/arpa_memory_338.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_339.jpg", caption: "You are my greatest adventure and my safest place ✨" },
        { image: "assets/arpa_memory_340.jpg", caption: "You and our son are my entire world ✨" },
        { image: "assets/arpa_memory_341.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_342.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_343.jpg", caption: "Every day with you is a beautiful new beginning ✨" },
        { image: "assets/arpa_memory_344.jpg", caption: "My heart belongs to you, always and forever ❤️" },
        { image: "assets/arpa_memory_345.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_346.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_347.jpg", caption: "You are the light that guides me through even the darkest days \u2728" },
        { image: "assets/arpa_memory_348.jpg", caption: "You make even ordinary moments feel extraordinary ❤️" },
        { image: "assets/arpa_memory_349.jpg", caption: "You make every moment special just by being there ✨" },
        { image: "assets/arpa_memory_350.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_351.jpg", caption: "You are the heart of our family, Arpa. The love and care you give him is pure magic \u2728" },
        { image: "assets/arpa_memory_352.jpg", caption: "I fall in love with you more every single day ❤️" },
        { image: "assets/arpa_memory_353.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_354.jpg", caption: "Your presence is the best gift life has given me ✨" },
        { image: "assets/arpa_memory_355.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_356.jpg", caption: "You are my sunshine on every cloudy day ✨" },
        { image: "assets/arpa_memory_357.jpg", caption: "Seeing you happy is all that matters to me ❤️" },
        { image: "assets/arpa_memory_358.jpg", caption: "Your love is the anchor that keeps me steady ❤️" },
        { image: "assets/arpa_memory_359.jpg", caption: "You make our house a home with your beautiful soul ✨" },
        { image: "assets/arpa_memory_360.jpg", caption: "Watching you smile is my favorite thing in the world ✨" },
        { image: "assets/arpa_memory_361.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_362.jpg", caption: "You are the light that guides me through everything ✨" },
        { image: "assets/arpa_memory_363.jpg", caption: "My world is brighter because you are in it ❤️" },
        { image: "assets/arpa_memory_364.jpg", caption: "I am so grateful to share my life with you ✨" },
        { image: "assets/arpa_memory_365.jpg", caption: "You are my today and all of my tomorrows \u2764\ufe0f" },
        { image: "assets/arpa_memory_366.jpg", caption: "Your love is the greatest gift I have ever received ❤️" },
    ];

    window.openMemory = function() {
        const envelope = document.getElementById('memory-envelope');
        const polaroid = document.getElementById('polaroid-memory');
        if (envelope && polaroid) {
            envelope.classList.add('open');
            setTimeout(() => {
                envelope.style.display = 'none';
                polaroid.classList.remove('hidden');
            }, 600);
        }
    };

    function renderDailyMemory() {
        const container = document.getElementById('daily-memory-container');
        if (!container) return;
        
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % dailyMemories.length;
        const memory = dailyMemories[index];
        
        container.innerHTML = `
            <div class="envelope-container" id="memory-envelope" onclick="openMemory()">
                <div class="heart-seal">&#10084;&#65039;</div>
                <p class="tap-to-open">Tap to unlock today's memory</p>
            </div>
            <div class="polaroid-wrapper hidden" id="polaroid-memory">
                <div class="polaroid">
                    <div class="polaroid-pin"></div>
                    <div class="polaroid-image" style="background-image: url('${memory.image}')"></div>
                    <p class="polaroid-caption">${memory.caption}</p>
                </div>
            </div>
        `;

        renderLoveCounter();
        renderSparkles();
    }

    function renderLoveCounter() {
        const container = document.getElementById('love-counter-container');
        if (!container) return;
        
        const birthDate = new Date('2024-08-09');
        const today = new Date();
        
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += lastMonth.getDate();
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        let timeParts = [];
        if (years > 0) timeParts.push(`${years} year${years !== 1 ? 's' : ''}`);
        if (months > 0) timeParts.push(`${months} month${months !== 1 ? 's' : ''}`);
        if (days > 0) timeParts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (timeParts.length === 0) timeParts.push("0 days");
        
        container.innerHTML = `
            <div class="love-counter">
                <span style="display:block; margin-bottom: 0.5rem; font-size: 1rem; font-style: italic;">Treasuring the most beautiful mother to our boy for</span>
                <strong id="days-count" style="display:block; font-size: 1.4rem; margin: 0.5rem 0; color: #d81b60;">${timeParts.join(', ')}</strong>
                <span style="display:block; margin-top: 0.5rem; font-size: 0.95rem;">and falling deeper in love with you every single day &#10024;</span>
            </div>
        `;
    }

    function renderSparkles() {
        const container = document.getElementById('sparkles-container');
        if (!container || container.children.length > 0) return; // Only render once
        
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.animationDelay = (Math.random() * 5) + 's';
            sparkle.style.animationDuration = (5 + Math.random() * 5) + 's, ' + (2 + Math.random() * 2) + 's';
            container.appendChild(sparkle);
        }
    }

    const romanticMessages = [
        "You are the most beautiful girl in the world, Arpa \u2764\ufe0f",
        "You are the most romantic person I know, Arpa \u2764\ufe0f",
        "You are the mother of the best son in the world, Arpa \u2764\ufe0f",
        "You are very beautiful, Arpa \u2764\ufe0f",
        "You are the most beautiful part of my day, Arpa \u2764\ufe0f",
        "My love for you grows stronger every single day, Arpa \u2764\ufe0f",
        "Seeing your smile is all I need to be happy, Arpa \u2764\ufe0f",
        "You make my world a better place just by being in it, Arpa \u2764\ufe0f",
        "I am so lucky to have you in my life, Arpa \u2764\ufe0f",
        "Every moment with you is a blessing, Arpa \u2764\ufe0f",
        "You are my sunshine on a cloudy day, Arpa \u2764\ufe0f",
        "I fall in love with you all over again every day, Arpa \u2764\ufe0f",
        "Just a reminder: you are deeply loved, Arpa \u2764\ufe0f",
        "Your happiness is my greatest treasure, Arpa \u2764\ufe0f",
        "You are the queen of my heart, Arpa \u2764\ufe0f",
        "Life is so much more beautiful with you by my side, Arpa \u2764\ufe0f",
        "You are the best wife and the most amazing mother, Arpa \u2764\ufe0f",
        "Your love fills my heart with endless joy, Arpa \u2764\ufe0f",
        "I cherish every second I get to spend with you, Arpa \u2764\ufe0f",
        "You are the dream I never want to wake up from, Arpa \u2764\ufe0f",
        "Thank you for being the light of my life, Arpa \u2764\ufe0f",
        "You are my forever and always, Arpa \u2764\ufe0f",
        "Your eyes shine brighter than the stars, Arpa \u2764\ufe0f",
        "I am the luckiest man alive to call you mine, Arpa \u2764\ufe0f",
        "You bring so much peace and love into our home, Arpa \u2764\ufe0f",
        "Every day I love you more than the day before, Arpa \u2764\ufe0f",
        "You are my soulmate and my best friend, Arpa \u2764\ufe0f",
        "Your kindness and beauty amaze me every single day, Arpa \u2764\ufe0f",
        "You make our family whole and perfect, Arpa \u2764\ufe0f",
        "I will love you until the end of time, Arpa \u2764\ufe0f",
        "You are the sweetest part of my life, Arpa \u2764\ufe0f"
    ];

    function showSplash() {
        const splash = document.getElementById('splash');
        const app = document.getElementById('app');
        const greetingEl = document.getElementById('greeting');
        const splashCompliment = document.getElementById('splash-compliment');
        
        const hour = new Date().getHours();
        let greeting = "Hello, Arpa";
        if (hour >= 5 && hour < 12) greeting = "Good Morning, Arpa \u2764\ufe0f";
        else if (hour >= 12 && hour < 17) greeting = "Good Afternoon, Arpa \u2764\ufe0f";
        else if (hour >= 17 && hour < 21) greeting = "Good Evening, Arpa \u2764\ufe0f";
        else greeting = "Good Night, Arpa \u2764\ufe0f";
        
        if (greetingEl) greetingEl.textContent = greeting;
        
        if (splashCompliment) {
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const messageIndex = dayOfYear % romanticMessages.length;
            
            splashCompliment.textContent = romanticMessages[messageIndex];
            // Add a slight fade-in effect to the compliment
            splashCompliment.style.opacity = '0';
            setTimeout(() => {
                splashCompliment.style.transition = 'opacity 1s ease-in-out';
                splashCompliment.style.opacity = '1';
            }, 500);
        }

        setTimeout(() => {
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
            }
            if (app) app.classList.remove('hidden');
        }, 5000);
    }
    function setupDataManagement() {
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data-btn');
        const importFile = document.getElementById('import-file');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = localStorage.getItem('arpa_cycles');
                if (!data) {
                    alert("No data found to backup!");
                    return;
                }
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `arpa_luna_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        if (Array.isArray(importedData)) {
                            if (confirm("This will replace all current history with the backup file. Are you sure?")) {
                                localStorage.setItem('arpa_cycles', JSON.stringify(importedData));
                                alert("Data restored successfully!");
                                window.location.reload();
                            }
                        } else {
                            alert("Invalid backup file format.");
                        }
                    } catch (err) {
                        alert("Error reading backup file.");
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    initApp();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('Luna Offline Ready');
        }).catch(err => {
            console.log('Offline setup failed', err);
        });
    });
}







