import { supabase } from "../Config/supabase.js";

/**
 * Generate OAuth authorization URL for Google or GitHub
 * GET /api/auth/login/:provider
 */
export const getOAuthUrl = async (req, res) => {
    try {
        const { provider } = req.params;
        const validProviders = ['google', 'github'];

        if (!validProviders.includes(provider.toLowerCase())) {
            return res.status(400).json({ 
                error: `Invalid provider '${provider}'. Supported providers are: ${validProviders.join(', ')}` 
            });
        }

        const redirectTo = req.query.redirectTo || process.env.FRONTEND_URL || 'http://localhost:3000';

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider.toLowerCase(),
            options: {
                redirectTo,
                queryParams: provider.toLowerCase() === 'google' ? {
                    access_type: 'offline',
                    prompt: 'consent',
                } : {}
            }
        });

        if (error) throw error;

        return res.status(200).json({
            provider,
            url: data.url,
            message: `OAuth redirect URL generated for ${provider}`
        });
    } catch (error) {
        console.error('❌ [OAuth Error]:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Handle OAuth Callback / Code exchange
 * POST /api/auth/callback
 */
export const handleCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: "Authorization code is required" });
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        return res.status(200).json({
            session: data.session,
            user: data.user,
            message: "Authentication successful"
        });
    } catch (error) {
        console.error('❌ [Auth Callback Error]:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get Current Authenticated User from Bearer Token
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Missing or invalid authorization token" });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Invalid or expired session token" });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
                avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                provider: user.app_metadata?.provider || 'oauth',
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('❌ [GetMe Error]:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Passwordless Magic Link / Email OTP
 * POST /api/auth/magic-link
 */
export const sendMagicLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const redirectTo = req.body.redirectTo || process.env.FRONTEND_URL || 'http://localhost:3000';

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo }
        });

        if (error) throw error;

        return res.status(200).json({
            message: `Magic sign-in link dispatched to ${email}`
        });
    } catch (error) {
        console.error('❌ [Magic Link Error]:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Logout / Revoke Session
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            await supabase.auth.signOut(token).catch(() => {});
        }

        return res.status(200).json({ message: "Successfully logged out" });
    } catch (error) {
        console.error('❌ [Logout Error]:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
