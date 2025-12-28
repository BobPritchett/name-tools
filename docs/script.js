import {
    isPrefix,
    isSuffix,
    parseName,
    formatName
} from './name-tools.js';

// Global variable to hold examples data
let examplesData = null;

// Demo functionality
function updateResults() {
    const nameInput = document.getElementById('nameInput');
    const resultsDiv = document.getElementById('results');
    const demoActions = document.getElementById('demoActions');
    const inputContent = nameInput.value.trim();

    if (!inputContent) {
        resultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a name to see results...</p>';
        demoActions.style.display = 'none';
        return;
    }

    const lines = inputContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a name to see results...</p>';
        demoActions.style.display = 'none';
        return;
    }

    try {
        let html = `
            <div class="result-group">
                <table class="parsed-table">
                    <thead>
                        <tr>
                            <th>Input</th>
                            <th>Prefix</th>
                            <th>First</th>
                            <th>Nickname</th>
                            <th>Middle</th>
                            <th>Last</th>
                            <th>Suffix</th>
                            <th class="actions-col"></th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const allParsed = [];

        lines.forEach((line, index) => {
            const parsed = parseName(line);
            allParsed.push({ line, parsed });
            
            const detailsId = `details-${index}`;
            html += `
                <tr>
                    <td class="test-input">${line}</td>
                    <td>${parsed.prefix || '-'}</td>
                    <td>${parsed.first || '-'}</td>
                    <td>${parsed.nickname || '-'}</td>
                    <td>${parsed.middle || '-'}</td>
                    <td>${parsed.last || '-'}</td>
                    <td>${parsed.suffix || '-'}</td>
                    <td class="actions-col">
                        <button class="copy-row-btn" title="Copy to JSON" data-index="${index}">Copy</button>
                        <button class="copy-row-btn" title="Toggle details" data-toggle="${detailsId}">Details</button>
                    </td>
                </tr>
                <tr id="${detailsId}" class="details-row" style="display: none;">
                    <td colspan="8">
                        ${renderExtendedPanel(parsed)}
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        // For single line input, show the extended panel prominently once (outside the table)
        if (lines.length === 1) {
            html += `
                <div class="result-group">
                    ${renderExtendedPanel(allParsed[0].parsed)}
                </div>
            `;
        }

        // Formatting outputs (single entry point)
        if (lines.length === 1) {
            const parsed = allParsed[0].parsed;
            html += `
                <div class="result-group">
                    <div class="formatted-outputs">
                        <div class="formatted-item"><strong>Display:</strong> <span>${formatName(parsed)}</span></div>
                        <div class="formatted-item"><strong>Formal Full:</strong> <span>${formatName(parsed, { preset: 'formalFull' })}</span></div>
                        <div class="formatted-item"><strong>Formal Short:</strong> <span>${formatName(parsed, { preset: 'formalShort' })}</span></div>
                        <div class="formatted-item"><strong>Alphabetical:</strong> <span>${formatName(parsed, { preset: 'alphabetical' })}</span></div>
                        <div class="formatted-item"><strong>Initialed:</strong> <span>${formatName(parsed, { preset: 'initialed' })}</span></div>
                        <div class="formatted-item"><strong>Preferred Display:</strong> <span>${formatName(parsed, { preset: 'preferredDisplay' })}</span></div>
                    </div>
                </div>
            `;
        } else if (lines.length === 2) {
            // Show list + couple renderings for 2 names
            html += `
                <div class="result-group">
                    <div class="formatted-outputs">
                        <div class="formatted-item"><strong>List:</strong> <span>${formatName(lines, { join: 'list' })}</span></div>
                        <div class="formatted-item"><strong>Couple:</strong> <span>${formatName(lines, { join: 'couple' })}</span></div>
                    </div>
                </div>
            `;
        } else if (lines.length > 2) {
            // Show list rendering for 3+ names
            html += `
                <div class="result-group">
                    <div class="formatted-outputs">
                        <div class="formatted-item"><strong>List:</strong> <span>${formatName(lines, { join: 'list' })}</span></div>
                    </div>
                </div>
            `;
        }

        resultsDiv.innerHTML = html;
        demoActions.style.display = 'flex';

        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-row-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (!Number.isNaN(index)) {
                    const { line, parsed } = allParsed[index];
                    copyParsedToJson(line, parsed, btn);
                }
            });
        });

        // Toggle details buttons
        document.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-toggle');
                const row = document.getElementById(id);
                if (!row) return;
                row.style.display = row.style.display === 'none' ? '' : 'none';
            });
        });

        // Main copy button copies everything or the single one
        const copyJsonBtn = document.getElementById('copyJsonBtn');
        copyJsonBtn.onclick = () => {
            if (allParsed.length === 1) {
                copyParsedToJson(allParsed[0].line, allParsed[0].parsed, copyJsonBtn);
            } else {
                const json = JSON.stringify(allParsed.map(item => ({
                    input: item.line,
                    expected: item.parsed,
                    description: "New example"
                })), null, 2);
                copyToClipboard(json, copyJsonBtn);
            }
        };

    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: #cf222e; font-size: 14px;">Error: ${error.message}</p>`;
        demoActions.style.display = 'none';
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderTokenList(tokens) {
    if (!tokens || tokens.length === 0) return '-';
    return tokens
        .map(t => `${t.type}: ${t.value}${t.normalized ? ` (${t.normalized})` : ''}`)
        .join(', ');
}

function renderExtendedPanel(parsed) {
    const prefixTokens = renderTokenList(parsed.prefixTokens);
    const suffixTokens = renderTokenList(parsed.suffixTokens);
    const familyParts = Array.isArray(parsed.familyParts) ? parsed.familyParts.join(' ') : '-';
    const sortDisplay = parsed.sort && parsed.sort.display ? parsed.sort.display : '-';
    const sortKey = parsed.sort && parsed.sort.key ? parsed.sort.key : '-';

    return `
        <div class="details-panel">
            <details open>
                <summary>Extended ParsedName fields</summary>
                <table class="details-kv">
                    <tbody>
                        <tr><th>preferredGiven</th><td class="mono">${escapeHtml(parsed.preferredGiven || '-')}</td></tr>
                        <tr><th>prefixTokens</th><td class="mono">${escapeHtml(prefixTokens)}</td></tr>
                        <tr><th>suffixTokens</th><td class="mono">${escapeHtml(suffixTokens)}</td></tr>
                        <tr><th>familyParticle</th><td class="mono">${escapeHtml(parsed.familyParticle || '-')}</td></tr>
                        <tr><th>familyParts</th><td class="mono">${escapeHtml(familyParts)}</td></tr>
                        <tr><th>familyParticleBehavior</th><td class="mono">${escapeHtml(parsed.familyParticleBehavior || '-')}</td></tr>
                        <tr><th>sort.display</th><td class="mono">${escapeHtml(sortDisplay)}</td></tr>
                        <tr><th>sort.key</th><td class="mono">${escapeHtml(sortKey)}</td></tr>
                    </tbody>
                </table>
            </details>
        </div>
    `;
}

function copyParsedToJson(input, parsed, btn) {
    const result = {
        input,
        expected: { ...parsed },
        description: "New example"
    };
    
    // Clean up empty fields from expected to match typical style
    Object.keys(result.expected).forEach(key => {
        if (result.expected[key] === undefined || result.expected[key] === '') {
            delete result.expected[key];
        }
    });

    const json = JSON.stringify(result, null, 2);
    copyToClipboard(json, btn);
}

async function copyToClipboard(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('btn-success');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-success');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

// Load examples from JSON file
async function loadExamples() {
    try {
        const response = await fetch('examples.json');
        examplesData = await response.json();
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
            let hasMismatch = false;

            fields.forEach(field => {
                const cell = document.createElement('td');
                const actualValue = actual[field];
                const expectedValue = expected[field];
                const matches = valuesMatch(actualValue, expectedValue);

                if (!matches && (actualValue !== undefined || expectedValue !== undefined)) {
                    hasMismatch = true;
                }

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

                if (!matches && (actualValue !== undefined || expectedValue !== undefined)) {
                    // Add tooltip showing expected value
                    cell.title = `Expected: ${expectedValue !== undefined ? expectedValue : '(none)'}`;
                }

                row.appendChild(cell);
            });

            if (hasMismatch) {
                row.classList.add('mismatch-row');
            }

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

// Set up event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const nameInput = document.getElementById('nameInput');

    // Load examples data
    await loadExamples();

    // Set up input listener
    nameInput.addEventListener('input', () => {
        // Auto-expand textarea
        nameInput.style.height = 'auto';
        nameInput.style.height = nameInput.scrollHeight + 'px';
        updateResults();
    });

    // Initial update
    nameInput.style.height = nameInput.scrollHeight + 'px';
    updateResults();
});
