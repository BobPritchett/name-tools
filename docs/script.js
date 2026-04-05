import {
    parseName,
    parseNameList,
    parsePersonName,
    formatName,
    isPerson,
    isOrganization,
    isFamily,
    isCompound,
    createGenderDB,
    getPronounSet,
    getPronouns,
    extractPronouns,
    BUILT_IN_PRONOUNS
} from './name-tools.js';

// Initialize gender database (singleton)
const genderDB = createGenderDB();

// Global variable to hold examples data
let examplesData = null;

// Helper function to get gender display for an entity
function getGenderDisplay(entity) {
    if (!isPerson(entity)) {
        return '?';
    }
    const firstName = entity.given || '';
    if (!firstName) {
        return '?';
    }
    const gender = genderDB.guessGender(firstName);
    if (gender === 'male') return 'M';
    if (gender === 'female') return 'F';
    return '?';
}

// Helper function to format probability as percentage
function formatProbability(prob) {
    if (prob === null) return '-';
    return (prob * 100).toFixed(1) + '%';
}

// Demo functionality
function updateResults() {
    const nameInput = document.getElementById('nameInput');
    const resultsDiv = document.getElementById('results');
    const demoActions = document.getElementById('demoActions');
    const inputContent = nameInput.value.trim();

    const formatOptionsDiv = document.getElementById('formatOptions');

    if (!inputContent) {
        resultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a name to see results...</p>';
        demoActions.style.display = 'none';
        if (formatOptionsDiv) formatOptionsDiv.style.display = 'none';
        return;
    }

    // Use parseNameList to handle newlines, semicolons, and emails
    const recipients = parseNameList(inputContent);

    if (recipients.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a name to see results...</p>';
        demoActions.style.display = 'none';
        if (formatOptionsDiv) formatOptionsDiv.style.display = 'none';
        return;
    }

    // Show format options when multiple recipients
    if (formatOptionsDiv) {
        formatOptionsDiv.style.display = recipients.length > 1 ? 'flex' : 'none';
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
                const parsed = parsePersonName(entity.meta?.raw || recipient.raw);
                html += `
                    <div class="result-group">
                        <h3>Parsed Components</h3>
                        <table class="parsed-table">
                            <thead>
                                <tr>
                                    <th>Prefix</th>
                                    <th>First</th>
                                    <th>Full Given</th>
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
                                    <td>${escapeHtml(parsed.fullGiven || '-')}</td>
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
                        <div class="formatted-item"><strong>Expanded Full:</strong> <span>${escapeHtml(formatName(entity, { preset: 'expandedFull' }))}</span></div>
                        <div class="formatted-item"><strong>Alphabetical:</strong> <span>${escapeHtml(formatName(entity, { preset: 'alphabetical' }))}</span></div>
                        <div class="formatted-item"><strong>Library:</strong> <span>${escapeHtml(formatName(entity, { preset: 'library' }))}</span></div>
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
                                <th>Gender</th>
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
                const genderDisplay = getGenderDisplay(entity);
                html += `
                    <tr class="entity-row" title="${escapeHtml(tooltipText)}">
                        <td class="test-input">${escapeHtml(recipient.raw)}</td>
                        <td><span class="entity-kind entity-kind-${entity.kind}" style="padding: 2px 8px; font-size: 11px;">${entity.kind}</span></td>
                        <td class="gender-cell">${genderDisplay}</td>
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

            // Show combined formatting with options
            html += renderCombinedFormats(entities);

            // Show round-trip verification
            html += renderRoundTrip(entities);
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
        resultsDiv.innerHTML = `<p style="color: #cf222e; font-size: 14px;">Error: ${escapeHtml(error.message)}</p>`;
        demoActions.style.display = 'none';
    }
}

function getFormatOptions() {
    const preset = document.getElementById('optPreset')?.value || 'display';
    const join = document.getElementById('optJoin')?.value || 'list';
    const conjunction = document.getElementById('optConjunction')?.value || 'and';
    const oxfordComma = document.getElementById('optOxford')?.checked ?? true;
    return { preset, join, conjunction, oxfordComma };
}

function renderCombinedFormats(entities) {
    const opts = getFormatOptions();
    let formatted;
    try {
        formatted = formatName(entities, opts);
    } catch (e) {
        formatted = `(error: ${e.message})`;
    }

    // Also show couple format if exactly 2 entities
    let coupleHtml = '';
    if (entities.length === 2) {
        const coupleOpts = { ...opts, join: 'couple' };
        try {
            const coupleFormatted = formatName(entities, coupleOpts);
            coupleHtml = `<div class="formatted-item"><strong>Couple:</strong> <span>${escapeHtml(coupleFormatted)}</span></div>`;
        } catch (e) {
            coupleHtml = `<div class="formatted-item"><strong>Couple:</strong> <span style="color:#cf222e">(error: ${escapeHtml(e.message)})</span></div>`;
        }
    }

    return `
        <div class="result-group">
            <h3>Combined Formats</h3>
            <div class="formatted-outputs">
                <div class="formatted-item"><strong>List (${escapeHtml(opts.preset)}):</strong> <span>${escapeHtml(formatted)}</span></div>
                ${coupleHtml}
            </div>
        </div>
    `;
}

function renderRoundTrip(entities) {
    let rows = '';
    entities.forEach((entity) => {
        const original = entity.meta?.raw || '';
        const formatted = formatName(entity);
        const reparsed = parseName(formatted);
        const origKind = entity.kind;
        const reKind = reparsed.kind;
        const kindMatch = origKind === reKind;

        let fieldComparison = '';
        if (isPerson(entity) && isPerson(reparsed)) {
            const fields = ['given', 'family', 'middle', 'suffix', 'honorific'];
            fieldComparison = fields.map(f => {
                const orig = entity[f] || '';
                const re = reparsed[f] || '';
                const match = orig === re;
                return `<td class="${match ? 'round-trip-match' : 'round-trip-mismatch'}">${escapeHtml(re || '-')}</td>`;
            }).join('');
        } else {
            fieldComparison = `<td colspan="5">${escapeHtml(reparsed.meta?.raw || formatted)}</td>`;
        }

        rows += `
            <tr>
                <td>${escapeHtml(formatted)}</td>
                <td class="${kindMatch ? 'round-trip-match' : 'round-trip-mismatch'}">${reKind}</td>
                ${fieldComparison}
            </tr>
        `;
    });

    return `
        <div class="result-group round-trip-section">
            <h3>Round-trip Verification</h3>
            <p style="color: #636c76; font-size: 13px; margin-bottom: 8px;">Format → re-parse to verify fidelity. <span class="round-trip-match">Green</span> = match, <span class="round-trip-mismatch">Red</span> = mismatch.</p>
            <table class="parsed-table">
                <thead>
                    <tr>
                        <th>Formatted</th>
                        <th>Kind</th>
                        <th>Given</th>
                        <th>Family</th>
                        <th>Middle</th>
                        <th>Suffix</th>
                        <th>Honorific</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
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
        // Show detailed member information
        if (entity.members.length > 0) {
            html += '<div class="compound-members" style="margin-top: 16px;"><strong>Members:</strong></div>';
            html += `
                <table class="parsed-table" style="margin-top: 8px;">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Honorific</th>
                            <th>Given</th>
                            <th>Middle</th>
                            <th>Family</th>
                            <th>Suffix</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            entity.members.forEach((member, i) => {
                if (member.kind === 'person') {
                    html += `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${escapeHtml(member.honorific || '-')}</td>
                            <td>${escapeHtml(member.given || '-')}</td>
                            <td>${escapeHtml(member.middle || '-')}</td>
                            <td>${escapeHtml(member.family || '-')}</td>
                            <td>${escapeHtml(member.suffix || '-')}</td>
                        </tr>
                    `;
                } else {
                    html += `
                        <tr>
                            <td>${i + 1}</td>
                            <td colspan="5">${escapeHtml(member.text || '(unknown)')}</td>
                        </tr>
                    `;
                }
            });
            html += `
                    </tbody>
                </table>
            `;
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

// Gender lookup demo functionality
function updateGenderResults() {
    const genderInput = document.getElementById('genderInput');
    const genderResultsDiv = document.getElementById('genderResults');

    if (!genderInput || !genderResultsDiv) return;

    const name = genderInput.value.trim();

    if (!name) {
        genderResultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a first name to see gender probability...</p>';
        return;
    }

    const result = genderDB.lookup(name);

    if (!result.found) {
        genderResultsDiv.innerHTML = `
            <div class="gender-result">
                <div class="gender-name">${escapeHtml(name)}</div>
                <div class="gender-not-found">Name not found in database</div>
            </div>
        `;
        return;
    }

    const malePct = (result.maleProbability * 100).toFixed(1);
    const femalePct = ((1 - result.maleProbability) * 100).toFixed(1);
    const guessed = genderDB.guessGender(name); // Uses default 80% threshold
    const guessedDisplay = guessed === 'male' ? 'M' : guessed === 'female' ? 'F' : '?';
    const guessedLabel = guessed === 'male' ? 'Male' : guessed === 'female' ? 'Female' : 'Unknown';

    genderResultsDiv.innerHTML = `
        <div class="gender-result">
            <div class="gender-name">${escapeHtml(name)}</div>
            <div class="gender-probabilities">
                <div class="gender-prob gender-prob-male" style="width: ${malePct}%;">
                    <span class="gender-prob-label">Male: ${malePct}%</span>
                </div>
                <div class="gender-prob gender-prob-female" style="width: ${femalePct}%;">
                    <span class="gender-prob-label">Female: ${femalePct}%</span>
                </div>
            </div>
            <div class="gender-guess">
                <strong>guessGender()</strong> with 80% threshold:
                <span class="gender-guess-value gender-guess-${guessed}">${guessedDisplay}</span>
                <span class="gender-guess-label">(${guessedLabel})</span>
            </div>
        </div>
    `;
}

// Pronoun lookup demo functionality
function updatePronounResults() {
    const pronounInput = document.getElementById('pronounInput');
    const pronounResultsDiv = document.getElementById('pronounResults');

    if (!pronounInput || !pronounResultsDiv) return;

    const spec = pronounInput.value.trim();

    if (!spec) {
        pronounResultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a pronoun spec to see the full set...</p>';
        return;
    }

    try {
        const pronounSet = getPronounSet(spec);

        pronounResultsDiv.innerHTML = `
            <div class="pronoun-result">
                <div class="pronoun-header">
                    <span class="pronoun-id">${escapeHtml(pronounSet.id)}</span>
                    <span class="pronoun-label">${escapeHtml(pronounSet.label)}</span>
                </div>
                <table class="details-kv">
                    <tbody>
                        <tr><th>Subject</th><td class="mono">${escapeHtml(pronounSet.subject || '(empty)')}</td><td class="example">{{subject}} went to the store</td></tr>
                        <tr><th>Object</th><td class="mono">${escapeHtml(pronounSet.object || '(empty)')}</td><td class="example">I saw {{object}}</td></tr>
                        <tr><th>Possessive Det.</th><td class="mono">${escapeHtml(pronounSet.possessiveDeterminer || '(empty)')}</td><td class="example">{{possDet}} book is here</td></tr>
                        <tr><th>Possessive Pron.</th><td class="mono">${escapeHtml(pronounSet.possessivePronoun || '(empty)')}</td><td class="example">The book is {{possPron}}</td></tr>
                        <tr><th>Reflexive</th><td class="mono">${escapeHtml(pronounSet.reflexive || '(empty)')}</td><td class="example">{{reflexive}} did it</td></tr>
                    </tbody>
                </table>
                ${pronounSet.notes ? `<div class="pronoun-notes">${escapeHtml(pronounSet.notes)}</div>` : ''}
            </div>
        `;
    } catch (error) {
        pronounResultsDiv.innerHTML = `<p style="color: #cf222e; font-size: 14px;">Error: ${escapeHtml(error.message)}</p>`;
    }
}

// Entity-to-pronouns demo functionality
function updateEntityPronounResults() {
    const entityPronounInput = document.getElementById('entityPronounInput');
    const entityPronounResultsDiv = document.getElementById('entityPronounResults');

    if (!entityPronounInput || !entityPronounResultsDiv) return;

    const name = entityPronounInput.value.trim();

    if (!name) {
        entityPronounResultsDiv.innerHTML = '<p style="color: #636c76; font-size: 14px;">Enter a name to see suggested pronouns...</p>';
        return;
    }

    try {
        // First check for explicit pronouns in the name
        const extracted = extractPronouns(name);
        const entity = parseName(extracted.name);

        // Get pronouns - use explicit if extracted, otherwise use gender lookup
        let pronouns;
        let source;

        if (extracted.pronouns) {
            pronouns = extracted.pronouns;
            source = `Explicit: "${extracted.rawPronounSpec}"`;
        } else {
            pronouns = getPronouns(entity, { genderDB });
            if (isPerson(entity) && entity.given) {
                const gender = genderDB.guessGender(entity.given);
                source = gender ? `Gender lookup: ${gender}` : 'Default (unknown gender)';
            } else {
                source = `Entity type: ${entity.kind}`;
            }
        }

        entityPronounResultsDiv.innerHTML = `
            <div class="entity-pronoun-result">
                <div class="entity-info">
                    <span class="entity-kind entity-kind-${entity.kind}">${entity.kind}</span>
                    <span class="pronoun-source">${escapeHtml(source)}</span>
                </div>
                <div class="pronoun-header">
                    <span class="pronoun-id">${escapeHtml(pronouns.id)}</span>
                    <span class="pronoun-label">${escapeHtml(pronouns.label)}</span>
                </div>
                <table class="details-kv">
                    <tbody>
                        <tr><th>Subject</th><td class="mono">${escapeHtml(pronouns.subject || '(empty)')}</td></tr>
                        <tr><th>Object</th><td class="mono">${escapeHtml(pronouns.object || '(empty)')}</td></tr>
                        <tr><th>Possessive Det.</th><td class="mono">${escapeHtml(pronouns.possessiveDeterminer || '(empty)')}</td></tr>
                        <tr><th>Possessive Pron.</th><td class="mono">${escapeHtml(pronouns.possessivePronoun || '(empty)')}</td></tr>
                        <tr><th>Reflexive</th><td class="mono">${escapeHtml(pronouns.reflexive || '(empty)')}</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        entityPronounResultsDiv.innerHTML = `<p style="color: #cf222e; font-size: 14px;">Error: ${escapeHtml(error.message)}</p>`;
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const nameInput = document.getElementById('nameInput');
    const genderInput = document.getElementById('genderInput');
    const pronounInput = document.getElementById('pronounInput');
    const entityPronounInput = document.getElementById('entityPronounInput');

    // Load examples data
    await loadExamples();

    // Set up input listener for name parsing demo
    nameInput.addEventListener('input', () => {
        // Auto-expand textarea
        nameInput.style.height = 'auto';
        nameInput.style.height = nameInput.scrollHeight + 'px';
        updateResults();
    });

    // Set up format option listeners
    ['optPreset', 'optJoin', 'optConjunction'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateResults);
    });
    const oxfordEl = document.getElementById('optOxford');
    if (oxfordEl) oxfordEl.addEventListener('change', updateResults);

    // Set up input listener for gender lookup demo
    if (genderInput) {
        genderInput.addEventListener('input', updateGenderResults);
        // Initial update
        updateGenderResults();
    }

    // Set up input listener for pronoun lookup demo
    if (pronounInput) {
        pronounInput.addEventListener('input', updatePronounResults);
        // Initial update
        updatePronounResults();
    }

    // Set up input listener for entity-to-pronouns demo
    if (entityPronounInput) {
        entityPronounInput.addEventListener('input', updateEntityPronounResults);
        // Initial update
        updateEntityPronounResults();
    }

    // Initial update
    nameInput.style.height = nameInput.scrollHeight + 'px';
    updateResults();
});
