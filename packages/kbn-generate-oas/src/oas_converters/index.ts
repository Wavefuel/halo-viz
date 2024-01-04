/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { OpenAPIConverter } from '../type';

import { zodConverter } from './zod';
import { kbnConfigSchemaConverter } from './kbn_config_schema';
import { catchAllConverter } from './catch_all';

const CONVERTERS: OpenAPIConverter[] = [kbnConfigSchemaConverter, zodConverter, catchAllConverter];
export const getConverter = (schema: unknown): OpenAPIConverter => {
  return CONVERTERS.find((c) => c.is(schema))!;
};
