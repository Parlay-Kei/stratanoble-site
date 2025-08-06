import { Client } from '@upstash/qstash';

// Allow build to succeed without QSTASH_TOKEN, but runtime will fail if not provided
const token = process.env.QSTASH_TOKEN;

// QSTASH_TOKEN will be checked at runtime when qstash functions are called

export const qstash = token ? new Client({ token }) : null;