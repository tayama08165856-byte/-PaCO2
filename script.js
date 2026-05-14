// Elements
const heightInput = document.getElementById('height');
const genderInput = document.getElementById('gender');
const mlkgInput = document.getElementById('mlkg');
const rrInput = document.getElementById('rr');
const tvInput = document.getElementById('tv');

const ibwRes = document.getElementById('ibw-res');
const mvRes = document.getElementById('mv-res');

const currentMvInput = document.getElementById('current-mv');
const currentPaco2Input = document.getElementById('current-paco2');
const targetPaco2Input = document.getElementById('target-paco2');
const targetMvRes = document.getElementById('target-mv-res');
const ratioRes = document.getElementById('ratio-res');

const mvTableBody = document.querySelector('#mv-table tbody');
const tvTableInput = document.getElementById('tv-table');

// Constants
const IBW_CONST = 152.4;
const IBW_FACTOR = 0.91;
const MALE_BASE = 50;
const FEMALE_BASE = 45.5;

function calculateIBW(height, gender) {
    const base = gender === 'male' ? MALE_BASE : FEMALE_BASE;
    if (height < 152.4) return base; // Prevent negative additions for very short heights in this simple formula
    return base + IBW_FACTOR * (height - IBW_CONST);
}



/**
 * 設定（ml/kg）が変更された際の処理
 * 指定されたml/kgに基づいて1回換気量を自動計算する
 */
function updateByCalc() {
    const height = parseFloat(heightInput.value);
    const gender = genderInput.value;
    const mlkg = parseFloat(mlkgInput.value);

    if (isNaN(height) || isNaN(mlkg)) return;

    const ibw = calculateIBW(height, gender);
    const tv = Math.round(ibw * mlkg);

    tvInput.textContent = tv;
    tvTableInput.value = tv;
    
    updateResultsAndTable();
}

/**
 * 1回換気量が直接入力された際の処理
 * ml/kgを再計算し、結果を更新する
 */
function updateByTv() {
    const tv = parseFloat(tvInput.textContent);
    const height = parseFloat(heightInput.value);
    const gender = genderInput.value;

    if (isNaN(tv)) {
        tvTableInput.value = '';
        updateResultsAndTable();
        return;
    }

    const ibw = calculateIBW(height, gender);
    if (ibw > 0) {
        mlkgInput.value = (tv / ibw).toFixed(1);
    }
    
    tvTableInput.value = tv;
    updateResultsAndTable();
}

/**
 * 早見表タブ内の1回換気量が変更された際の処理
 */
function updateByTableTv() {
    const tv = parseFloat(tvTableInput.value);
    if (isNaN(tv)) return;
    
    tvInput.textContent = tv;
    updateByTv();
}

function updateResultsAndTable() {
    const height = parseFloat(heightInput.value);
    const gender = genderInput.value;
    const tv = parseFloat(tvInput.textContent) || 0;
    const rr = parseFloat(rrInput.value) || 12;

    const ibw = calculateIBW(height, gender);
    const mv = (tv * rr) / 1000;

    ibwRes.innerHTML = `${ibw.toFixed(1)} <span class="result-unit">kg</span>`;
    mvRes.innerHTML = `${mv.toFixed(2)} <span class="result-unit">L/min</span>`;

    updateTable(tv);
}

function updatePaCO2() {
    const currentMv = parseFloat(currentMvInput.value);
    const currentPaco2 = parseFloat(currentPaco2Input.value);
    const targetPaco2 = parseFloat(targetPaco2Input.value);

    if (isNaN(currentMv) || isNaN(currentPaco2) || isNaN(targetPaco2) || targetPaco2 === 0) {
        targetMvRes.innerHTML = `- <span class="result-unit">L/min</span>`;
        ratioRes.innerHTML = `- <span class="result-unit">%</span>`;
        return;
    }

    const targetMv = (currentMv * currentPaco2) / targetPaco2;
    const ratio = (targetMv / currentMv) * 100;

    targetMvRes.innerHTML = `${targetMv.toFixed(2)} <span class="result-unit">L/min</span>`;
    ratioRes.innerHTML = `${ratio.toFixed(0)} <span class="result-unit">%</span>`;
}

function updateTable(tv) {
    mvTableBody.innerHTML = '';
    const currentRR = parseInt(rrInput.value) || 12;

    for (let r = 5; r <= 50; r++) {
        const mv = (tv * r) / 1000;
        const row = document.createElement('tr');
        if (r === currentRR) row.classList.add('highlight');
        
        row.innerHTML = `
            <td>${r}</td>
            <td>${mv.toFixed(2)}</td>
            <td>${((mv/8)*100).toFixed(0)}%</td>
        `;
        mvTableBody.appendChild(row);
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tab}-section`).classList.remove('hidden');
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
}

// Event Listeners
[heightInput, genderInput].forEach(el => {
    el.addEventListener('input', updateByCalc);
});

mlkgInput.addEventListener('input', updateByCalc);
rrInput.addEventListener('input', updateResultsAndTable);
tvTableInput.addEventListener('input', updateByTableTv);

[currentMvInput, currentPaco2Input, targetPaco2Input].forEach(el => {
    el.addEventListener('input', updatePaCO2);
});

// Initialize
updateByCalc();
updatePaCO2();

