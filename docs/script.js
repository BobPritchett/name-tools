// Note: This is a placeholder for the demo.
// After building the library with `pnpm run build`, copy dist/index.mjs
// to docs/name-tools.js to make this demo work on GitHub Pages.

// For now, we'll include inline implementations for demo purposes
// In production, you would import from the built library file

// Simplified inline implementations for demo
const PREFIXES = ['Mr', 'Mr.', 'Mrs', 'Mrs.', 'Ms', 'Ms.', 'Miss', 'Dr', 'Dr.', 'Prof', 'Prof.', 'Rev', 'Rev.', 'Hon', 'Hon.', 'Sir', 'Lady', 'Lord'];
const SUFFIXES = ['Jr', 'Jr.', 'Sr', 'Sr.', 'II', 'III', 'IV', 'V', 'PhD', 'Ph.D.', 'MD', 'M.D.', 'Esq', 'Esq.', 'DDS', 'D.D.S.', 'JD', 'J.D.', 'MBA', 'M.B.A.', 'CPA', 'RN', 'DVM'];

// Global variable to hold examples data
let examplesData = null;

function isPrefix(str) {
    return PREFIXES.some(prefix => prefix.toLowerCase() === str.toLowerCase());
}

function isSuffix(str) {
    return SUFFIXES.some(suffix => suffix.toLowerCase() === str.toLowerCase());
}

function parseName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        throw new Error('Invalid name: expected non-empty string');
    }

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 0) {
        throw new Error('Invalid name: no parts found');
    }

    const result = {
        first: '',
        last: '',
    };

    let startIndex = 0;
    let endIndex = parts.length - 1;

    if (parts.length > 1 && isPrefix(parts[0])) {
        result.prefix = parts[0];
        startIndex = 1;
    }

    if (startIndex < endIndex && isSuffix(parts[endIndex])) {
        result.suffix = parts[endIndex];
        endIndex--;
    }

    const remainingParts = parts.slice(startIndex, endIndex + 1);

    if (remainingParts.length === 0) {
        throw new Error('Invalid name');
    }

    if (remainingParts.length === 1) {
        result.first = remainingParts[0];
        result.last = remainingParts[0];
    } else if (remainingParts.length === 2) {
        result.first = remainingParts[0];
        result.last = remainingParts[1];
    } else {
        result.first = remainingParts[0];
        result.last = remainingParts[remainingParts.length - 1];
        result.middle = remainingParts.slice(1, -1).join(' ');
    }

    return result;
}

function getInitials(fullName) {
    const parsed = parseName(fullName);
    let initials = parsed.first.charAt(0).toUpperCase();

    if (parsed.middle) {
        initials += parsed.middle.split(' ').map(m => m.charAt(0).toUpperCase()).join('');
    }

    initials += parsed.last.charAt(0).toUpperCase();

    return initials;
}

function formatLastFirst(parsed) {
    let result = parsed.last;

    if (parsed.first) {
        result += ', ' + parsed.first;
    }

    if (parsed.middle) {
        result += ' ' + parsed.middle;
    }

    if (parsed.suffix) {
        result += ', ' + parsed.suffix;
    }

    return result;
}

function formatFirstLast(parsed) {
    const parts = [];

    if (parsed.prefix) parts.push(parsed.prefix);
    if (parsed.first) parts.push(parsed.first);
    if (parsed.middle) parts.push(parsed.middle);
    if (parsed.last) parts.push(parsed.last);
    if (parsed.suffix) parts.push(parsed.suffix);

    return parts.join(' ');
}

function formatWithMiddleInitial(parsed) {
    const parts = [];

    if (parsed.prefix) parts.push(parsed.prefix);
    if (parsed.first) parts.push(parsed.first);

    if (parsed.middle) {
        const initials = parsed.middle.split(' ')
            .map(m => m.charAt(0).toUpperCase() + '.')
            .join(' ');
        parts.push(initials);
    }

    if (parsed.last) parts.push(parsed.last);
    if (parsed.suffix) parts.push(parsed.suffix);

    return parts.join(' ');
}

function formatFormal(parsed) {
    const parts = [];

    if (parsed.prefix) {
        parts.push(parsed.prefix);
    } else {
        parts.push('Mr/Ms');
    }

    if (parsed.last) {
        parts.push(parsed.last);
    }

    return parts.join(' ');
}

// Demo functionality
function updateResults() {
    const nameInput = document.getElementById('nameInput');
    const resultsDiv = document.getElementById('results');
    const fullName = nameInput.value.trim();

    if (!fullName) {
        resultsDiv.innerHTML = '<p style="color: #6c757d;">Enter a name to see results...</p>';
        return;
    }

    try {
        const parsed = parseName(fullName);
        const initials = getInitials(fullName);

        resultsDiv.innerHTML = `
            <div class="result-group">
                <h3>Parsed Components</h3>
                ${parsed.prefix ? `<div class="result-item"><span class="result-label">Prefix:</span><span class="result-value">${parsed.prefix}</span></div>` : ''}
                <div class="result-item"><span class="result-label">First:</span><span class="result-value">${parsed.first}</span></div>
                ${parsed.middle ? `<div class="result-item"><span class="result-label">Middle:</span><span class="result-value">${parsed.middle}</span></div>` : ''}
                <div class="result-item"><span class="result-label">Last:</span><span class="result-value">${parsed.last}</span></div>
                ${parsed.suffix ? `<div class="result-item"><span class="result-label">Suffix:</span><span class="result-value">${parsed.suffix}</span></div>` : ''}
            </div>

            <div class="result-group">
                <h3>Formatted Outputs</h3>
                <div class="result-item"><span class="result-label">Last, First:</span><span class="result-value">${formatLastFirst(parsed)}</span></div>
                <div class="result-item"><span class="result-label">First Last:</span><span class="result-value">${formatFirstLast(parsed)}</span></div>
                <div class="result-item"><span class="result-label">With Initials:</span><span class="result-value">${formatWithMiddleInitial(parsed)}</span></div>
                <div class="result-item"><span class="result-label">Formal:</span><span class="result-value">${formatFormal(parsed)}</span></div>
                <div class="result-item"><span class="result-label">Initials:</span><span class="result-value">${initials}</span></div>
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: #dc3545;">Error: ${error.message}</p>`;
    }
}

// Load examples from JSON file
async function loadExamples() {
    try {
        const response = await fetch('examples.json');
        examplesData = await response.json();
        populateExampleSelector();
        populateTestResultsTable();
    } catch (error) {
        console.error('Failed to load examples:', error);
    }
}

// Compare two values and return if they match
function valuesMatch(actual, expected) {
    // Handle undefined/null cases
    if (actual === undefined && expected === undefined) return true;
    if (actual === undefined || expected === undefined) return false;
    return actual === expected;
}

// Populate the test results table
function populateTestResultsTable() {
    const tbody = document.getElementById('testResultsBody');

    if (!examplesData || !tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    // Process each parse example
    examplesData.parseExamples.forEach(({ input, expected, description }) => {
        try {
            // Parse the name
            const actual = parseName(input);

            // Create row
            const row = document.createElement('tr');

            // Input column
            const inputCell = document.createElement('td');
            inputCell.className = 'test-input';
            inputCell.textContent = input;
            row.appendChild(inputCell);

            // Field columns: prefix, first, nickname, middle, last, suffix
            const fields = ['prefix', 'first', 'nickname', 'middle', 'last', 'suffix'];

            fields.forEach(field => {
                const cell = document.createElement('td');
                const actualValue = actual[field];
                const expectedValue = expected[field];
                const matches = valuesMatch(actualValue, expectedValue);

                // Set cell content
                if (actualValue !== undefined) {
                    if (field === 'nickname') {
                        cell.textContent = `"${actualValue}"`;
                        cell.className = 'nickname-cell';
                    } else {
                        cell.textContent = actualValue;
                    }
                } else {
                    cell.textContent = '-';
                    cell.className = 'empty-cell';
                }

                // Add match/mismatch class
                if (actualValue !== undefined || expectedValue !== undefined) {
                    if (matches) {
                        cell.classList.add('match');
                    } else {
                        cell.classList.add('mismatch');
                        // Add tooltip showing expected value
                        cell.title = `Expected: ${expectedValue !== undefined ? expectedValue : '(none)'}`;
                    }
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        } catch (error) {
            // Handle parsing errors
            const row = document.createElement('tr');
            row.className = 'error-row';

            const inputCell = document.createElement('td');
            inputCell.textContent = input;
            row.appendChild(inputCell);

            const errorCell = document.createElement('td');
            errorCell.colSpan = 6;
            errorCell.className = 'error-cell';
            errorCell.textContent = `Error: ${error.message}`;
            row.appendChild(errorCell);

            tbody.appendChild(row);
        }
    });
}

// Populate the example selector dropdown
function populateExampleSelector() {
    const exampleSelect = document.getElementById('exampleSelect');

    if (!examplesData || !exampleSelect) return;

    // Clear existing options
    exampleSelect.innerHTML = '<option value="">-- Try an example --</option>';

    // Add example options
    examplesData.demoExamples.forEach((example, index) => {
        const option = document.createElement('option');
        option.value = example;
        option.textContent = example;
        exampleSelect.appendChild(option);
    });
}

// Handle example selection
function handleExampleSelect(event) {
    const nameInput = document.getElementById('nameInput');
    const selectedValue = event.target.value;

    if (selectedValue) {
        nameInput.value = selectedValue;
        updateResults();
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const nameInput = document.getElementById('nameInput');
    const exampleSelect = document.getElementById('exampleSelect');

    // Load examples data
    await loadExamples();

    // Set up input listener
    nameInput.addEventListener('input', updateResults);

    // Set up example selector listener
    if (exampleSelect) {
        exampleSelect.addEventListener('change', handleExampleSelect);
    }

    // Initial update
    updateResults();
});
