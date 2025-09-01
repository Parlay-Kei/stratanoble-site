import { Client } from '@upstash/qstash';
import { config } from './config';

// Allow build to succeed without QSTASH_TOKEN, but runtime will fail if not provided
const token = config.QSTASH_TOKEN;

// QSTASH_TOKEN will be checked at runtime when qstash functions are called

export const qstash = token ? new Client({ token }) : null;