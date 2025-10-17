/**
 * DISC Assessment - Likert Scale Scoring
 * Standalone vanilla JavaScript (no modules)
 */

(function() {
    'use strict';

    // Style descriptions
    const STYLE_DESCRIPTIONS = {
        D: {
            name: 'Dominance',
            traits: 'Direct, decisive, goal-oriented leaders who take charge and drive results.',
            strengths: 'Strong leadership, quick decision-making, results-focused, competitive, confident.',
            worksWith: 'Provide autonomy, clear goals, and opportunities to lead. Be direct and concise.',
            roles: 'Leadership, Project Management, Sales, Entrepreneurship'
        },
        I: {
            name: 'Influence',
            traits: 'Social, persuasive, enthusiastic communicators who inspire and energize others.',
            strengths: 'Excellent communication, persuasive, optimistic, collaborative, relationship-building.',
            worksWith: 'Provide recognition, collaboration opportunities, and social interaction. Keep things positive.',
            roles: 'Sales, Marketing, Public Relations, Customer Relations, Team Leadership'
        },
        S: {
            name: 'Steadiness',
            traits: 'Patient, reliable, supportive team players who value stability and harmony.',
            strengths: 'Dependable, patient, great listeners, team-oriented, calm under pressure.',
            worksWith: 'Provide stability, clear expectations, and time to adapt to change. Show appreciation.',
            roles: 'Customer Service, Human Resources, Healthcare, Administration, Support Roles'
        },
        C: {
            name: 'Conscientiousness',
            traits: 'Analytical, precise, quality-driven contributors who value accuracy and systems.',
            strengths: 'Attention to detail, analytical thinking, systematic, quality-focused, thorough.',
            worksWith: 'Provide clear standards, time for analysis, and respect for quality. Minimize surprises.',
            roles: 'Data Analysis, Engineering, Accounting, Research, Quality Assurance, Compliance'
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const form = document.getElementById('discForm');
        if (!form) {
            console.error('DISC form not found');
            return;
        }

        form.addEventListener('submit', handleSubmit);
        
        // Add progress tracking
        initializeProgressTracking();
        
        console.log('DISC assessment initialized');
    }

    /**
     * Initialize progress tracking
     */
    function initializeProgressTracking() {
        const form = document.getElementById('discForm');
        
        // Listen for any radio button changes
        form.addEventListener('change', function(e) {
            if (e.target.type === 'radio') {
                updateProgress();
            }
        });
        
        // Initial progress update
        updateProgress();
    }

    /**
     * Update progress bar and text
     */
    function updateProgress() {
        const totalQuestions = 24;
        let answeredCount = 0;
        
        // Count how many questions have been answered
        for (let i = 1; i <= totalQuestions; i++) {
            const radios = document.querySelectorAll(`input[name="q${i}"]`);
            const answered = Array.from(radios).some(radio => radio.checked);
            if (answered) {
                answeredCount++;
            }
        }
        
        // Calculate percentage
        const percentage = Math.round((answeredCount / totalQuestions) * 100);
        
        // Update progress text
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = `${answeredCount} of ${totalQuestions} completed (${percentage}%)`;
        }
        
        // Update progress bar
        const progressBar = document.getElementById('progressBarFill');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        // Add celebratory effect at milestones
        if (answeredCount === totalQuestions && answeredCount > 0) {
            progressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
            // Subtle pulse animation
            progressBar.style.animation = 'pulse 0.5s ease-in-out';
        }
    }

    /**
     * Handle form submission
     */
    function handleSubmit(event) {
        event.preventDefault();

        const form = event.target;
        
        // Validate all questions answered
        if (!validateForm(form)) {
            alert('Please answer all 24 questions before submitting.');
            return;
        }

        // Calculate scores
        const scores = calculateScores(form);
        console.log('Calculated scores:', scores);

        // Populate hidden fields
        populateHiddenFields(scores);

        // Submit via AJAX
        submitViaAjax(form, scores);
    }

    /**
     * Validate that all questions are answered
     */
    function validateForm(form) {
        for (let i = 1; i <= 24; i++) {
            const radios = form.querySelectorAll(`input[name="q${i}"]`);
            const checked = Array.from(radios).some(radio => radio.checked);
            if (!checked) {
                return false;
            }
        }
        return true;
    }

    /**
     * Calculate DISC scores from form data
     */
    function calculateScores(form) {
        // Sum questions 1-6 for D, 7-12 for I, 13-18 for S, 19-24 for C
        const scores = {
            D: sumQuestions(form, 1, 6),
            I: sumQuestions(form, 7, 12),
            S: sumQuestions(form, 13, 18),
            C: sumQuestions(form, 19, 24)
        };

        // Determine primary and secondary styles
        const ranked = rankStyles(scores, form);
        
        return {
            totals: scores,
            primary: ranked[0],
            secondary: ranked[1],
            vector: JSON.stringify(scores)
        };
    }

    /**
     * Sum Likert responses for a range of questions
     */
    function sumQuestions(form, start, end) {
        let total = 0;
        for (let i = start; i <= end; i++) {
            const selected = form.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                total += parseInt(selected.value, 10);
            }
        }
        return total;
    }

    /**
     * Rank DISC styles by score (with tie-breaking logic)
     */
    function rankStyles(scores, form) {
        // Create array of [style, score, high_count] for sorting
        const styles = Object.keys(scores).map(style => {
            const score = scores[style];
            const highCount = countHighAnswers(form, style);
            return { style, score, highCount };
        });

        // Sort by score (desc), then by high answer count (desc), then canonical order
        const canonicalOrder = { D: 0, I: 1, S: 2, C: 3 };
        styles.sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            if (a.highCount !== b.highCount) return b.highCount - a.highCount;
            return canonicalOrder[a.style] - canonicalOrder[b.style];
        });

        return styles.map(s => s.style);
    }

    /**
     * Count how many 4 or 5 answers for a given style
     */
    function countHighAnswers(form, style) {
        const ranges = { D: [1, 6], I: [7, 12], S: [13, 18], C: [19, 24] };
        const [start, end] = ranges[style];
        let count = 0;

        for (let i = start; i <= end; i++) {
            const selected = form.querySelector(`input[name="q${i}"]:checked`);
            if (selected && (selected.value === '4' || selected.value === '5')) {
                count++;
            }
        }
        return count;
    }

    /**
     * Populate hidden form fields with scores
     */
    function populateHiddenFields(scores) {
        document.getElementById('total_D').value = scores.totals.D;
        document.getElementById('total_I').value = scores.totals.I;
        document.getElementById('total_S').value = scores.totals.S;
        document.getElementById('total_C').value = scores.totals.C;
        document.getElementById('primary_style').value = scores.primary;
        document.getElementById('secondary_style').value = scores.secondary;
        document.getElementById('style_vector').value = scores.vector;
    }

    /**
     * Submit form via AJAX (with fallback to native submit)
     */
    function submitViaAjax(form, scores) {
        const formData = new FormData(form);

        fetch(window.location.pathname, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Success - show results inline
                renderResults(scores);
                // Scroll to results
                document.getElementById('results').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            } else {
                // Fallback to native submit on error
                console.warn('AJAX submit failed, falling back to native submit');
                form.submit();
            }
        })
        .catch(error => {
            // Network error - fallback to native submit
            console.error('AJAX submit error:', error);
            console.log('Falling back to native form submission');
            form.submit();
        });
    }

    /**
     * Render results in the #results section
     */
    function renderResults(scores) {
        // Show results section
        const resultsSection = document.getElementById('results');
        resultsSection.classList.remove('hidden');

        // Update score displays
        document.getElementById('result_D').textContent = scores.totals.D;
        document.getElementById('result_I').textContent = scores.totals.I;
        document.getElementById('result_S').textContent = scores.totals.S;
        document.getElementById('result_C').textContent = scores.totals.C;

        // Update primary/secondary
        document.getElementById('result_primary').textContent = 
            `${STYLE_DESCRIPTIONS[scores.primary].name} (${scores.primary})`;
        document.getElementById('result_secondary').textContent = 
            `${STYLE_DESCRIPTIONS[scores.secondary].name} (${scores.secondary})`;

        // Render style description
        renderStyleDescription(scores.primary);
    }

    /**
     * Render detailed description for primary style
     */
    function renderStyleDescription(style) {
        const desc = STYLE_DESCRIPTIONS[style];
        const container = document.getElementById('styleDescription');

        container.innerHTML = `
            <h4 class="text-lg font-bold text-gray-900 mb-3">${desc.name} (${style})</h4>
            <p class="text-gray-700 mb-4">${desc.traits}</p>
            
            <div class="mb-4">
                <p class="font-semibold text-gray-800 mb-2">Key Strengths:</p>
                <p class="text-gray-700">${desc.strengths}</p>
            </div>
            
            <div class="mb-4">
                <p class="font-semibold text-gray-800 mb-2">How to Work With This Style:</p>
                <p class="text-gray-700">${desc.worksWith}</p>
            </div>
            
            <div>
                <p class="font-semibold text-gray-800 mb-2">Best Fit Roles:</p>
                <p class="text-gray-700">${desc.roles}</p>
            </div>
        `;
    }

})();
