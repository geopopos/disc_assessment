/**
 * Questions Module
 * Handles loading and rendering DISC assessment questions
 */

let questionItems = [];

/**
 * Load question data from JSON file
 * @returns {Promise<Array>} - Array of question groups
 */
export async function loadQuestions() {
    try {
        const response = await fetch('/data/disc_items.json');
        if (!response.ok) {
            throw new Error(`Failed to load questions: ${response.status}`);
        }
        questionItems = await response.json();
        return questionItems;
    } catch (error) {
        console.error('Error loading questions:', error);
        throw error;
    }
}

/**
 * Get loaded question items
 * @returns {Array} - Array of question groups
 */
export function getQuestions() {
    return questionItems;
}

/**
 * Render question groups to container
 * @param {HTMLElement} container - Container element to render into
 * @param {Function} onChangeCallback - Callback when selection changes
 */
export function renderQuestions(container, onChangeCallback) {
    if (!container) {
        console.error('Container element not found');
        return;
    }

    container.innerHTML = '';

    questionItems.forEach(group => {
        const groupElement = createGroupElement(group, onChangeCallback);
        container.appendChild(groupElement);
    });
}

/**
 * Create a single question group element
 * @param {Object} group - Question group data
 * @param {Function} onChangeCallback - Callback when selection changes
 * @returns {HTMLElement} - Rendered group element
 */
function createGroupElement(group, onChangeCallback) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'question-group bg-white rounded-lg shadow-md p-6 mb-6';
    groupDiv.id = `group-${group.id}`;
    groupDiv.setAttribute('data-group-id', group.id);

    // Create fieldset for accessibility
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'border-0 p-0 m-0';

    // Legend
    const legend = document.createElement('legend');
    legend.className = 'text-lg font-semibold text-gray-800 mb-4';
    legend.textContent = `Question ${group.id} of 24`;
    fieldset.appendChild(legend);

    // Instructions
    const instructions = document.createElement('p');
    instructions.className = 'text-sm text-gray-600 mb-4';
    instructions.textContent = 'Select one adjective that is MOST like you and one that is LEAST like you:';
    fieldset.appendChild(instructions);

    // Create table for Most/Least selections
    const table = document.createElement('div');
    table.className = 'grid grid-cols-1 md:grid-cols-3 gap-4';

    // Header row
    const headerDiv = document.createElement('div');
    headerDiv.className = 'hidden md:block';
    table.appendChild(headerDiv);

    const mostHeader = document.createElement('div');
    mostHeader.className = 'text-center font-semibold text-gray-700';
    mostHeader.textContent = 'Most Like Me';
    table.appendChild(mostHeader);

    const leastHeader = document.createElement('div');
    leastHeader.className = 'text-center font-semibold text-gray-700';
    leastHeader.textContent = 'Least Like Me';
    table.appendChild(leastHeader);

    // Render each adjective row
    group.items.forEach((item, index) => {
        // Adjective label (mobile/desktop)
        const labelDiv = document.createElement('div');
        labelDiv.className = 'flex items-center justify-between md:justify-start font-medium text-gray-800 py-2';
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = item.label;
        labelDiv.appendChild(labelSpan);
        
        // Mobile headers
        const mobileHeaders = document.createElement('span');
        mobileHeaders.className = 'md:hidden text-sm text-gray-500 ml-4';
        mobileHeaders.textContent = 'Most | Least';
        labelDiv.appendChild(mobileHeaders);
        
        table.appendChild(labelDiv);

        // Most radio button
        const mostDiv = document.createElement('div');
        mostDiv.className = 'flex justify-center items-center';
        
        const mostRadio = document.createElement('input');
        mostRadio.type = 'radio';
        mostRadio.name = `g${group.id}_most`;
        mostRadio.value = item.label;
        mostRadio.id = `g${group.id}_most_${index}`;
        mostRadio.className = 'w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer';
        mostRadio.setAttribute('aria-label', `${item.label} - Most like me`);
        mostRadio.addEventListener('change', () => {
            if (onChangeCallback) onChangeCallback(group.id);
        });
        
        const mostLabel = document.createElement('label');
        mostLabel.htmlFor = mostRadio.id;
        mostLabel.className = 'sr-only';
        mostLabel.textContent = `${item.label} - Most like me`;
        
        mostDiv.appendChild(mostRadio);
        mostDiv.appendChild(mostLabel);
        table.appendChild(mostDiv);

        // Least radio button
        const leastDiv = document.createElement('div');
        leastDiv.className = 'flex justify-center items-center';
        
        const leastRadio = document.createElement('input');
        leastRadio.type = 'radio';
        leastRadio.name = `g${group.id}_least`;
        leastRadio.value = item.label;
        leastRadio.id = `g${group.id}_least_${index}`;
        leastRadio.className = 'w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer';
        leastRadio.setAttribute('aria-label', `${item.label} - Least like me`);
        leastRadio.addEventListener('change', () => {
            if (onChangeCallback) onChangeCallback(group.id);
        });
        
        const leastLabel = document.createElement('label');
        leastLabel.htmlFor = leastRadio.id;
        leastLabel.className = 'sr-only';
        leastLabel.textContent = `${item.label} - Least like me`;
        
        leastDiv.appendChild(leastRadio);
        leastDiv.appendChild(leastLabel);
        table.appendChild(leastDiv);
    });

    fieldset.appendChild(table);

    // Validation message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message hidden text-red-600 text-sm mt-2';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.id = `error-${group.id}`;
    fieldset.appendChild(errorDiv);

    groupDiv.appendChild(fieldset);
    return groupDiv;
}

/**
 * Get current responses from the form
 * @returns {Object} - Object with groupId as keys, {most: string, least: string} as values
 */
export function getCurrentResponses() {
    const responses = {};

    questionItems.forEach(group => {
        const mostRadio = document.querySelector(`input[name="g${group.id}_most"]:checked`);
        const leastRadio = document.querySelector(`input[name="g${group.id}_least"]:checked`);

        responses[group.id] = {
            most: mostRadio ? mostRadio.value : null,
            least: leastRadio ? leastRadio.value : null
        };
    });

    return responses;
}

/**
 * Highlight incomplete or invalid groups
 * @param {Array} groupIds - Array of group IDs to highlight
 */
export function highlightIncompleteGroups(groupIds) {
    // Clear all existing highlights
    document.querySelectorAll('.question-group').forEach(group => {
        group.classList.remove('border-2', 'border-red-500');
        const errorDiv = group.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
        }
    });

    // Highlight incomplete groups
    groupIds.forEach(groupId => {
        const groupElement = document.getElementById(`group-${groupId}`);
        if (groupElement) {
            groupElement.classList.add('border-2', 'border-red-500');
            
            const errorDiv = groupElement.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                
                const responses = getCurrentResponses();
                const response = responses[groupId];
                
                if (!response.most && !response.least) {
                    errorDiv.textContent = 'Please select both Most and Least for this group.';
                } else if (!response.most) {
                    errorDiv.textContent = 'Please select a Most like me option.';
                } else if (!response.least) {
                    errorDiv.textContent = 'Please select a Least like me option.';
                } else if (response.most === response.least) {
                    errorDiv.textContent = 'Most and Least cannot be the same. Please select different options.';
                }
            }
        }
    });

    // Scroll to first incomplete group
    if (groupIds.length > 0) {
        const firstIncomplete = document.getElementById(`group-${groupIds[0]}`);
        if (firstIncomplete) {
            firstIncomplete.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

/**
 * Clear all selections (for testing/reset)
 */
export function clearAllSelections() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
}

export default {
    loadQuestions,
    getQuestions,
    renderQuestions,
    getCurrentResponses,
    highlightIncompleteGroups,
    clearAllSelections
};
