import Cookies from 'js-cookie';
import { BkperAuthConfig } from './types';

const DEFAULT_BASE_URL = 'https://bkper.app';
const ALREADY_LOGGED_COOKIE = 'already-logged';

export class BkperAuth {

    private config: BkperAuthConfig;
    private baseUrl: string;

    private accessToken: string | undefined;

    // Authentication service endpoints
    private readonly AUTH_LOGIN_PATH = '/auth/login';
    private readonly AUTH_REFRESH_PATH = '/auth/refresh';
    private readonly AUTH_LOGOUT_PATH = '/auth/logout';

    /**
     * Creates a new BkperAuth instance.
     *
     * @param config - Optional configuration for the auth client
     *
     * @example
     * ```typescript
     * // Simple usage with defaults
     * const auth = new BkperAuth();
     *
     * // With callbacks
     * const auth = new BkperAuth({
     *   onLoginSuccess: () => console.log('Logged in!'),
     *   onLoginRequired: () => showLoginDialog(),
     *   onError: (error) => console.error(error)
     * });
     * ```
     */
    constructor(config: BkperAuthConfig = {}) {
        this.config = config;
        this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    }

    /**
     * Gets the current access token.
     *
     * @returns The access token if authenticated, undefined otherwise
     *
     * @example
     * ```typescript
     * const token = auth.getAccessToken();
     * if (token) {
     *   // Make authenticated API calls
     *   fetch('/api/data', {
     *     headers: { 'Authorization': `Bearer ${token}` }
     *   });
     * }
     * ```
     */
    getAccessToken(): string | undefined {
        return this.accessToken;
    }

    /**
     * Checks if the user has previously logged in (based on cookie presence).
     *
     * @returns true if a login cookie exists, false otherwise
     *
     * @example
     * ```typescript
     * if (auth.hasLoggedInBefore()) {
     *   // User has logged in before, attempt to refresh token
     *   await auth.init();
     * } else {
     *   // First time user, show login UI
     *   showWelcomeScreen();
     * }
     * ```
     */
    hasLoggedInBefore(): boolean {
        return Cookies.get(ALREADY_LOGGED_COOKIE) != null;
    }

    /**
     * Initializes the authentication state by attempting to refresh the access token.
     *
     * Call this method when your app loads to restore the user's session.
     * Triggers `onLoginSuccess` if a valid session exists, or `onLoginRequired` if login is needed.
     *
     * @example
     * ```typescript
     * const auth = new BkperAuth({
     *   onLoginSuccess: () => loadUserData(),
     *   onLoginRequired: () => showLoginButton()
     * });
     *
     * await auth.init();
     * ```
     */
    async init(): Promise<void> {
        try {
            await this.refresh();
            this.checkAccessToken();
        } catch (error) {
            // TODO: Phase 3 - Replace with onError callback
            if (this.config.onError) {
                this.config.onError(error as Error);
            }
        }
    }

    private checkAccessToken(): void {
        if (this.accessToken) {
            // TODO: Phase 3 - Replace with onLoginSuccess callback
            if (this.config.onLoginSuccess) {
                this.config.onLoginSuccess();
            }
        } else {
            // TODO: Phase 3 - Replace with onLoginRequired callback
            if (this.config.onLoginRequired) {
                this.config.onLoginRequired();
            }
        }
    }

    /**
     * Redirects the user to the login page.
     *
     * The user will be redirected to the authentication service to complete the login flow.
     * After successful login, they will be redirected back to the current page.
     *
     * @example
     * ```typescript
     * // Trigger login when user clicks a button
     * loginButton.addEventListener('click', () => {
     *   auth.login();
     * });
     * ```
     */
    login(): void {
        const loginUrl = this.getLoginUrl();
        self.location?.assign(loginUrl);
    }

    /**
     * Refreshes the access token using the current session.
     *
     * Attempts to get a new access token without requiring user interaction.
     * Triggers `onTokenRefresh` callback if successful.
     * Throws error if the refresh fails (network error, expired session, etc.).
     *
     * @example
     * ```typescript
     * try {
     *   await auth.refresh();
     *   console.log('Token refreshed');
     * } catch (error) {
     *   console.error('Refresh failed, user needs to log in again');
     *   auth.login();
     * }
     * ```
     */
    async refresh(): Promise<void> {

        const url = this.getRefreshUrl();

        const options: RequestInit = {
            method: 'POST',
            credentials: 'include', // Send cookies
        };

        return fetch(url, options)
            .then(response => {
                if (response.status === 200) {
                    return response.json().then(data => {
                        this.accessToken = data.accessToken;
                        Cookies.set(ALREADY_LOGGED_COOKIE, 'true');
                        // TODO: Phase 3 - Replace with onTokenRefresh callback
                        if (this.config.onTokenRefresh && this.accessToken) {
                            this.config.onTokenRefresh(this.accessToken);
                        }
                        return;
                    });
                } else if (response.status === 401) {
                    this.accessToken = undefined;
                    return;
                } else {
                    return Promise.reject(new Error(response.statusText));
                }
            })
            .catch((error) => {
                this.accessToken = undefined;
                return Promise.reject(error);
            });
    }

    /**
     * Logs out the user and redirects to the logout page.
     *
     * Triggers the `onLogout` callback before redirecting.
     * The user's session will be terminated.
     *
     * @example
     * ```typescript
     * // Logout when user clicks logout button
     * logoutButton.addEventListener('click', () => {
     *   auth.logout();
     * });
     * ```
     */
    logout(): void {
        if (this.config.onLogout) {
            this.config.onLogout();
        }
        const logoutUrl = this.getLogoutUrl();
        self.location?.assign(logoutUrl);
    }

    private getLoginUrl(): string {

        const returnUrl = encodeURIComponent(self.location.href);

        let loginUrl = `${this.baseUrl}${this.AUTH_LOGIN_PATH}?returnUrl=${returnUrl}`;

        // Add additional auth parameters if provided
        if (this.config.getAdditionalAuthParams) {
            const additionalParams = this.config.getAdditionalAuthParams();
            for (const [key, value] of Object.entries(additionalParams)) {
                loginUrl += `&${key}=${encodeURIComponent(value)}`;
            }
        }

        return loginUrl;
    }

    private getRefreshUrl(): string {

        let refreshUrl = `${this.baseUrl}${this.AUTH_REFRESH_PATH}`;

        // Add additional auth parameters if provided
        if (this.config.getAdditionalAuthParams) {
            const additionalParams = this.config.getAdditionalAuthParams();
            const params = new URLSearchParams(additionalParams);
            const queryString = params.toString();
            if (queryString) {
                refreshUrl += `?${queryString}`;
            }
        }

        return refreshUrl;
    }

    private getLogoutUrl(): string {
        return `${this.baseUrl}${this.AUTH_LOGOUT_PATH}`;
    }

}
