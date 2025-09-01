import { Client } from '@upstash/qstash';
const token = process.env.QSTASH_TOKEN;

export const qstash = token ? new Client({ token }) : null;