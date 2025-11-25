import { builder } from './builder';

import './types/collectionResult';
import './types/collectionLog';
import './types/news-source';
import './types/news-item';

import './queries/collectionLogs';
import './queries/news-list';

import './mutations/collectNews';

export const schema = builder.toSchema();
