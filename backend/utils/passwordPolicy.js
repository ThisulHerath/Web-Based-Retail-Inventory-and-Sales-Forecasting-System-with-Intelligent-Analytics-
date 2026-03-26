import crypto from 'crypto';
import https from 'https';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const PWNED_API_HOST = 'api.pwnedpasswords.com';
const PWNED_API_PATH = '/range/';
const BREACH_CHECK_ENABLED = String(process.env.PASSWORD_BREACH_CHECK_ENABLED || 'true').toLowerCase() !== 'false';
const BREACH_CHECK_TIMEOUT_MS = Number(process.env.PASSWORD_BREACH_CHECK_TIMEOUT_MS || 6000);

const fetchPwnedRange = (prefix) => new Promise((resolve, reject) => {
    const request = https.request({
        hostname: PWNED_API_HOST,
        path: `${PWNED_API_PATH}${prefix}`,
        method: 'GET',
        headers: {
            'User-Agent': '7supercity-password-check',
            'Add-Padding': 'true',
        },
    }, (response) => {
        let body = '';
        response.on('data', (chunk) => {
            body += chunk;
        });
        response.on('end', () => {
            if (response.statusCode !== 200) {
                reject(new Error(`Pwned API error: ${response.statusCode}`));
                return;
            }
            resolve(body);
        });
    });

    request.on('error', reject);
    request.setTimeout(BREACH_CHECK_TIMEOUT_MS, () => {
        request.destroy(new Error('Pwned API request timed out'));
    });
    request.end();
});

const findPwnedCount = (responseBody, suffix) => {
    const lines = responseBody.split('\n');
    for (const line of lines) {
        const [hashSuffix, count] = line.trim().split(':');
        if (hashSuffix === suffix) {
            return Number(count || 0);
        }
    }
    return 0;
};

export const checkPasswordBreached = async (password) => {
    if (!BREACH_CHECK_ENABLED || process.env.NODE_ENV === 'test') {
        return { breached: false, count: 0, skipped: true };
    }

    const hash = crypto.createHash('sha1').update(String(password), 'utf8').digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const responseBody = await fetchPwnedRange(prefix);
    const count = findPwnedCount(responseBody, suffix);

    return { breached: count > 0, count, skipped: false };
};

export const assertPasswordNotPwned = async (password) => {
    const result = await checkPasswordBreached(password);
    if (!result.skipped && result.breached) {
        throw new Error('Password has appeared in a public breach. Choose a different password.');
    }
    return true;
};
