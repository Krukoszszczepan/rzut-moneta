document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const coin = document.getElementById('coin');
    
    // Obsługa trybu ciemnego
    themeToggle.addEventListener('change', () => {
        body.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
    });
    const startButton = document.getElementById('start');
    const simulationsInput = document.getElementById('simulations');
    const progressBar = document.querySelector('.progress-bar');
    const headsCount = document.getElementById('heads-count');
    const tailsCount = document.getElementById('tails-count');
    const maxHeadsStreak = document.getElementById('max-heads-streak');
    const maxTailsStreak = document.getElementById('max-tails-streak');
    const avgHeadsStreak = document.getElementById('avg-heads-streak');
    const avgTailsStreak = document.getElementById('avg-tails-streak');
    const stdHeads = document.getElementById('std-heads');
    const stdTails = document.getElementById('std-tails');
    const headsProb = document.getElementById('heads-prob');
    const tailsProb = document.getElementById('tails-prob');
    const historyIcons = document.getElementById('history-icons');

    let isSimulating = false;
    let currentHeadsStreak = 0;
    let currentTailsStreak = 0;
    let headsStreaks = [];
    let tailsStreaks = [];

    function flipCoin() {
        coin.classList.add('flipping');
        setTimeout(() => {
            coin.classList.remove('flipping');
        }, 500);
    }

    function getRandomResult() {
        return Math.random() < 0.5 ? 'heads' : 'tails';
    }

    function updateStats(result, stats) {
        if (result === 'heads') {
            stats.heads++;
            currentHeadsStreak++;
            if (currentTailsStreak > 0) {
                tailsStreaks.push(currentTailsStreak);
                currentTailsStreak = 0;
            }
        } else {
            stats.tails++;
            currentTailsStreak++;
            if (currentHeadsStreak > 0) {
                headsStreaks.push(currentHeadsStreak);
                currentHeadsStreak = 0;
            }
        }

        stats.maxHeadsStreak = Math.max(stats.maxHeadsStreak, currentHeadsStreak);
        stats.maxTailsStreak = Math.max(stats.maxTailsStreak, currentTailsStreak);
    }

    function calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
    }

    function calculateStdDev(arr) {
        if (arr.length === 0) return 0;
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / arr.length;
        return Math.sqrt(avgSquareDiff).toFixed(2);
    }

function updateUI(stats, progress, result) {
    headsCount.textContent = stats.heads;
    tailsCount.textContent = stats.tails;
    maxHeadsStreak.textContent = stats.maxHeadsStreak;
    maxTailsStreak.textContent = stats.maxTailsStreak;
    
    // Oblicz zaawansowane statystyki
    const total = stats.heads + stats.tails;
    const avgHeads = calculateAverage(headsStreaks);
    const avgTails = calculateAverage(tailsStreaks);
    const calculatedStdHeads = calculateStdDev(headsStreaks);
    const calculatedStdTails = calculateStdDev(tailsStreaks);
    const calculatedHeadsProb = total > 0 ? ((stats.heads / total) * 100).toFixed(2) : 0;
    const calculatedTailsProb = total > 0 ? ((stats.tails / total) * 100).toFixed(2) : 0;

    // Aktualizuj UI
    avgHeadsStreak.textContent = avgHeads;
    avgTailsStreak.textContent = avgTails;
    stdHeads.textContent = calculatedStdHeads;
    stdTails.textContent = calculatedStdTails;
    headsProb.textContent = `${calculatedHeadsProb}%`;
    tailsProb.textContent = `${calculatedTailsProb}%`;
    progressBar.style.width = `${progress}%`;
    
    // Dodaj ikonę do historii
    if (result) {
        const icon = document.createElement('div');
        icon.className = `history-icon ${result}`;
        icon.innerHTML = `<i class="fa-solid fa-${result === 'heads' ? 'dollar-sign' : 'euro-sign'}"></i>`;
        historyIcons.appendChild(icon);
        historyIcons.scrollTop = historyIcons.scrollHeight;
    }
}

    async function runSimulation(totalSimulations) {
        if (isSimulating) return;
        isSimulating = true;
        startButton.disabled = true;
        historyIcons.innerHTML = ''; // Wyczyść historię

        const stats = {
            heads: 0,
            tails: 0,
            maxHeadsStreak: 0,
            maxTailsStreak: 0
        };
        headsStreaks = [];
        tailsStreaks = [];

        const batchSize = 1000;
        const totalBatches = Math.ceil(totalSimulations / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            if (!isSimulating) break;

            const start = batch * batchSize;
            const end = Math.min(start + batchSize, totalSimulations);

            for (let i = start; i < end; i++) {
                const result = getRandomResult();
                updateStats(result, stats);
                
                // Aktualizuj UI tylko co 100 rzutów dla optymalizacji
                if (i % 100 === 0 || i === totalSimulations - 1) {
                    updateUI(stats, ((i + 1) / totalSimulations) * 100, result);
                }
            }

            // Dla dużych wartości nie pokazuj każdego rzutu w historii
            if (totalSimulations <= 10000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            } else {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // Ostatnia aktualizacja UI
        updateUI(stats, 100, null);
        isSimulating = false;
        startButton.disabled = false;
    }

    startButton.addEventListener('click', () => {
        const totalSimulations = parseInt(simulationsInput.value);
        if (totalSimulations > 0) {
            runSimulation(totalSimulations);
        }
    });
});
