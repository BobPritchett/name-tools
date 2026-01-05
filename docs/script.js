import {
    parseName,
    parseNameList,
    parsePersonName,
    formatName,
    isPerson,
    isOrganization,
    isFamily,
    isCompound
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

    // Use parseNameList to handle newlines, semicolons, and emails
    const recipients = parseNameList(inputContent);

    if (recipients.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a name to see results...</p>';
        demoActions.style.display = 'none';
        return;
    }

    try {
        let html = '';

        // Single input - show detailed entity classification
        if (recipients.length === 1) {
            const recipient = recipients[0];
            const entity = recipient.display || parseName(recipient.raw);

            // Entity Classification section
            html += `
                <div class="result-group">
                    <h3>Entity Classification</h3>
                    <div class="entity-result">
                        <span class="entity-kind entity-kind-${entity.kind}">${entity.kind}</span>
                        <span class="entity-confidence">Confidence: ${(entity.meta.confidence * 100).toFixed(0)}%</span>
                    </div>
                    ${recipient.email ? `<div class="email-info"><strong>Email:</strong> <code>${escapeHtml(recipient.email)}</code></div>` : ''}
                    ${renderEntityDetails(entity)}
                </div>
            `;

            // Only show parsed components table for person entities
            if (isPerson(entity)) {
                const parsed = parsePersonName(recipient.raw);
                html += `
                    <div class="result-group">
                        <h3>Parsed Components</h3>
                        <table class="parsed-table">
                            <thead>
                                <tr>
                                    <th>Prefix</th>
                                    <th>First</th>
                                    <th>Nickname</th>
                                    <th>Middle</th>
                                    <th>Last</th>
                                    <th>Suffix</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${escapeHtml(parsed.prefix || '-')}</td>
                                    <td>${escapeHtml(parsed.first || '-')}</td>
                                    <td>${escapeHtml(parsed.nickname || '-')}</td>
                                    <td>${escapeHtml(parsed.middle || '-')}</td>
                                    <td>${escapeHtml(parsed.last || '-')}</td>
                                    <td>${escapeHtml(parsed.suffix || '-')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;

                // Extended details for person
                html += `
                    <div class="result-group">
                        ${renderExtendedPanel(parsed)}
                    </div>
                `;
            }

            // Formatted outputs - use the entity directly for proper formatting
            html += `
                <div class="result-group">
                    <h3>Formatted Outputs</h3>
                    <div class="formatted-outputs">
                        <div class="formatted-item"><strong>Display:</strong> <span>${escapeHtml(formatName(entity))}</span></div>
                        <div class="formatted-item"><strong>Formal Full:</strong> <span>${escapeHtml(formatName(entity, { preset: 'formalFull' }))}</span></div>
                        <div class="formatted-item"><strong>Formal Short:</strong> <span>${escapeHtml(formatName(entity, { preset: 'formalShort' }))}</span></div>
                        <div class="formatted-item"><strong>Alphabetical:</strong> <span>${escapeHtml(formatName(entity, { preset: 'alphabetical' }))}</span></div>
                        <div class="formatted-item"><strong>Informal:</strong> <span>${escapeHtml(formatName(entity, { preset: 'informal' }))}</span></div>
                    </div>
                </div>
            `;

        } else {
            // Multiple inputs - show classification for each and list formatting
            const hasAnyEmail = recipients.some(r => r.email);

            html += `
                <div class="result-group">
                    <h3>Parsed Recipients (${recipients.length})</h3>
                    <table class="parsed-table entity-table">
                        <thead>
                            <tr>
                                <th>Input</th>
                                <th>Kind</th>
                                ${hasAnyEmail ? '<th>Email</th>' : ''}
                                <th>Conf.</th>
                                <th>Display</th>
                                <th>Formal Full</th>
                                <th>Alphabetical</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            const entities = [];
            recipients.forEach((recipient) => {
                const entity = recipient.display || parseName(recipient.raw);
                entities.push(entity);
                const tooltipText = getEntityTooltip(entity);
                html += `
                    <tr class="entity-row" title="${escapeHtml(tooltipText)}">
                        <td class="test-input">${escapeHtml(recipient.raw)}</td>
                        <td><span class="entity-kind entity-kind-${entity.kind}" style="padding: 2px 8px; font-size: 11px;">${entity.kind}</span></td>
                        ${hasAnyEmail ? `<td class="email-cell">${recipient.email ? escapeHtml(recipient.email) : '-'}</td>` : ''}
                        <td class="confidence-cell">${(entity.meta.confidence * 100).toFixed(0)}%</td>
                        <td class="format-cell">${escapeHtml(formatName(entity))}</td>
                        <td class="format-cell">${escapeHtml(formatName(entity, { preset: 'formalFull' }))}</td>
                        <td class="format-cell">${escapeHtml(formatName(entity, { preset: 'alphabetical' }))}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            // Show list/couple formatting
            if (recipients.length === 2) {
                html += `
                    <div class="result-group">
                        <h3>Combined Formats</h3>
                        <div class="formatted-outputs">
                            <div class="formatted-item"><strong>List:</strong> <span>${escapeHtml(formatName(entities, { join: 'list' }))}</span></div>
                            <div class="formatted-item"><strong>Couple:</strong> <span>${escapeHtml(formatName(entities, { join: 'couple' }))}</span></div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="result-group">
                        <h3>Combined Formats</h3>
                        <div class="formatted-outputs">
                            <div class="formatted-item"><strong>List:</strong> <span>${escapeHtml(formatName(entities, { join: 'list' }))}</span></div>
                        </div>
                    </div>
                `;
            }
        }

        resultsDiv.innerHTML = html;
        demoActions.style.display = 'flex';

        // Main copy button
        const copyJsonBtn = document.getElementById('copyJsonBtn');
        copyJsonBtn.onclick = () => {
            const json = JSON.stringify(recipients, null, 2);
            copyToClipboard(json, copyJsonBtn);
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

function renderEntityDetails(entity) {
    let html = '<div class="entity-details">';

    if (isPerson(entity)) {
        html += `
            <table class="details-kv">
                <tbody>
                    ${entity.honorific ? `<tr><th>Honorific</th><td>${escapeHtml(entity.honorific)}</td></tr>` : ''}
                    ${entity.given ? `<tr><th>Given</th><td>${escapeHtml(entity.given)}</td></tr>` : ''}
                    ${entity.middle ? `<tr><th>Middle</th><td>${escapeHtml(entity.middle)}</td></tr>` : ''}
                    ${entity.family ? `<tr><th>Family</th><td>${escapeHtml(entity.family)}</td></tr>` : ''}
                    ${entity.suffix ? `<tr><th>Suffix</th><td>${escapeHtml(entity.suffix)}</td></tr>` : ''}
                    ${entity.nickname ? `<tr><th>Nickname</th><td>${escapeHtml(entity.nickname)}</td></tr>` : ''}
                </tbody>
            </table>
        `;
    } else if (isOrganization(entity)) {
        html += `
            <table class="details-kv">
                <tbody>
                    <tr><th>Base Name</th><td>${escapeHtml(entity.baseName)}</td></tr>
                    ${entity.legalForm ? `<tr><th>Legal Form</th><td>${escapeHtml(entity.legalForm)}</td></tr>` : ''}
                    ${entity.legalSuffixRaw ? `<tr><th>Legal Suffix</th><td>${escapeHtml(entity.legalSuffixRaw)}</td></tr>` : ''}
                </tbody>
            </table>
        `;
    } else if (isFamily(entity)) {
        html += `
            <table class="details-kv">
                <tbody>
                    <tr><th>Family Name</th><td>${escapeHtml(entity.familyName)}</td></tr>
                    ${entity.article ? `<tr><th>Article</th><td>${escapeHtml(entity.article)}</td></tr>` : ''}
                    ${entity.familyWord ? `<tr><th>Family Word</th><td>${escapeHtml(entity.familyWord)}</td></tr>` : ''}
                    <tr><th>Style</th><td>${escapeHtml(entity.style)}</td></tr>
                </tbody>
            </table>
        `;
    } else if (isCompound(entity)) {
        html += `
            <table class="details-kv">
                <tbody>
                    <tr><th>Connector</th><td>${escapeHtml(entity.connector)}</td></tr>
                    ${entity.sharedFamily ? `<tr><th>Shared Family</th><td>${escapeHtml(entity.sharedFamily)}</td></tr>` : ''}
                    <tr><th>Members</th><td>${entity.members.length} member(s)</td></tr>
                </tbody>
            </table>
        `;
        // Show member details
        if (entity.members.length > 0) {
            html += '<div style="margin-top: 12px;"><strong>Members:</strong></div>';
            entity.members.forEach((member, i) => {
                if (member.kind === 'person') {
                    html += `<div style="margin-left: 16px; margin-top: 4px;">
                        ${i + 1}. ${escapeHtml(member.given || '')} ${escapeHtml(member.family || '')}
                    </div>`;
                } else {
                    html += `<div style="margin-left: 16px; margin-top: 4px;">
                        ${i + 1}. ${escapeHtml(member.text || '')}
                    </div>`;
                }
            });
        }
    } else {
        html += `<p>Text: ${escapeHtml(entity.text || entity.meta?.raw || '')}</p>`;
    }

    // Show reasons
    if (entity.meta.reasons && entity.meta.reasons.length > 0) {
        html += `<div class="entity-reasons"><strong>Reasons:</strong> ${entity.meta.reasons.map(r => `<code>${escapeHtml(r)}</code>`).join(', ')}</div>`;
    }

    html += '</div>';
    return html;
}

function getEntityTooltip(entity) {
    let parts = [];

    // Component details section
    parts.push('── Components ──');
    if (isPerson(entity)) {
        if (entity.honorific) parts.push(`Honorific: ${entity.honorific}`);
        if (entity.given) parts.push(`Given: ${entity.given}`);
        if (entity.middle) parts.push(`Middle: ${entity.middle}`);
        if (entity.family) parts.push(`Family: ${entity.family}`);
        if (entity.suffix) parts.push(`Suffix: ${entity.suffix}`);
        if (entity.nickname) parts.push(`Nickname: ${entity.nickname}`);
        if (entity.reversed) parts.push(`Reversed: yes`);
    } else if (isOrganization(entity)) {
        parts.push(`Base Name: ${entity.baseName}`);
        if (entity.legalForm) parts.push(`Legal Form: ${entity.legalForm}`);
        if (entity.legalSuffixRaw) parts.push(`Legal Suffix: ${entity.legalSuffixRaw}`);
    } else if (isFamily(entity)) {
        parts.push(`Family Name: ${entity.familyName}`);
        if (entity.article) parts.push(`Article: ${entity.article}`);
        if (entity.familyWord) parts.push(`Family Word: ${entity.familyWord}`);
        parts.push(`Style: ${entity.style}`);
    } else if (isCompound(entity)) {
        parts.push(`Connector: ${entity.connector}`);
        if (entity.sharedFamily) parts.push(`Shared Family: ${entity.sharedFamily}`);
        const memberNames = entity.members.map(m => {
            if (m.kind === 'person') {
                return `${m.given || ''}${m.family ? ' ' + m.family : ''}`.trim();
            }
            return m.text || '';
        }).filter(Boolean);
        if (memberNames.length > 0) {
            parts.push(`Members: ${memberNames.join(', ')}`);
        }
    } else {
        parts.push(`Text: ${entity.text || entity.meta?.raw || ''}`);
    }

    // Formatted outputs section
    parts.push('');
    parts.push('── Formats ──');
    parts.push(`Display: ${formatName(entity)}`);
    parts.push(`Formal Full: ${formatName(entity, { preset: 'formalFull' })}`);
    parts.push(`Formal Short: ${formatName(entity, { preset: 'formalShort' })}`);
    parts.push(`Alphabetical: ${formatName(entity, { preset: 'alphabetical' })}`);
    parts.push(`Informal: ${formatName(entity, { preset: 'informal' })}`);

    // Add reasons
    if (entity.meta.reasons && entity.meta.reasons.length > 0) {
        parts.push('');
        parts.push(`Reasons: ${entity.meta.reasons.join(', ')}`);
    }

    return parts.join('\n');
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
            // Parse the name using legacy parsePersonName
            const actual = parsePersonName(input);

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
