import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";

// fetches my credentials from .env and ensures they are both available - throws errors if not
function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || clientId.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_ID');
    }

    if (!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_SECRET');
    }

    //returns variables of stored credentials for access elsewhere
    return { clientId, clientSecret };
}


export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
            authorization: {
                params: {
                    scope: 'openid email profile',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            const dbUser = (await db.get(`user:${token.id}`)) as User | null;

            if (user) {
                // New login, store user data in the token
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            } else if (dbUser) {
                // User exists in the database, populate token from db
                token.id = dbUser.id;
                token.name = dbUser.name;
                token.email = dbUser.email;
                token.image = dbUser.image;
            } else if (!token.id) {
                // Handle missing token ID scenario
                throw new Error("Token does not have an ID");
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.image = token.image as string | null | undefined;
            }
            return session;
        },
        redirect() {
            return '/dashboard';
        },
    },
};
