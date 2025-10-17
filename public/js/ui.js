/**
 * UI Module
 * Handles progress bar, validation feedback, and other UX enhancements
 */

/**
 * Initialize progress bar
 * @param {number} totalGroups - Total number of question groups
 */
export function initializeProgressBar(totalGroups) {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.setAttribute('max', totalGroups);
        progressBar.setAttribute('value', '0');
    }
    updateProgressDisplay(0, totalGroups);
}

/**
 * Update progress bar based on completed groups
 * @param {Object} responses - Current responses object
 * @param {number} totalGroups - Total number of groups
 */
export function updateProgress(responses, totalGroups) {
    let completed = 0;

    for (let i = 1; i <= totalGroups; i++) {
        const response = responses[i];
        if (response && response.most && response.least && response.most !== response.least) {
            completed++;
        }
    }

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.value = completed;
    }

    updateProgressDisplay(completed, totalGroups);
    
    return completed;
}

/**
 * Update progress text display
 * @param {number} completed - Number of completed groups
 * @param {number} total - Total number of groups
 */
function updateProgressDisplay(completed, total) {
    const progressText = document.getElementById('progressText');
    if (progressText) {
        const percentage = Math.round((completed / total) * 100);
        progressText.textContent = `${completed} of ${total} completed (${percentage}%)`;
    }
}

/**
 * Show validation error message
 * @param {string} message - Error message to display
 */
export function showValidationError(message) {
    const errorContainer = document.getElementById('validationError');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideValidationError();
        }, 5000);
    }
}

/**
 * Hide validation error message
 */
export function hideValidationError() {
    const errorContainer = document.getElementById('validationError');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
        errorContainer.textContent = '';
    }
}

/**
 * Enable or disable submit button
 * @param {boolean} enabled - Whether button should be enabled
 */
export function setSubmitButtonState(enabled) {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = !enabled;
        if (enabled) {
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            submitBtn.classList.add('hover:bg-blue-700');
        } else {
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            submitBtn.classList.remove('hover:bg-blue-700');
        }
    }
}

/**
 * Show loading state on submit button
 */
export function showLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
        `;
    }
}

/**
 * Show results summary (optional feature)
 * @param {Object} results - Scoring results
 */
export function showResultsSummary(results) {
    const summaryContainer = document.getElementById('resultsSummary');
    if (!summaryContainer) return;

    const { scores, primaryType, typeOrder } = results;

    summaryContainer.innerHTML = `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Your DISC Profile Preview</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600">D: ${scores.D}</div>
                    <div class="text-sm text-gray-600">Dominance</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-600">I: ${scores.I}</div>
                    <div class="text-sm text-gray-600">Influence</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-yellow-600">S: ${scores.S}</div>
                    <div class="text-sm text-gray-600">Steadiness</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-purple-600">C: ${scores.C}</div>
                    <div class="text-sm text-gray-600">Conscientiousness</div>
                </div>
            </div>
            <div class="border-t pt-4">
                <p class="text-gray-700">
                    <strong>Primary Type:</strong> ${primaryType}
                </p>
                <p class="text-gray-700">
                    <strong>Type Order:</strong> ${typeOrder}
                </p>
            </div>
        </div>
    `;
    
    summaryContainer.classList.remove('hidden');
}

/**
 * Add smooth scroll behavior to navigation
 */
export function enableSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Show confirmation dialog before leaving page
 * @param {boolean} enable - Whether to enable the warning
 */
export function setPageLeaveWarning(enable) {
    if (enable) {
        window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
}

function handleBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = '';
    return '';
}

/**
 * Initialize tooltips (if needed)
 */
export function initializeTooltips() {
    // Placeholder for tooltip initialization
    // Can be expanded if needed
}

/**
 * Create a simple bar chart for DISC scores (SVG)
 * @param {Object} scores - DISC scores
 * @returns {string} - SVG markup
 */
export function createScoreChart(scores) {
    const max = Math.max(...Object.values(scores).map(Math.abs), 10);
    const scale = 100 / max;
    
    const colors = {
        D: '#3B82F6',
        I: '#10B981',
        S: '#F59E0B',
        C: '#8B5CF6'
    };

    const bars = Object.entries(scores).map(([dim, score], index) => {
        const height = Math.abs(score * scale);
        const y = score >= 0 ? 100 - height : 100;
        const fill = colors[dim];
        const x = index * 60 + 10;

        return `
            <g>
                <rect x="${x}" y="${y}" width="40" height="${height}" fill="${fill}" />
                <text x="${x + 20}" y="${y - 5}" text-anchor="middle" font-size="14" font-weight="bold">${score}</text>
                <text x="${x + 20}" y="220" text-anchor="middle" font-size="16" font-weight="bold">${dim}</text>
            </g>
        `;
    }).join('');

    return `
        <svg viewBox="0 0 260 240" class="w-full max-w-md mx-auto">
            <line x1="0" y1="100" x2="260" y2="100" stroke="#ccc" stroke-width="2" />
            ${bars}
        </svg>
    `;
}

/**
 * Animate progress bar
 * @param {number} from - Starting value
 * @param {number} to - Ending value
 * @param {number} duration - Animation duration in ms
 */
export function animateProgressBar(from, to, duration = 300) {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    const start = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = from + (to - from) * progress;
        
        progressBar.value = value;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

export default {
    initializeProgressBar,
    updateProgress,
    showValidationError,
    hideValidationError,
    setSubmitButtonState,
    showLoadingState,
    showResultsSummary,
    enableSmoothScroll,
    setPageLeaveWarning,
    createScoreChart,
    animateProgressBar
};
