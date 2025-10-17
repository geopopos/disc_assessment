/**
 * DISC Scoring Module
 * Calculates DISC personality scores from Most/Least selections
 */

/**
 * Calculate DISC scores from assessment responses
 * @param {Object} responses - Object with groupId as keys, {most: string, least: string} as values
 * @param {Array} items - Array of question groups from disc_items.json
 * @returns {Object} - Scoring results with totals, primary type, and order
 */
export function calculateScores(responses, items) {
    // Initialize scores
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    const debug = { most: { D: 0, I: 0, S: 0, C: 0 }, least: { D: 0, I: 0, S: 0, C: 0 } };

    // Process each group
    items.forEach(group => {
        const groupId = group.id;
        const response = responses[groupId];

        if (!response) return;

        // Find dimensions for Most and Least selections
        const mostItem = group.items.find(item => item.label === response.most);
        const leastItem = group.items.find(item => item.label === response.least);

        if (mostItem) {
            scores[mostItem.dim] += 1;
            debug.most[mostItem.dim] += 1;
        }

        if (leastItem) {
            scores[leastItem.dim] -= 1;
            debug.least[leastItem.dim] += 1;
        }
    });

    // Calculate primary type and order
    const sortedDimensions = Object.entries(scores)
        .sort((a, b) => b[1] - a[1]); // Sort by score descending

    const primaryType = determinePrimaryType(sortedDimensions);
    const typeOrder = sortedDimensions.map(([dim]) => dim).join('>');

    return {
        scores,
        primaryType,
        typeOrder,
        debug: JSON.stringify(debug)
    };
}

/**
 * Determine primary DISC type, handling ties
 * @param {Array} sortedDimensions - Array of [dimension, score] tuples sorted by score
 * @returns {string} - Primary type (e.g., "High D", "DI", etc.)
 */
function determinePrimaryType(sortedDimensions) {
    const topScore = sortedDimensions[0][1];
    const tiedDimensions = sortedDimensions.filter(([_, score]) => score === topScore);

    if (tiedDimensions.length === 1) {
        return `High ${tiedDimensions[0][0]}`;
    } else if (tiedDimensions.length === 2) {
        return tiedDimensions.map(([dim]) => dim).join('');
    } else if (tiedDimensions.length === 3) {
        return tiedDimensions.map(([dim]) => dim).join('');
    } else {
        // All four tied (rare)
        return 'Balanced';
    }
}

/**
 * Validate that all groups have been completed
 * @param {Object} responses - Object with groupId as keys
 * @param {number} totalGroups - Total number of groups to validate
 * @returns {Object} - {isValid: boolean, missingGroups: Array}
 */
export function validateResponses(responses, totalGroups) {
    const missingGroups = [];

    for (let i = 1; i <= totalGroups; i++) {
        const response = responses[i];
        if (!response || !response.most || !response.least) {
            missingGroups.push(i);
        } else if (response.most === response.least) {
            // Same selection for both Most and Least
            missingGroups.push(i);
        }
    }

    return {
        isValid: missingGroups.length === 0,
        missingGroups
    };
}

/**
 * Get DISC type description
 * @param {string} primaryType - Primary DISC type
 * @returns {Object} - Description object with traits and tips
 */
export function getTypeDescription(primaryType) {
    const descriptions = {
        'High D': {
            title: 'Dominance (D)',
            traits: ['Results-focused', 'Direct communicator', 'Decisive', 'Competitive', 'Independent'],
            worksWith: [
                'Provide clear outcomes and goals',
                'Allow autonomy and decision-making authority',
                'Be direct and concise in communication',
                'Focus on results rather than process'
            ],
            bestRoles: ['Leadership', 'Project Management', 'Sales', 'Entrepreneurship']
        },
        'High I': {
            title: 'Influence (I)',
            traits: ['Enthusiastic', 'Optimistic', 'Persuasive', 'Sociable', 'Trusting'],
            worksWith: [
                'Provide opportunities for collaboration',
                'Recognize achievements publicly',
                'Allow time for discussion and brainstorming',
                'Create a positive, energetic environment'
            ],
            bestRoles: ['Sales', 'Marketing', 'Public Relations', 'Customer Relations']
        },
        'High S': {
            title: 'Steadiness (S)',
            traits: ['Patient', 'Loyal', 'Supportive', 'Calm', 'Consistent'],
            worksWith: [
                'Provide clear processes and expectations',
                'Allow time to adapt to change',
                'Create stable, harmonious environment',
                'Show appreciation for their reliability'
            ],
            bestRoles: ['Customer Service', 'Human Resources', 'Healthcare', 'Administration']
        },
        'High C': {
            title: 'Conscientiousness (C)',
            traits: ['Analytical', 'Precise', 'Systematic', 'Careful', 'Quality-focused'],
            worksWith: [
                'Provide detailed information and data',
                'Allow time for thorough analysis',
                'Respect need for accuracy and quality',
                'Minimize surprises and sudden changes'
            ],
            bestRoles: ['Data Analysis', 'Engineering', 'Accounting', 'Research', 'Quality Assurance']
        },
        'DI': {
            title: 'Dominance-Influence (DI)',
            traits: ['Ambitious', 'Persuasive', 'Bold', 'Outgoing', 'Results-driven'],
            worksWith: [
                'Provide challenging goals with social interaction',
                'Allow independence while encouraging teamwork',
                'Focus on both outcomes and people',
                'Offer variety and new opportunities'
            ],
            bestRoles: ['Executive Leadership', 'Business Development', 'Consulting']
        },
        'DC': {
            title: 'Dominance-Conscientiousness (DC)',
            traits: ['Determined', 'Systematic', 'Independent', 'Quality-focused', 'Strategic'],
            worksWith: [
                'Provide clear goals with high standards',
                'Allow autonomy to execute plans',
                'Focus on results and accuracy',
                'Minimize unnecessary interaction'
            ],
            bestRoles: ['Project Management', 'Technical Leadership', 'Strategy']
        },
        'IS': {
            title: 'Influence-Steadiness (IS)',
            traits: ['Friendly', 'Patient', 'Cooperative', 'Supportive', 'Optimistic'],
            worksWith: [
                'Create collaborative environment',
                'Provide recognition and stability',
                'Allow time for relationship building',
                'Focus on team harmony'
            ],
            bestRoles: ['Customer Service', 'Team Coordination', 'Community Management']
        },
        'SC': {
            title: 'Steadiness-Conscientiousness (SC)',
            traits: ['Reliable', 'Methodical', 'Patient', 'Thorough', 'Consistent'],
            worksWith: [
                'Provide clear processes and procedures',
                'Allow time for careful work',
                'Create stable, structured environment',
                'Appreciate attention to detail'
            ],
            bestRoles: ['Operations', 'Administration', 'Compliance', 'Quality Control']
        },
        'Balanced': {
            title: 'Balanced Profile',
            traits: ['Adaptable', 'Versatile', 'Flexible', 'Well-rounded', 'Situational'],
            worksWith: [
                'Provide varied responsibilities',
                'Allow flexibility in approach',
                'Recognize adaptability',
                'Offer diverse challenges'
            ],
            bestRoles: ['General Management', 'Consulting', 'Multiple Roles']
        }
    };

    return descriptions[primaryType] || descriptions['Balanced'];
}

/**
 * Basic unit tests for scoring logic
 * Run in browser console: scoring.runTests()
 */
export function runTests() {
    console.log('Running DISC Scoring Tests...\n');

    // Test 1: Basic scoring
    const testItems = [
        {
            id: 1,
            items: [
                {label: "Decisive", dim: "D"},
                {label: "Enthusiastic", dim: "I"},
                {label: "Patient", dim: "S"},
                {label: "Precise", dim: "C"}
            ]
        }
    ];

    const testResponses1 = {
        1: { most: "Decisive", least: "Patient" }
    };

    const result1 = calculateScores(testResponses1, testItems);
    console.assert(result1.scores.D === 1, 'Test 1a: D should be +1');
    console.assert(result1.scores.S === -1, 'Test 1b: S should be -1');
    console.assert(result1.scores.I === 0, 'Test 1c: I should be 0');
    console.assert(result1.scores.C === 0, 'Test 1d: C should be 0');
    console.assert(result1.primaryType === 'High D', 'Test 1e: Primary should be High D');
    console.log('✓ Test 1: Basic scoring passed');

    // Test 2: Validation
    const validation1 = validateResponses({ 1: { most: "A", least: "B" } }, 1);
    console.assert(validation1.isValid === true, 'Test 2a: Valid response');
    
    const validation2 = validateResponses({ 1: { most: "A", least: "A" } }, 1);
    console.assert(validation2.isValid === false, 'Test 2b: Same selection should be invalid');
    
    const validation3 = validateResponses({}, 1);
    console.assert(validation3.isValid === false, 'Test 2c: Missing response should be invalid');
    console.log('✓ Test 2: Validation passed');

    // Test 3: Tie handling
    const testResponses3 = {
        1: { most: "Decisive", least: "Precise" },
        2: { most: "Enthusiastic", least: "Patient" }
    };
    const testItems3 = [
        {
            id: 1,
            items: [
                {label: "Decisive", dim: "D"},
                {label: "Enthusiastic", dim: "I"},
                {label: "Patient", dim: "S"},
                {label: "Precise", dim: "C"}
            ]
        },
        {
            id: 2,
            items: [
                {label: "Decisive", dim: "D"},
                {label: "Enthusiastic", dim: "I"},
                {label: "Patient", dim: "S"},
                {label: "Precise", dim: "C"}
            ]
        }
    ];
    const result3 = calculateScores(testResponses3, testItems3);
    console.assert(result3.scores.D === 1, 'Test 3a: D should be +1');
    console.assert(result3.scores.I === 1, 'Test 3b: I should be +1');
    console.assert(result3.primaryType === 'DI', 'Test 3c: Primary should be DI (tie)');
    console.log('✓ Test 3: Tie handling passed');

    console.log('\n✓ All tests passed!');
}

// Export for use in assessment form
export default {
    calculateScores,
    validateResponses,
    getTypeDescription,
    runTests
};
