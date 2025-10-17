/**
 * Form Module
 * Handles form submission, validation, and Netlify Forms integration
 */

import { getCurrentResponses, highlightIncompleteGroups, getQuestions } from './questions.js';
import { calculateScores, validateResponses } from './scoring.js';
import { updateProgress, showValidationError, hideValidationError, setSubmitButtonState, showLoadingState, showResultsSummary } from './ui.js';

const SHOW_RESULTS = true; // Toggle to show/hide results preview before submit
const TOTAL_GROUPS = 15;

let currentResponses = {};

/**
 * Initialize form handling
 */
export function initializeForm() {
    const form = document.getElementById('assessmentForm');
    if (!form) {
        console.error('Assessment form not found');
        return;
    }

    // Set up form submission handler
    form.addEventListener('submit', handleSubmit);

    // Set up change handlers for progress tracking
    setupChangeHandlers();

    // Enable page leave warning when user starts filling out form
    let hasStarted = false;
    form.addEventListener('change', () => {
        if (!hasStarted) {
            hasStarted = true;
            // Note: Page leave warning is handled by the form's native submission
        }
    });

    console.log('Form initialized');
}

/**
 * Set up change handlers for all form inputs
 */
function setupChangeHandlers() {
    // This is called after questions are rendered
    document.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            handleRadioChange();
        }
    });
}

/**
 * Handle radio button changes
 */
function handleRadioChange() {
    currentResponses = getCurrentResponses();
    const completed = updateProgress(currentResponses, TOTAL_GROUPS);
    
    // Enable submit button only if all groups are complete
    const validation = validateResponses(currentResponses, TOTAL_GROUPS);
    setSubmitButtonState(validation.isValid);
    
    // Optionally show results preview
    if (SHOW_RESULTS && validation.isValid) {
        const items = getQuestions();
        const results = calculateScores(currentResponses, items);
        showResultsSummary(results);
    }
    
    // Clear any validation errors
    if (validation.isValid) {
        hideValidationError();
        highlightIncompleteGroups([]);
    }
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    // Get current responses
    currentResponses = getCurrentResponses();
    
    // Validate responses
    const validation = validateResponses(currentResponses, TOTAL_GROUPS);
    
    if (!validation.isValid) {
        const count = validation.missingGroups.length;
        showValidationError(
            `Please complete all ${count} remaining ${count === 1 ? 'group' : 'groups'} before submitting.`
        );
        highlightIncompleteGroups(validation.missingGroups);
        return;
    }
    
    // Calculate scores
    const items = getQuestions();
    const results = calculateScores(currentResponses, items);
    
    console.log('Calculated DISC Scores:', results);
    
    // Inject scores into hidden form fields
    injectScores(results);
    
    // Show loading state
    showLoadingState();
    
    // Allow the form to submit naturally to Netlify
    // The setTimeout ensures the hidden fields are populated before submission
    setTimeout(() => {
        e.target.submit();
    }, 100);
}

/**
 * Inject calculated scores into hidden form fields
 * @param {Object} results - Scoring results
 */
function injectScores(results) {
    const { scores, primaryType, typeOrder, debug } = results;
    
    // Set score fields
    setHiddenFieldValue('score_D', scores.D);
    setHiddenFieldValue('score_I', scores.I);
    setHiddenFieldValue('score_S', scores.S);
    setHiddenFieldValue('score_C', scores.C);
    
    // Set analysis fields
    setHiddenFieldValue('primary_type', primaryType);
    setHiddenFieldValue('type_order', typeOrder);
    setHiddenFieldValue('debug_vector', debug);
    
    console.log('Injected scores into hidden fields:', {
        D: scores.D,
        I: scores.I,
        S: scores.S,
        C: scores.C,
        primaryType,
        typeOrder
    });
}

/**
 * Set value of a hidden form field
 * @param {string} fieldId - ID of the field
 * @param {*} value - Value to set
 */
function setHiddenFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value;
    } else {
        console.warn(`Hidden field not found: ${fieldId}`);
    }
}

/**
 * Get all form data including responses and scores
 * @returns {Object} - Complete form data
 */
export function getFormData() {
    const form = document.getElementById('assessmentForm');
    if (!form) return null;
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Validate candidate information fields
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export function validateCandidateInfo() {
    const errors = [];
    
    const fullName = document.getElementById('full_name');
    const email = document.getElementById('email');
    const role = document.getElementById('role_applied_for');
    
    if (!fullName || !fullName.value.trim()) {
        errors.push('Full name is required');
    }
    
    if (!email || !email.value.trim()) {
        errors.push('Email is required');
    } else if (!isValidEmail(email.value)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!role || !role.value.trim()) {
        errors.push('Role applied for is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Reset form (for testing)
 */
export function resetForm() {
    const form = document.getElementById('assessmentForm');
    if (form) {
        form.reset();
        currentResponses = {};
        updateProgress({}, TOTAL_GROUPS);
        setSubmitButtonState(false);
        hideValidationError();
        highlightIncompleteGroups([]);
        
        const summaryContainer = document.getElementById('resultsSummary');
        if (summaryContainer) {
            summaryContainer.classList.add('hidden');
            summaryContainer.innerHTML = '';
        }
    }
}

export default {
    initializeForm,
    getFormData,
    validateCandidateInfo,
    resetForm
};
