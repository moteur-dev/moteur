import { Router } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { OpenAPIV3 } from 'openapi-types';
import { getUserByEmail, createUser } from '@moteur/core/users';
import { User } from '@moteur/types/User';

const googleAuthRoute: Router = Router();

//  Redirect to Google OAuth
googleAuthRoute.get('/google', (req, res) => {
    const clientId = process.env.AUTH_GOOGLE_CLIENT_ID!;
    const redirectUri = process.env.AUTH_GOOGLE_REDIRECT_URI!;
    const state = randomUUID();

    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&response_type=code&scope=openid%20email%20profile&state=${state}`;

    res.redirect(googleUrl);
});

// Google OAuth callback
googleAuthRoute.get('/google/callback', async (req: any, res: any) => {
    const code = req.query.code as string;

    if (!code) return res.status(400).json({ error: 'Missing code' });

    try {
        const tokenRes = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                client_id: process.env.AUTH_GOOGLE_CLIENT_ID,
                client_secret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
                code,
                redirect_uri: process.env.AUTH_GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenRes.data;

        const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const profile = userInfoRes.data;

        let user = await getUserByEmail(profile.email);

        if (!user) {
            user = {
                id: `user:${randomUUID()}`,
                isActive: true,
                email: profile.email,
                name: profile.name,
                //avatar: profile.picture,
                roles: ['user'],
                auth: { googleSub: profile.sub },
                projects: []
            };
            await createUser(user as User);
        }

        const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: '1d'
        });

        const redirectUrl = process.env.AUTH_REDIRECT_AFTER_LOGIN || '/auth/callback';
        res.redirect(`${redirectUrl}?token=${token}`);
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ error: 'Google login failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/auth/google': {
        get: {
            summary: 'Redirect to Google login',
            tags: ['Auth'],
            description: 'Redirects user to Google OAuth login screen.',
            responses: {
                '302': {
                    description: 'Redirect to Google login screen'
                }
            }
        }
    },
    '/auth/google/callback': {
        get: {
            summary: 'Google OAuth callback',
            tags: ['Auth'],
            description: 'Handles callback, logs in the user, and issues a JWT.',
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
                    description: 'Missing code',
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
                    description: 'Google login error',
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

export default googleAuthRoute;
