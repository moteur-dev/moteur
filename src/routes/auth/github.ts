import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser } from '@/api/users';
import { randomUUID } from 'crypto';
import { generateJWT } from '@/api/auth';
import { User } from '@/types/User';
import type { OpenAPIV3 } from 'openapi-types';

const githubAuthRoute = Router();

// Redirect to GitHub OAuth
githubAuthRoute.get('/github', (req, res) => {
    const clientId = process.env.AUTH_GITHUB_CLIENT_ID!;
    const redirectUri = process.env.AUTH_GITHUB_REDIRECT_URI!;
    const state = randomUUID(); // Optional: save to session/cookie for CSRF protection

    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=read:user user:email&state=${state}`;

    res.redirect(githubUrl);
});

// Handle github OAuth callback: login user if email matches
githubAuthRoute.get('/github/callback', async (req: any, res: any) => {
    const code = req.query.code as string;

    if (!code) return res.status(400).json({ error: 'Missing code' });

    try {
        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.AUTH_GITHUB_CLIENT_ID,
                client_secret: process.env.AUTH_GITHUB_CLIENT_SECRET,
                code
            },
            {
                headers: { Accept: 'application/json' }
            }
        );

        const accessToken = tokenRes.data.access_token;

        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const emailsRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const email = emailsRes.data.find((e: any) => e.primary && e.verified)?.email;
        if (!email) {
            res.status(401).json({ error: 'Error with github user' });
        }
        const profile = userRes.data;

        const userId = `github:${profile.id}`;
        let user = await getUserByEmail(email);

        if (!user) {
            user = {
                id: `user:${randomUUID()}`, // or github: prefix if you want to track origin
                isActive: true,
                email,
                name: profile.name || profile.login,
                //avatar: profile.avatar_url,
                roles: ['user'],
                auth: {
                    githubId: profile.id
                },
                projects: []
            };
            createUser(user as User);
        }

        const token = generateJWT(user);

        res.redirect(`/auth/success?token=${token}`);
    } catch (err) {
        console.error('GitHub callback error:', err);
        res.status(500).json({ error: 'GitHub login failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/auth/github': {
        get: {
            summary: 'Redirect to GitHub login',
            tags: ['Auth'],
            description: 'Redirects the user to GitHub’s OAuth login screen.',
            responses: {
                '302': {
                    description: 'Redirect to GitHub OAuth screen'
                }
            }
        }
    },
    '/auth/github/callback': {
        get: {
            summary: 'GitHub OAuth callback',
            tags: ['Auth'],
            description:
                'Handles the callback from GitHub, fetches the user profile, creates or reuses a user, and returns a JWT via redirect.',
            parameters: [
                {
                    name: 'code',
                    in: 'query',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '302': {
                    description: 'Redirect with JWT token in URL'
                },
                '400': {
                    description: 'Missing code or invalid request',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'OAuth or server error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default githubAuthRoute;
