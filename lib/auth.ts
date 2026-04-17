/**
 * lib/auth.ts
 * NextAuth v5 configuration with Google Provider and MongoDB Adapter.
 * Users are auto-created with role "customer" on first login.
 */
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongoClient';
import dbConnect from './mongodb';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // Attach user role to JWT token
    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        // Find user in our User model (created by adapter in 'users' collection)
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.userId = dbUser._id.toString();
        } else {
          token.role = 'customer';
        }
      }
      return token;
    },
    // Expose role and userId to the session object
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).userId = token.userId;
      }
      return session;
    },
  },
  events: {
    // On first sign-in, create user in our User model with role "customer"
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        await dbConnect();
        const exists = await User.findOne({ email: user.email });
        if (!exists) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: 'customer',
          });
        }
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
